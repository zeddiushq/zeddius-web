import { NextResponse, type NextRequest } from "next/server"

import { publicRequest } from "@/lib/api/client"
import { authResponseSchema } from "@/lib/api/schemas"
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from "@/lib/session"

// The only place tokens are refreshed: refresh rotates the pair, so concurrent refreshes
// would invalidate each other, and cookies can only be set before render.
export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  if (!refreshToken || request.cookies.has(ACCESS_COOKIE)) {
    return NextResponse.next()
  }

  const result = await publicRequest("POST", "/auth/refresh", {
    body: { refresh_token: refreshToken },
    schema: authResponseSchema,
  })

  if (result.ok) {
    const auth = result.data
    // Updating the request too lets this render see the new tokens.
    request.cookies.set(ACCESS_COOKIE, auth.access_token)
    request.cookies.set(REFRESH_COOKIE, auth.refresh_token)
    const response = NextResponse.next({ request })
    response.cookies.set(
      ACCESS_COOKIE,
      auth.access_token,
      accessCookieOptions(auth.expires_in)
    )
    response.cookies.set(
      REFRESH_COOKIE,
      auth.refresh_token,
      refreshCookieOptions(auth.refresh_expires_in)
    )
    return response
  }

  // Only a rejected token ends the session; a network error or 5xx leaves it for the next request.
  if (result.failure.status === 401) {
    request.cookies.delete(REFRESH_COOKIE)
    const response = NextResponse.next({ request })
    response.cookies.delete(REFRESH_COOKIE)
    return response
  }

  return NextResponse.next()
}

// Prefetches are excluded here because Next hides its prefetch header from the proxy itself.
export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}

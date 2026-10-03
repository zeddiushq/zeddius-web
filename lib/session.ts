import "server-only"

import { cookies } from "next/headers"

export const ACCESS_COOKIE = "zeddius_access_token"
export const REFRESH_COOKIE = "zeddius_refresh_token"

// AuthResponse has no expires_in, so these mirror zeddius-api's token TTLs (auth/tokens.rs).
// Access is shorter than the API's 1 hour so the browser drops the cookie before the API rejects it.
const ACCESS_MAX_AGE_SECS = 55 * 60
const REFRESH_MAX_AGE_SECS = 365 * 24 * 60 * 60

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  }
}

export const accessCookieOptions = cookieOptions(ACCESS_MAX_AGE_SECS)
export const refreshCookieOptions = cookieOptions(REFRESH_MAX_AGE_SECS)

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_COOKIE)?.value
}

// Only callable from a Server Action or Route Handler; Next forbids setting cookies during render.
export async function setSession(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const store = await cookies()
  store.set(ACCESS_COOKIE, accessToken, accessCookieOptions)
  store.set(REFRESH_COOKIE, refreshToken, refreshCookieOptions)
}

export async function clearSession(): Promise<void> {
  const store = await cookies()
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
}

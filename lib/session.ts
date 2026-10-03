import "server-only"

import { cookies } from "next/headers"

import type { AuthResponse } from "@/lib/api/types"

export const ACCESS_COOKIE = "zeddius_access_token"
export const REFRESH_COOKIE = "zeddius_refresh_token"

// The browser drops the access cookie a little before the API would reject the token,
// so the proxy sees "no cookie" and refreshes instead of forwarding a token that 401s.
const ACCESS_COOKIE_LIFETIME_FRACTION = 0.9

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  }
}

export function accessCookieOptions(expiresIn: number) {
  return cookieOptions(Math.floor(expiresIn * ACCESS_COOKIE_LIFETIME_FRACTION))
}

export function refreshCookieOptions(refreshExpiresIn: number) {
  return cookieOptions(refreshExpiresIn)
}

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_COOKIE)?.value
}

// Only callable from a Server Action or Route Handler; Next forbids setting cookies during render.
export async function setSession(
  auth: Pick<
    AuthResponse,
    "access_token" | "refresh_token" | "expires_in" | "refresh_expires_in"
  >
): Promise<void> {
  const store = await cookies()
  store.set(
    ACCESS_COOKIE,
    auth.access_token,
    accessCookieOptions(auth.expires_in)
  )
  store.set(
    REFRESH_COOKIE,
    auth.refresh_token,
    refreshCookieOptions(auth.refresh_expires_in)
  )
}

export async function clearSession(): Promise<void> {
  const store = await cookies()
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
}

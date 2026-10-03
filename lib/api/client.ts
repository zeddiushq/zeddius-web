import "server-only"

import { apiBaseUrl } from "@/lib/config"
import { getAccessToken } from "@/lib/session"
import type { ErrorResponse } from "@/lib/api/types"

const REQUEST_TIMEOUT_MS = 10_000

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Refresh lives in proxy.ts (cookies can't be set during render); callers just redirect to /login.
export class SessionExpiredError extends Error {
  constructor() {
    super("session expired")
    this.name = "SessionExpiredError"
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  try {
    const { error } = (await res.json()) as ErrorResponse
    return new ApiError(res.status, error.code, error.message)
  } catch {
    // Only infrastructure in front of the API (e.g. Cloud Run) answers outside the ErrorResponse shape.
    return new ApiError(
      res.status,
      "UNKNOWN",
      res.statusText || "Request failed"
    )
  }
}

async function send(
  path: string,
  init: RequestInit,
  accessToken?: string
): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set("Content-Type", "application/json")
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }

  try {
    return await fetch(`${apiBaseUrl()}/v1${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Couldn't reach Zeddius. Check your connection and try again."
    )
  }
}

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw await toApiError(res)
  }
  if (res.status === 204) {
    return undefined as T
  }
  return (await res.json()) as T
}

function post(body?: unknown): RequestInit {
  return {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  }
}

// Raw Response for oauth/apple, where 200, 204 and 401 each mean something different.
export async function publicFetch(
  path: string,
  body?: unknown
): Promise<Response> {
  return send(path, post(body))
}

export async function publicRequest<T = void>(
  path: string,
  body?: unknown
): Promise<T> {
  return parse<T>(await send(path, post(body)))
}

// 401 becomes SessionExpiredError; 403 (unverified email) stays an ApiError.
export async function authedRequest<T = void>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const accessToken = await getAccessToken()
  if (!accessToken) {
    throw new SessionExpiredError()
  }

  const res = await send(path, init, accessToken)
  if (res.status === 401) {
    throw new SessionExpiredError()
  }
  return parse<T>(res)
}

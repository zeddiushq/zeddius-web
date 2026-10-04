import "server-only"

import { z } from "zod"

import { getConfig } from "@/lib/config"
import { getAccessToken } from "@/lib/session"
import { errorResponseSchema } from "@/lib/api/schemas"

// Longer than zeddius-api's 10s Resend timeout, since register and resend wait on the email send.
const REQUEST_TIMEOUT_MS = 20_000

export type ApiFailure = {
  kind: "api"
  status: number
  code: string
  message: string
}

// Refresh lives in proxy.ts (cookies can't be set during render); callers just redirect to /login.
export type SessionExpired = { kind: "session-expired" }

export type ApiResult<T, F = ApiFailure> =
  { ok: true; data: T } | { ok: false; failure: F }

type Options<S extends z.ZodType> = { body?: unknown; schema?: S }

const sessionExpired: ApiResult<never, SessionExpired> = {
  ok: false,
  failure: { kind: "session-expired" },
}

async function request<S extends z.ZodType>(
  method: string,
  path: string,
  { body, schema }: Options<S>,
  token?: string
): Promise<ApiResult<z.output<S>>> {
  let res: Response
  try {
    res = await fetch(`${getConfig().apiUrl}/v1${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    return {
      ok: false,
      failure: {
        kind: "api",
        status: 0,
        code: "NETWORK_ERROR",
        message: "Couldn't reach Zeddius. Check your connection and try again.",
      },
    }
  }

  if (res.ok) {
    // No schema means S defaulted to ZodVoid, whose output is undefined.
    if (!schema) return { ok: true, data: undefined as z.output<S> }

    // A 204 parses as undefined, so only schemas marked .optional() accept it.
    const parsed = schema.safeParse(
      res.status === 204 ? undefined : await res.json()
    )
    if (!parsed.success) {
      throw new Error(
        `Unexpected response from ${method} ${path}:\n${z.prettifyError(parsed.error)}`
      )
    }
    return { ok: true, data: parsed.data }
  }

  // Only infrastructure in front of the API (e.g. Cloud Run) answers outside the ErrorResponse shape.
  const parsed = errorResponseSchema.safeParse(
    await res.json().catch(() => null)
  )
  return {
    ok: false,
    failure: {
      kind: "api",
      status: res.status,
      code: parsed.success ? parsed.data.error.code : "UNKNOWN",
      message: parsed.success
        ? parsed.data.error.message
        : res.statusText || "Request failed",
    },
  }
}

export function publicRequest<S extends z.ZodType = z.ZodVoid>(
  method: string,
  path: string,
  options: Options<S> = {}
): Promise<ApiResult<z.output<S>>> {
  return request(method, path, options)
}

// 401 becomes session-expired; 403 (unverified email) stays an api failure.
export async function authedRequest<S extends z.ZodType = z.ZodVoid>(
  method: string,
  path: string,
  options: Options<S> = {}
): Promise<ApiResult<z.output<S>, ApiFailure | SessionExpired>> {
  const token = await getAccessToken()
  if (!token) return sessionExpired

  const result = await request(method, path, options, token)
  if (!result.ok && result.failure.status === 401) return sessionExpired
  return result
}

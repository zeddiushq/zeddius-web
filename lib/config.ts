import "server-only"

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function origin(name: string): string {
  return required(name).replace(/\/+$/, "")
}

// Origin only; lib/api/client.ts appends /v1.
export function apiBaseUrl(): string {
  return origin("ZEDDIUS_API_URL")
}

// This app's own public origin, for building absolute URLs (e.g. the Apple redirect_uri).
export function webBaseUrl(): string {
  return origin("WEB_BASE_URL")
}

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

// Origin only; the client appends /v1.
export function apiBaseUrl(): string {
  return origin("ZEDDIUS_API_URL")
}

export function webBaseUrl(): string {
  return origin("WEB_BASE_URL")
}

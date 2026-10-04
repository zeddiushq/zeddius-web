import "server-only"

import { z } from "zod"

const origin = z.url().transform((url) => url.replace(/\/+$/, ""))

const envSchema = z.object({
  ZEDDIUS_API_URL: origin,
  WEB_BASE_URL: origin,
})

export type Config = {
  apiUrl: string
  webUrl: string
}

let config: Config | undefined

// Lazy so `next build` doesn't need runtime env vars; instrumentation.ts forces it at server start.
export function getConfig(): Config {
  if (!config) {
    const parsed = envSchema.safeParse(process.env)
    if (!parsed.success) {
      throw new Error(
        `Invalid environment configuration:\n${z.prettifyError(parsed.error)}`
      )
    }
    config = {
      apiUrl: parsed.data.ZEDDIUS_API_URL,
      webUrl: parsed.data.WEB_BASE_URL,
    }
  }
  return config
}

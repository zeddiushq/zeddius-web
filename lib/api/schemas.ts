import { z } from "zod"

// Hand-written; zeddius-api's OpenAPI doc is the source of truth.
// Timestamps and dates stay plain strings: strict formats would reject a harmless server change.

export const errorResponseSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
})

export const userResponseSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  username: z.string(),
  display_name: z.string(),
  onboarding_complete: z.boolean(),
  height_cm: z.number().nullable(),
  birthdate: z.string().nullable(),
  target_calories: z.number().nullable(),
  target_protein_g: z.number().nullable(),
  target_sleep_hours: z.number().nullable(),
  // rust_decimal serializes as a string, not a number.
  target_weight_kg: z.string().nullable(),
  target_wake_time: z.string().nullable(),
  target_bed_time: z.string().nullable(),
  target_weekly_runs: z.number().nullable(),
  target_weekly_lifts: z.number().nullable(),
  timezone: z.string(),
  email_verified_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const authResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  // Seconds, relative to the response.
  expires_in: z.number(),
  refresh_expires_in: z.number(),
  user: userResponseSchema,
})

export const usernameAvailableResponseSchema = z.object({
  available: z.boolean(),
})

export const sessionSchema = z.object({
  id: z.uuid(),
  created_at: z.string(),
  expires_at: z.string(),
  user_agent: z.string().nullable(),
  is_current: z.boolean(),
})

export type ErrorResponse = z.infer<typeof errorResponseSchema>
export type UserResponse = z.infer<typeof userResponseSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
export type UsernameAvailableResponse = z.infer<
  typeof usernameAvailableResponseSchema
>
export type Session = z.infer<typeof sessionSchema>

export type RegisterRequest = {
  email: string
  username: string
  display_name: string
  password: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RefreshRequest = {
  refresh_token: string
}

export type VerifyEmailRequest = {
  token: string
}

export type ForgotPasswordRequest = {
  email: string
}

export type ResetPasswordRequest = {
  token: string
  new_password: string
}

export type AppleAuthRequest = {
  identity_token: string
  nonce?: string
}

export type AppleCompleteRequest = {
  identity_token: string
  username: string
  display_name: string
  nonce?: string
}

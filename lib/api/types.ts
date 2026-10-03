// Mirrors zeddius-api's request/response types (src/auth/routes.rs, src/domain/user/model.rs).
// Hand-written; zeddius-api's /docs/openapi.json is the source of truth.

export interface ErrorResponse {
  error: {
    code: string
    message: string
  }
}

export interface UserResponse {
  id: string
  email: string
  username: string
  display_name: string
  onboarding_complete: boolean
  height_cm: number | null
  birthdate: string | null
  target_calories: number | null
  target_protein_g: number | null
  target_sleep_hours: number | null
  // rust_decimal serializes as a string, not a number.
  target_weight_kg: string | null
  target_wake_time: string | null
  target_bed_time: string | null
  target_weekly_runs: number | null
  target_weekly_lifts: number | null
  timezone: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  // Seconds, relative to this response.
  expires_in: number
  refresh_expires_in: number
  user: UserResponse
}

export interface RegisterRequest {
  email: string
  username: string
  display_name: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshRequest {
  refresh_token: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface AppleAuthRequest {
  identity_token: string
  nonce?: string
}

export interface AppleCompleteRequest {
  identity_token: string
  username: string
  display_name: string
  nonce?: string
}

export interface UsernameAvailableResponse {
  available: boolean
}

export interface Session {
  id: string
  created_at: string
  expires_at: string
  user_agent: string | null
  is_current: boolean
}

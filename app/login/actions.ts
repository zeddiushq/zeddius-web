"use server"

import { redirect } from "next/navigation"

import { publicRequest, type ApiFailure } from "@/lib/api/client"
import { authResponseSchema } from "@/lib/api/schemas"
import { loginSchema, type LoginValues } from "@/lib/auth/schemas"
import { setSession } from "@/lib/session"

function loginErrorMessage(failure: ApiFailure) {
  switch (failure.code) {
    case "UNAUTHORIZED":
      return "Incorrect email or password."
    case "TOO_MANY_REQUESTS":
      return "Too many attempts. Wait a moment and try again."
    case "NETWORK_ERROR":
    case "VALIDATION_FAILED":
      return failure.message
    default:
      return "Something went wrong. Please try again."
  }
}

export async function loginAction(
  values: LoginValues
): Promise<{ error: string }> {
  const parsed = loginSchema.safeParse(values)
  if (!parsed.success) {
    return { error: "Enter your email and password." }
  }

  const result = await publicRequest("POST", "/auth/login", {
    body: parsed.data,
    schema: authResponseSchema,
  })
  if (!result.ok) {
    return { error: loginErrorMessage(result.failure) }
  }

  await setSession(result.data)
  redirect("/overview")
}

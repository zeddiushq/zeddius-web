import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LoginForm } from "./login-form"
import { Logo } from "@/components/logo"
import { getAccessToken, getRefreshToken } from "@/lib/session"

export const metadata: Metadata = { title: "Log in" }

export default async function LoginPage() {
  if ((await getAccessToken()) || (await getRefreshToken())) {
    redirect("/overview")
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Logo />
      <LoginForm />
    </main>
  )
}

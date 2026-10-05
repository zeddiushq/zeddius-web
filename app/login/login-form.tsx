"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircleIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { loginAction } from "./actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AppleIcon, GoogleIcon } from "@/components/provider-icons"
import { loginSchema, type LoginValues } from "@/lib/auth/schemas"

export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginValues) {
    setFormError(null)
    try {
      const result = await loginAction(values)
      setFormError(result.error)
    } catch {
      setFormError("Something went wrong. Please try again.")
    }
  }

  return (
    <Frame className="w-full max-w-sm">
      <FrameHeader>
        <FrameTitle>Welcome back</FrameTitle>
        <FrameDescription>Log in to your Zeddius account</FrameDescription>
      </FrameHeader>
      <FramePanel className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            render={<a href="/api/auth/apple/start" />}
          >
            <AppleIcon />
            Continue with Apple
          </Button>
          <Button variant="outline" size="lg" className="w-full" disabled>
            <GoogleIcon />
            Google coming soon
          </Button>
        </div>
        <div className="relative h-5 text-sm">
          <Separator className="absolute inset-0 top-1/2" />
          <span className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground">
            or continue with email
          </span>
        </div>
        <Form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          {formError ? (
            <Alert variant="error">
              <AlertCircleIcon />
              <AlertTitle>Unable to log in</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                name={field.name}
                invalid={fieldState.invalid}
                touched={fieldState.isTouched}
                dirty={fieldState.isDirty}
              >
                <FieldLabel>Email</FieldLabel>
                <Input
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onValueChange={field.onChange}
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <FieldError match={!!fieldState.error}>
                  {fieldState.error?.message}
                </FieldError>
              </Field>
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                name={field.name}
                invalid={fieldState.invalid}
                touched={fieldState.isTouched}
                dirty={fieldState.isDirty}
              >
                <div className="flex w-full items-center justify-between">
                  <FieldLabel>Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onValueChange={field.onChange}
                  type="password"
                  autoComplete="current-password"
                />
                <FieldError match={!!fieldState.error}>
                  {fieldState.error?.message}
                </FieldError>
              </Field>
            )}
          />
          <Button type="submit" size="lg" loading={isSubmitting}>
            Log in
          </Button>
        </Form>
      </FramePanel>
      <FrameFooter>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </FrameFooter>
    </Frame>
  )
}

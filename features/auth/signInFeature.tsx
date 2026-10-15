"use client";

import { SignIn, useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { authAppearance } from "@/content/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { LoginForm } from "@/components/blocks/auth-forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Fields = { identifier: string; password: string; code: string };
type Step = "password" | "recover" | "reset-code" | "new-password" | "mfa";
type Factor = "email_code" | "phone_code" | "totp" | "backup_code";

export function SignInFeature() {
  const { signIn, fetchStatus } = useSignIn();
  const [step, setStep] = useState<Step>("password");
  const [factor, setFactor] = useState<Factor>("email_code");
  const [message, setMessage] = useState("");
  const [managed, setManaged] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<Fields>({
    defaultValues: { identifier: "", password: "", code: "" },
    shouldUnregister: true,
  });
  const busy = fetchStatus === "fetching" || form.formState.isSubmitting;

  async function check(result: { error: { message: string } | null }) {
    if (result.error) {
      setMessage(result.error.message);
      return false;
    }
    return true;
  }

  async function sendFactor(next: Factor) {
    setFactor(next);
    form.resetField("code");
    if (next === "email_code") await check(await signIn.mfa.sendEmailCode());
    if (next === "phone_code") await check(await signIn.mfa.sendPhoneCode());
  }

  async function advance() {
    form.resetField("password");
    form.resetField("code");
    if (signIn.status === "complete") {
      await check(
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session.currentTask) {
              setManaged(true);
              return;
            }
            window.location.assign(decorateUrl("/dashboard"));
          },
        }),
      );
    } else if (signIn.status === "needs_new_password") {
      setStep("new-password");
    } else if (
      signIn.status === "needs_second_factor" ||
      signIn.status === "needs_client_trust"
    ) {
      const supported = signIn.supportedSecondFactors?.find(({ strategy }) =>
        ["totp", "email_code", "phone_code", "backup_code"].includes(strategy),
      );
      if (!supported) {
        setManaged(true);
        return;
      }
      setStep("mfa");
      await sendFactor(supported.strategy as Factor);
    } else {
      // Clerk retains ownership of future instance requirements and session tasks.
      setManaged(true);
    }
  }

  async function submit(values: Fields) {
    setMessage("");
    try {
      if (step === "recover") {
        if (
          !(await check(await signIn.create({ identifier: values.identifier })))
        )
          return;
        if (await check(await signIn.resetPasswordEmailCode.sendCode()))
          setStep("reset-code");
        return;
      }
      if (step === "reset-code") {
        if (
          await check(
            await signIn.resetPasswordEmailCode.verifyCode({
              code: values.code,
            }),
          )
        )
          setStep("new-password");
        return;
      }
      const result =
        step === "password"
          ? await signIn.password({
              identifier: values.identifier,
              password: values.password,
            })
          : step === "new-password"
            ? await signIn.resetPasswordEmailCode.submitPassword({
                password: values.password,
              })
            : factor === "totp"
              ? await signIn.mfa.verifyTOTP({ code: values.code })
              : factor === "backup_code"
                ? await signIn.mfa.verifyBackupCode({ code: values.code })
                : factor === "phone_code"
                  ? await signIn.mfa.verifyPhoneCode({ code: values.code })
                  : await signIn.mfa.verifyEmailCode({ code: values.code });
      if (await check(result)) await advance();
    } catch {
      setMessage("Unable to connect. Please try again.");
    }
  }

  if (managed)
    return (
      <SignIn
        path="/sign-in"
        routing="path"
        appearance={authAppearance}
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
      />
    );

  return (
    <LoginForm
      title={
        step === "password"
          ? "Welcome back"
          : step === "mfa"
            ? "Verify your identity"
            : "Reset your password"
      }
      description={
        step === "password"
          ? "Enter your username and password to continue."
          : step === "recover"
            ? "Enter your username to receive a recovery code at your verified email."
            : step === "new-password"
              ? "Choose a new password."
              : "Enter your verification code to continue."
      }
    >
      <form
        onSubmit={form.handleSubmit(submit)}
        className="space-y-4"
        aria-busy={busy}
      >
        <fieldset disabled={busy} className="space-y-4 disabled:opacity-70">
          {(step === "password" || step === "recover") && (
            <div className="form-field">
              <Label htmlFor="signin-username">Username</Label>
              <Input
                id="signin-username"
                autoComplete="username"
                required
                {...form.register("identifier", { required: true })}
              />
            </div>
          )}
          {(step === "password" || step === "new-password") && (
            <div className="form-field">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <Label htmlFor="signin-password">
                  {step === "new-password" ? "New password" : "Password"}
                </Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto min-h-8 px-0 py-1"
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide password" : "Show password"}
                </Button>
              </div>
              <Input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  step === "new-password" ? "new-password" : "current-password"
                }
                required
                {...form.register("password", { required: true })}
              />
            </div>
          )}
          {(step === "reset-code" || step === "mfa") && (
            <div className="form-field">
              <Label htmlFor="signin-code">
                {factor === "backup_code" && step === "mfa"
                  ? "Backup code"
                  : "Verification code"}
              </Label>
              <Input
                id="signin-code"
                autoComplete="one-time-code"
                inputMode={factor === "backup_code" ? "text" : "numeric"}
                required
                {...form.register("code", { required: true })}
              />
            </div>
          )}
          {message && (
            <p role="alert" className="text-sm leading-relaxed">
              {message}
            </p>
          )}
          <Button type="submit" className="w-full">
            {busy
              ? "Please wait…"
              : step === "password"
                ? "Sign in"
                : step === "recover"
                  ? "Send recovery code"
                  : "Continue"}
          </Button>
          {(step === "reset-code" ||
            (step === "mfa" &&
              ["email_code", "phone_code"].includes(factor))) && (
            <Button
              type="button"
              variant="link"
              className="h-auto min-h-9 px-0 py-1"
              onClick={async () => {
                setMessage("");
                try {
                  if (step === "reset-code")
                    await check(await signIn.resetPasswordEmailCode.sendCode());
                  else await sendFactor(factor);
                } catch {
                  setMessage("Unable to send a code. Please try again.");
                }
              }}
            >
              Resend code
            </Button>
          )}
          {step === "mfa" && (
            <div className="flex flex-wrap gap-2">
              {signIn.supportedSecondFactors
                ?.filter(
                  ({ strategy }) =>
                    strategy !== factor &&
                    [
                      "totp",
                      "email_code",
                      "phone_code",
                      "backup_code",
                    ].includes(strategy),
                )
                .map(({ strategy }) => (
                  <Button
                    key={strategy}
                    type="button"
                    variant="link"
                    onClick={async () => {
                      setMessage("");
                      try {
                        await sendFactor(strategy as Factor);
                      } catch {
                        setMessage(
                          "Unable to switch verification methods. Please try again.",
                        );
                      }
                    }}
                  >
                    {
                      (
                        {
                          totp: "Authenticator app",
                          email_code: "Email code",
                          phone_code: "SMS code",
                          backup_code: "Backup code",
                        } as Record<string, string>
                      )[strategy]
                    }
                  </Button>
                ))}
            </div>
          )}
          {step !== "password" && (
            <Button
              type="button"
              variant="link"
              className="h-auto min-h-9 px-0 py-1"
              onClick={async () => {
                await signIn.reset();
                form.reset();
                setMessage("");
                setStep("password");
              }}
            >
              Back to sign in
            </Button>
          )}
        </fieldset>
        <div className="auth-secondary-actions">
          {step === "password" && (
            <Button
              type="button"
              variant="link"
              className="h-auto min-h-9 px-0 py-1"
              onClick={() => {
                form.resetField("password");
                setMessage("");
                setStep("recover");
              }}
            >
              Forgot password?
            </Button>
          )}
          <span>
            New here?{" "}
            <Link href="/sign-up" className="type-link">
              Create an account
            </Link>
          </span>
        </div>
      </form>
    </LoginForm>
  );
}

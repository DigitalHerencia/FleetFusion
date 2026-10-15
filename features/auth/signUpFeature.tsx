"use client";

import { SignUp, useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { authAppearance } from "@/content/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { SignUpForm } from "@/components/blocks/auth-forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Fields = {
  username: string;
  emailAddress: string;
  password: string;
  code: string;
};

export function SignUpFeature() {
  const { signUp, fetchStatus } = useSignUp();
  const [verifying, setVerifying] = useState(false);
  const [managed, setManaged] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<Fields>({
    defaultValues: { username: "", emailAddress: "", password: "", code: "" },
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

  async function advance() {
    form.resetField("password");
    if (signUp.status === "complete") {
      await check(
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session.currentTask) {
              setManaged(true);
              return;
            }
            window.location.assign(decorateUrl("/dashboard"));
          },
        }),
      );
    } else if (
      signUp.missingFields.length === 0 &&
      signUp.unverifiedFields.includes("email_address")
    ) {
      setVerifying(true);
      await check(await signUp.verifications.sendEmailCode());
    } else {
      // Clerk handles additional requirements when template owners change configuration.
      setManaged(true);
    }
  }

  async function submit(values: Fields) {
    setMessage("");
    try {
      const result = verifying
        ? await signUp.verifications.verifyEmailCode({ code: values.code })
        : await signUp.password({
            username: values.username,
            emailAddress: values.emailAddress,
            password: values.password,
          });
      if (await check(result)) await advance();
    } catch {
      setMessage("Unable to connect. Please try again.");
    }
  }

  if (managed)
    return (
      <SignUp
        path="/sign-up"
        routing="path"
        appearance={authAppearance}
        signInUrl="/sign-in"
        fallbackRedirectUrl="/dashboard"
      />
    );

  return (
    <SignUpForm
      title={verifying ? "Verify your email" : "Create an account"}
      description={
        verifying
          ? "Enter the code sent to your email address."
          : "Set up your account."
      }
    >
      <form
        onSubmit={form.handleSubmit(submit)}
        className="space-y-4"
        aria-busy={busy}
      >
        <fieldset disabled={busy} className="space-y-4 disabled:opacity-70">
          {!verifying ? (
            <>
              <div className="form-field">
                <Label htmlFor="signup-username" className="text-left">
                  Username
                </Label>
                <Input
                  id="signup-username"
                  autoComplete="username"
                  required
                  {...form.register("username", { required: true })}
                />
              </div>
              <div className="form-field">
                <Label htmlFor="signup-email" className="text-left">
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  required
                  {...form.register("emailAddress", { required: true })}
                />
              </div>
              <div className="form-field">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <Label htmlFor="signup-password" className="text-left">
                    Password
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
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  {...form.register("password", { required: true })}
                />
              </div>
            </>
          ) : (
            <div className="form-field">
              <Label htmlFor="signup-code">Verification code</Label>
              <Input
                id="signup-code"
                autoComplete="one-time-code"
                inputMode="numeric"
                required
                {...form.register("code", { required: true })}
              />
            </div>
          )}
          {message && (
            <p role="alert" className="text-left text-sm leading-relaxed">
              {message}
            </p>
          )}
          <Button type="submit" className="w-full">
            {busy
              ? "Please wait…"
              : verifying
                ? "Verify email"
                : "Create account"}
          </Button>
          {verifying && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="link"
                onClick={async () => {
                  setMessage("");
                  try {
                    if (await check(await signUp.verifications.sendEmailCode()))
                      setMessage("A new code has been sent.");
                  } catch {
                    setMessage("Unable to send a code. Please try again.");
                  }
                }}
              >
                Resend code
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={async () => {
                  await signUp.reset();
                  form.reset();
                  setMessage("");
                  setVerifying(false);
                }}
              >
                Change account details
              </Button>
            </div>
          )}
        </fieldset>
        {/* Smart CAPTCHA stays mounted and may display a challenge when Clerk requires one. */}
        <div id="clerk-captcha" />
        <p className="border-t border-foreground/30 pt-4 text-sm">
          Already have an account?{" "}
          <Link href="/sign-in" className="type-link">
            Sign in
          </Link>
        </p>
      </form>
    </SignUpForm>
  );
}

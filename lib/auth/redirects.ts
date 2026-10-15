import "server-only";

import { redirect } from "next/navigation";

export const SIGN_IN_PATH = "/sign-in";
export const SIGN_UP_PATH = "/sign-up";
export const DEFAULT_AUTH_REDIRECT_PATH = "/dashboard";

export function redirectToSignIn(): never {
  redirect(SIGN_IN_PATH);
}

export function redirectToSignUp(): never {
  redirect(SIGN_UP_PATH);
}

export function redirectAfterAuth(): never {
  redirect(DEFAULT_AUTH_REDIRECT_PATH);
}

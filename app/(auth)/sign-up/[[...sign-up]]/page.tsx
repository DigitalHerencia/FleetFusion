"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSignUp, useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { MapPinned, AlertCircle, CheckCircle } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const { signUp, isLoaded, setActive } = useSignUp();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const captchaRef = useRef<HTMLDivElement>(null);
  // Redirect already signed-in users away from sign-up page
  useEffect(() => {
    if (isSignedIn && isUserLoaded && user) {
      setIsRedirecting(true);
      const onboardingComplete = user.publicMetadata?.onboardingComplete as boolean | undefined;
      const organizationId = user.publicMetadata?.organizationId as string | undefined;
      const userId = user.id;
      if (onboardingComplete && organizationId && userId) {
        router.replace(`/${organizationId}/dashboard/${userId}`);
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isSignedIn, isUserLoaded, user, router]);
  if ((isSignedIn && isUserLoaded && user) || isRedirecting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-white">Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCaptchaError(false);

    // Basic validation
    if (!name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }
    
    if (!email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }
      
    if (!password.trim()) {
      setError("Password is required");
      setLoading(false);
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (!isLoaded) {
      setError("Clerk is not loaded yet. Please wait and try again.");
      setLoading(false);
      return;
    }

    if (!signUp) {
      setError("Sign up service unavailable. Please refresh and try again.");
      setLoading(false);
      return;
    }    try {
      const res = await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ").slice(1).join(" ") || undefined,
      });

      if (res.status === "complete") {
        if (res.createdSessionId) {
          await setActive({ session: res.createdSessionId });
          setIsRedirecting(true);
          router.replace("/onboarding");
        } else {
          setError("Account created but sign-in failed. Please try signing in manually.");
        }
      } else if (res.status === "missing_requirements") {
        // Email verification is required by Clerk settings
        // Instead of requiring verification, redirect to sign-in
        setError("Account created successfully! Please sign in to continue.");
        setTimeout(() => {
          router.replace("/sign-in");
        }, 2000);
      } else {
        // Handle other statuses
        setError("Account creation in progress. Please try signing in.");
        setTimeout(() => {
          router.replace("/sign-in");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      
      // Handle network errors
      if (err?.name === 'NetworkError' || err?.code === 'network_error') {
        setError("Network error. Please check your connection and try again.");
        setLoading(false);
        return;
      }
      
      // Handle CAPTCHA-specific errors
      if (err?.message?.includes('CAPTCHA') || err?.message?.includes('captcha')) {
        setCaptchaError(true);
        setError("Security verification failed. Please try refreshing the page. If the issue persists, try disabling browser extensions or using a different browser.");
        setLoading(false);
        return;
      }
      
      if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        const clerkError = err.errors[0];
        
        if (clerkError.code === "form_password_pwned") {
          setError("This password is too common. Please choose a stronger password.");
        } else if (clerkError.code === "form_password_length") {
          setError("Password is too short. Minimum 8 characters required.");
        } else if (clerkError.code === "form_identifier_exists") {
          setError("An account with this email already exists. Please sign in instead.");
        } else if (clerkError.code === "form_password_validation") {
          setError("Password must contain at least 8 characters with letters and numbers.");
        } else if (clerkError.code === "captcha_invalid") {
          setCaptchaError(true);
          setError("Security verification failed. Please try refreshing the page and trying again.");
        } else if (clerkError.code === "captcha_failed") {
          setCaptchaError(true);
          setError("Security verification failed. Please try refreshing the page and trying again.");
        } else if (clerkError.code === "form_password_size") {
          setError("Password must be between 8 and 128 characters.");
        } else if (clerkError.code === "form_identifier_invalid") {
          setError("Please enter a valid email address.");
        } else {
          setError(clerkError.message || "Sign up failed. Please try again.");
        }
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Sign up failed. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex flex-1 items-center">
            <Link 
              className="flex items-center justify-center hover:text-blue-500 hover:underline underline-offset-4" 
              href="/"
            >
              <MapPinned className="h-6 w-6 text-blue-500 mr-1" />
              <span className="font-extrabold text-white dark:text-white text-2xl">FleetFusion</span>
            </Link>
          </div> 
          <h1 className="mt-2 text-3xl font-extrabold text-white">
            CREATE YOUR ACCOUNT
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-blue-500 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>        <form
          onSubmit={handleSubmit}
          className="mt-8 bg-neutral-900 p-6 shadow-lg rounded-lg border border-neutral-800 flex flex-col gap-4"
        >
          {/* Clerk Status Indicator */}
          <div className="flex items-center gap-2 text-xs">
            {isLoaded ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <AlertCircle className="h-3 w-3 text-yellow-500" />
            )}
            <span className={isLoaded ? "text-green-400" : "text-yellow-400"}>
              Clerk Status: {isLoaded ? "Ready" : "Loading..."}
            </span>
          </div>

          <label className="text-gray-200 text-sm font-medium" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <label className="text-gray-200 text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <label className="text-gray-200 text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Password strength indicator */}
          {password && (
            <div className="text-xs space-y-1">
              <div className={`${password.length >= 8 ? 'text-green-400' : 'text-red-400'}`}>
                ✓ At least 8 characters {password.length >= 8 ? '✓' : '✗'}
              </div>
              <div className={`${/[A-Za-z]/.test(password) && /[0-9]/.test(password) ? 'text-green-400' : 'text-red-400'}`}>
                ✓ Contains letters and numbers {/[A-Za-z]/.test(password) && /[0-9]/.test(password) ? '✓' : '✗'}
              </div>
            </div>
          )}

          {/* Clerk CAPTCHA container - This is required for Smart CAPTCHA */}
          <div id="clerk-captcha" ref={captchaRef} className="clerk-captcha-container"></div>
          
          {error && (
            <div className="mt-2 flex items-center gap-2 rounded-md bg-red-950 p-3 border border-red-500">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-400">{error}</p>
                {captchaError && (
                  <div className="mt-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="text-xs text-blue-400 hover:text-blue-300 underline block"
                    >
                      Refresh Page
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>Debug help for CAPTCHA issues:</p>
                        <p>• Check browser console for CSP violations</p>
                        <p>• Try in incognito mode (disable extensions)</p>
                        <p>• Consider disabling CAPTCHA in Clerk dashboard for dev</p>
                        <p>• Check if network/firewall blocks Google/CAPTCHA domains</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || !isLoaded}
            className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating account...
              </div>
            ) : (
              "Create account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
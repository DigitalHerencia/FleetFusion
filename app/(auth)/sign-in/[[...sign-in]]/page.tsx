"use client"

import { useAuth, useSignIn, useUser } from "@clerk/nextjs"
import { MapPinned } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

export default function SignInPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { signIn, isLoaded: isSignInLoaded, setActive } = useSignIn()
    const { user, isLoaded: isUserLoaded } = useUser()
    const { isSignedIn } = useAuth()
    const router = useRouter()

    // Redirect authenticated users away from sign-in page
    useEffect(() => {
        if (isSignedIn && isUserLoaded && user) {
            // Use publicMetadata for onboarding and role
            const { publicMetadata } = user
            const onboardingComplete = Boolean(publicMetadata?.onboardingComplete)
            const organizationId = publicMetadata?.organizationId as
                | string
                | undefined
            const userId = user.id
            // You can add role-based logic here if needed:
            // const role = publicMetadata?.role as string | undefined
            if (onboardingComplete && organizationId && userId) {
                router.replace(`/${organizationId}/dashboard/${userId}`)
            } else {
                router.replace("/onboarding")
            }
        }
    }, [isSignedIn, isUserLoaded, user, router])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")
        if (!isSignInLoaded) {
            setLoading(false)
            return
        }
        try {
            const res = await signIn.create({ identifier: email, password })
            if (res.status === "complete") {
                await setActive({ session: res.createdSessionId })
                // user will be redirected by useEffect
            } else {
                setError("Sign in failed. Please check your credentials.")
            }
        } catch (err: any) {
            if (
                err?.errors &&
                Array.isArray(err.errors) &&
                err.errors.length > 0
            ) {
                const code = err.errors[0].code
                if (code === "form_password_incorrect")
                    setError("Incorrect password.")
                else if (code === "form_identifier_not_found")
                    setError("No account found with that email.")
                else setError(err.errors[0].message || "Sign in failed.")
            } else if (err?.message) {
                setError(err.message)
            } else {
                setError("An unknown error occurred.")
            }
        }
        setLoading(false)
    }

    return (
        <div className='flex min-h-screen flex-col items-center justify-center mt-10 mb-10 rounded-lg bg-black px-4 sm:px-6 lg:px-8'>
            <div className='w-full max-w-md space-y-8'>
                <div className='flex flex-col items-center justify-center text-center'>
                    <div className='flex flex-1 items-center'>
                        <Link
                            className='flex items-center justify-center underline-offset-4 hover:text-blue-500 hover:underline'
                            href='/'
                        >
                            <MapPinned className='mr-1 h-6 w-6 text-blue-500' />
                            <span className='text-2xl font-extrabold text-white dark:text-white'>
                                FleetFusion
                            </span>
                        </Link>
                    </div>
                    <h1 className='mt-2 text-3xl font-extrabold text-white'>
                        SIGN IN TO YOUR ACCOUNT
                    </h1>
                    <p className='mt-2 text-sm text-gray-400'>
                        Or{" "}
                        <Link
                            href='/sign-up'
                            className='font-medium text-blue-500 hover:underline'
                        >
                            create a new account
                        </Link>
                    </p>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className='mt-8 flex flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-lg'
                >
                    <label
                        className='text-sm font-medium text-gray-200'
                        htmlFor='email'
                    >
                        Email
                    </label>
                    <input
                        id='email'
                        type='email'
                        autoComplete='email'
                        required
                        className='rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />

                    <label
                        className='text-sm font-medium text-gray-200'
                        htmlFor='password'
                    >
                        Password
                    </label>
                    <input
                        id='password'
                        type='password'
                        autoComplete='current-password'
                        required
                        className='rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    <div className='flex justify-end'>
                        <Link
                            href='/forgot-password'
                            className='text-xs text-blue-500 hover:underline'
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {error && (
                        <p className='mt-2 text-sm text-red-500'>{error}</p>
                    )}

                    <Button
                        type='submit'
                        disabled={loading || !isSignInLoaded}
                        className='mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </Button>
                </form>
            </div>
        </div>
    )
}

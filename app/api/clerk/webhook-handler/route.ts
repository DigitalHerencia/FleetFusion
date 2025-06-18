/** @format */

"use server"

import type { DeletedObjectJSON, UserJSON } from "@clerk/backend"
import { NextRequest, NextResponse } from "next/server"
import { Webhook } from "svix"

import db, { DatabaseQueries } from "@/lib/database/db"
// Clerk backend types

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET ?? ""
if (!CLERK_WEBHOOK_SECRET) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set in environment variables.")
}

function getStringField(obj: any, key: string): string | null {
    const val = obj?.[key]
    if (typeof val === "string") return val
    return null
}

function getBooleanField(obj: any, key: string): boolean {
    const val = obj?.[key]
    if (typeof val === "boolean") return val
    if (typeof val === "string") return val === "true"
    return false
}

function safeJson(obj: any): any {
    try {
        return JSON.parse(JSON.stringify(obj))
    } catch {
        return null
    }
}

async function handleClerkEvent(eventType: string, data: any) {
    switch (eventType) {
        case "user.created":
        case "user.updated": {
            const user = data as UserJSON
            await DatabaseQueries.upsertUser({
                clerkId: user.id,
                email:
                    Array.isArray(user.email_addresses) &&
                    user.email_addresses.length > 0
                        ? String(user.email_addresses[0]?.email_address ?? "")
                        : "",
                firstName: user.first_name ?? null,
                lastName: user.last_name ?? null,
                profileImage: user.image_url ?? null,
                isActive: true,
                onboardingComplete: getBooleanField(
                    user.private_metadata,
                    "onboardingComplete"
                ),
                lastLogin: user.last_sign_in_at
                    ? new Date(user.last_sign_in_at)
                    : null,
                organizationId: getStringField(
                    user.private_metadata,
                    "organizationId"
                ),
            })
            break
        }
        case "user.deleted": {
            const user = data as DeletedObjectJSON
            if (user.id) await DatabaseQueries.deleteUser(user.id)
            break
        }
        // NOTE: Organization events removed - using custom organization management
        // case 'organization.created':
        // case 'organization.updated':
        // case 'organization.deleted':
        // case 'organizationMembership.created':
        // case 'organizationMembership.updated':
        // case 'organizationMembership.deleted':
        // These are now handled through our custom onboarding flow
        default:
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Clerk Webhook] Unhandled event: ${eventType}`)
            }
            break
    }
}

export async function POST(req: NextRequest) {
    try {
        // Get raw body and headers for Svix verification
        const payload = await req.text()
        const svixId = req.headers.get("svix-id") ?? ""
        const svixTimestamp = req.headers.get("svix-timestamp") ?? ""
        const svixSignature = req.headers.get("svix-signature") ?? ""
        if (process.env.NODE_ENV === 'development') {
            console.log("[Clerk Webhook] Received headers")
        }
        // Verify signature
        const wh = new Webhook(CLERK_WEBHOOK_SECRET)
        let evt: any
        try {
            evt = wh.verify(payload, {
                "svix-id": svixId,
                "svix-timestamp": svixTimestamp,
                "svix-signature": svixSignature,
            })
        } catch (err) {
            console.error("[Clerk Webhook] Signature verification failed:", err)
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            )
        }
        const { id } = evt.data
        const eventType = evt.type
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Clerk Webhook] Processing event: ${eventType}`)
        }
        await handleClerkEvent(eventType, evt.data)
        // Log the event
        if (typeof id === "string") {
            await db.webhookEvent.upsert({
                where: { eventId: id },
                update: {
                    eventType,
                    status: "processed",
                    processedAt: new Date(),
                    payload: JSON.stringify(evt.data),
                },
                create: {
                    eventId: id,
                    eventType,
                    status: "processed",
                    processedAt: new Date(),
                    payload: JSON.stringify(evt.data),
                },
            })
        }
        return NextResponse.json(
            { message: "Webhook processed successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("[Clerk Webhook] Handler error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Webhook error" },
            { status: 500 }
        )
    }
}

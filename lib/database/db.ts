/**
 * Database Connection Configuration (Neon + Prisma)
 *
 * - Uses Neon serverless driver for serverless/edge environments
 * - Uses Prisma client singleton pattern to avoid connection exhaustion
 * - Handles error logging and type-safe queries
 * - Implements secure connection management with retry logic
 *
 * @format
 */

import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

// Validate required environment variables
const requiredEnvVars = ["DATABASE_URL"] as const
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`)
    }
}

// Secure connection string validation
const connectionString = process.env.DATABASE_URL!
const maxConnections = parseInt(process.env.DB_MAX_CONNECTIONS || "10")
const connectionTimeout = parseInt(process.env.DB_CONNECTION_TIMEOUT || "10000")
if (!connectionString.includes("sslmode=require")) {
    console.warn("Database connection should use SSL in production")
}

// Enhanced adapter configuration with timeout and retry settings
const adapter = new PrismaNeon({
    connectionString,
    max: maxConnections,
    connectionTimeoutMillis: connectionTimeout,
    // Neon handles pooling at infrastructure level
})

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
}

// Enhanced Prisma client configuration with logging and timeouts
const createPrismaClient = () => {
    return new PrismaClient({
        adapter,
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "info", "warn", "error"]
                : ["error"],
        // Note: Do not specify datasources when using driver adapters
        // The connection string is already provided to the adapter
    })
}

let prisma: PrismaClient
if (process.env.NODE_ENV === "production") {
    prisma = createPrismaClient()
} else {
    if (!globalThis.prisma) {
        globalThis.prisma = createPrismaClient()
    }
    prisma = globalThis.prisma
}

// Database monitoring and performance tracking
const setupDatabaseMonitoring = () => {
    if (process.env.DATABASE_LOGGING === "true") {
        prisma.$use(async (params, next) => {
            const start = Date.now()
            const result = await next(params)
            const duration = Date.now() - start

            // Log slow queries for performance monitoring
            const slowQueryThreshold = parseInt(
                process.env.SLOW_QUERY_THRESHOLD || "1000"
            )
            if (duration > slowQueryThreshold && params.model !== "AuditLog") {
                console.warn(
                    `Slow query detected: ${params.model}.${params.action} took ${duration}ms`
                )

                // In production, log to audit system for performance tracking
                if (process.env.NODE_ENV === "production") {
                    try {
                        await prisma.auditLog.create({
                            data: {
                                organizationId: "system",
                                entityId: "system", // Add required entityId field
                                entityType: "database",
                                action: "slow_query",
                                changes: {
                                    model: params.model,
                                    action: params.action,
                                    duration,
                                    args: params.args,
                                },
                                metadata: {
                                    query_type: "slow",
                                    threshold_ms: slowQueryThreshold,
                                },
                            },
                        })
                    } catch (auditError) {
                        console.error(
                            "Failed to log slow query to audit system:",
                            auditError
                        )
                    }
                }
            }

            return result
        })
    }
}

// Initialize monitoring
setupDatabaseMonitoring()

// Health check function for database connectivity
export const checkDatabaseHealth = async (): Promise<{
    status: "healthy" | "unhealthy"
    latency?: number
    error?: string
}> => {
    try {
        const start = Date.now()
        await prisma.$queryRaw`SELECT 1`
        const latency = Date.now() - start

        return {
            status: "healthy",
            latency,
        }
    } catch (error) {
        return {
            status: "unhealthy",
            error: error instanceof Error ? error.message : "Unknown error",
        }
    }
}

// Utility function to handle database errors
export function handleDatabaseError(error: unknown): never {
    console.error("Database error:", error)
    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as any).code === "string"
    ) {
        // Prisma known request error
        if (error instanceof PrismaClientKnownRequestError) {
            switch ((error as PrismaClientKnownRequestError).code) {
                case "P2002":
                case "P2003":
                case "P2025":
                default:
                    throw new Error(
                        `Database error (Prisma): ${
                            (error as PrismaClientKnownRequestError).message
                        } (Code: ${
                            (error as PrismaClientKnownRequestError).code
                        })`
                    )
            }
        } else {
            // Fallback for generic SQL errors
            const sqlError = error as { code: string; message: string }
            switch (sqlError.code) {
                case "23505":
                case "23503":
                case "23502":
                case "42P01":
                default:
                    throw new Error(
                        `Database error: ${sqlError.message} (SQL Code: ${sqlError.code})`
                    )
            }
        }
    }
    throw new Error("Unknown database error occurred")
}

/**
 * Utility to generate a unique slug for organizations (DB-level)
 */
async function generateUniqueOrgSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug
    let suffix = 1
    const maxAttempts = 50 // Prevent infinite loops

    while (suffix <= maxAttempts) {
        const existing = await db.organization.findUnique({ where: { slug } })
        if (!existing) return slug
        slug = `${baseSlug}-${suffix}`
        suffix++
    }
    throw new Error(
        `Could not generate unique slug after ${maxAttempts} attempts for base slug: ${baseSlug}`
    )
}

// Type-safe database queries helper (rewritten for Prisma)
export class DatabaseQueries {
    /**
     * Upsert (create or update) an organization membership from Clerk webhook
     * Looks up internal org/user IDs by Clerk IDs, upserts membership, sets role and timestamps
     */
    static async upsertOrganizationMembership({
        organizationId,
        userClerkId,
        role,
        createdAt,
        updatedAt,
    }: {
        organizationId: string
        userClerkId: string
        role: string
        createdAt?: Date
        updatedAt?: Date
    }) {
        try {
            // Look up internal IDs
            const organization = await db.organization.findUnique({
                where: { clerkId: organizationId },
            })
            if (!organization)
                throw new Error(
                    `Organization not found for clerkId: ${organizationId}`
                )
            const user = await db.user.findUnique({
                where: { clerkId: userClerkId },
            })
            if (!user)
                throw new Error(`User not found for clerkId: ${userClerkId}`)
            // Upsert membership (unique on orgId+userId)
            const membership = await db.organizationMembership.upsert({
                where: {
                    organizationId_userId: {
                        organizationId: organization.id,
                        userId: user.id,
                    },
                },
                update: {
                    role,
                    updatedAt: updatedAt || new Date(),
                },
                create: {
                    organizationId: organization.id,
                    userId: user.id,
                    role,
                    createdAt: createdAt || new Date(),
                    updatedAt: updatedAt || new Date(),
                },
            })
            return membership
        } catch (error) {
            console.error("Error in upsertOrganizationMembership:", error)
            handleDatabaseError(error)
        }
    }

    /**
     * Delete an organization membership (by orgClerkId and userClerkId)
     */
    static async deleteOrganizationMembership({
        organizationId,
        userClerkId,
    }: {
        organizationId: string
        userClerkId: string
    }) {
        try {
            const organization = await db.organization.findUnique({
                where: { clerkId: organizationId },
            })
            if (!organization) {
                console.warn(
                    `[DB] Organization not found for clerkId: ${organizationId}, skipping membership delete.`
                )
                return {
                    success: true,
                    message:
                        "Organization not found, skipping membership delete.",
                }
            }
            const user = await db.user.findUnique({
                where: { clerkId: userClerkId },
            })
            if (!user) {
                console.warn(
                    `[DB] User not found for clerkId: ${userClerkId}, skipping membership delete.`
                )
                return {
                    success: true,
                    message: "User not found, skipping membership delete.",
                }
            }
            await db.organizationMembership.delete({
                where: {
                    organizationId_userId: {
                        organizationId: organization.id,
                        userId: user.id,
                    },
                },
            })
            return { success: true }
        } catch (error) {
            // If not found, treat as idempotent
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === "P2025"
            ) {
                return { success: true }
            }
            console.error("Error in deleteOrganizationMembership:", error)
            handleDatabaseError(error)
        }
    }

    /**
     * Get organization by Clerk ID
     */ static async getOrganizationByClerkId({
        clerkId,
    }: {
        clerkId: string
    }) {
        try {
            const organization = await db.organization.findFirst({
                where: { clerkId },
            })
            if (!organization) {
                console.warn(`[DB] Organization not found for id: ${clerkId}`)
            }
            return organization || null
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    /**
     * Get user by Clerk ID
     */
    static async getUserByClerkId(clerkId: string) {
        try {
            if (!clerkId) {
                console.warn(
                    "getUserByClerkId called with undefined/empty clerkId"
                )
                return null
            }
            const user = await db.user.findUnique({
                where: { clerkId },
            })
            return user || null
        } catch (error) {
            handleDatabaseError(error)
        }
    }

    /**
     * Create or update organization from Clerk webhook
     */
    static async upsertOrganization(data: {
        clerkId: string
        name: string
        slug: string
        dotNumber?: string | null
        mcNumber?: string | null
        address?: string | null
        city?: string | null
        state?: string | null
        zip?: string | null
        phone?: string | null
        email?: string | null
        logoUrl?: string | null
        maxUsers?: number
        billingEmail?: string | null
        isActive?: boolean
    }) {
        try {
            if (!data.clerkId)
                throw new Error("clerkId is required for organization upsert")
            if (!data.name)
                throw new Error("name is required for organization upsert")
            if (!data.slug)
                throw new Error("slug is required for organization upsert")
            const { clerkId } = data
            const existingOrg = await db.organization.findFirst({
                where: { clerkId },
            })
            if (existingOrg) {
                const updateData = {
                    name: data.name,
                    dotNumber: data.dotNumber,
                    mcNumber: data.mcNumber,
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    zip: data.zip,
                    phone: data.phone,
                    email: data.email,
                    logoUrl: data.logoUrl,
                    maxUsers: data.maxUsers === undefined ? 5 : data.maxUsers,
                    billingEmail: data.billingEmail,
                    isActive:
                        data.isActive === undefined ? true : data.isActive,
                }
                const organization = await db.organization.update({
                    where: { clerkId },
                    data: updateData,
                })
                return organization
            } else {
                let uniqueSlug = await generateUniqueOrgSlug(data.slug)
                let attempt = 0
                const maxAttempts = 5
                let lastError
                while (attempt < maxAttempts) {
                    try {
                        const orgDataForCreate = {
                            clerkId,
                            name: data.name,
                            slug: uniqueSlug,
                            dotNumber: data.dotNumber,
                            mcNumber: data.mcNumber,
                            address: data.address,
                            city: data.city,
                            state: data.state,
                            zip: data.zip,
                            phone: data.phone,
                            email: data.email,
                            logoUrl: data.logoUrl,
                            maxUsers:
                                data.maxUsers === undefined ? 5 : data.maxUsers,
                            billingEmail: data.billingEmail,
                            isActive:
                                data.isActive === undefined
                                    ? true
                                    : data.isActive,
                        }
                        const organization = await db.organization.create({
                            data: orgDataForCreate,
                        })
                        return organization
                    } catch (error: unknown) {
                        lastError = error
                        if (
                            error instanceof PrismaClientKnownRequestError &&
                            error.code === "P2002"
                        ) {
                            const target = error.meta?.target
                            if (
                                (typeof target === "string" &&
                                    target === "slug") ||
                                (Array.isArray(target) &&
                                    target.includes("slug"))
                            ) {
                                uniqueSlug = await generateUniqueOrgSlug(
                                    data.slug
                                )
                                attempt++
                                continue
                            } else if (
                                (typeof target === "string" &&
                                    target === "clerkId") ||
                                (Array.isArray(target) &&
                                    target.includes("clerkId"))
                            ) {
                                const existingOrg =
                                    await db.organization.findFirst({
                                        where: { clerkId },
                                    })
                                if (existingOrg) {
                                    return existingOrg
                                }
                            }
                        }
                        throw error
                    }
                }
                throw (
                    lastError ||
                    new Error(
                        "Failed to create organization due to conflicts after multiple attempts"
                    )
                )
            }
        } catch (error) {
            console.error(
                `Error in upsertOrganization for id: ${data.clerkId}`,
                error
            )
            handleDatabaseError(error)
        }
    }

    /**
     * Create or update user from Clerk webhook (no organization connection)
     */
    static async upsertUser(data: {
        clerkId: string
        email: string
        firstName?: string | null
        lastName?: string | null
        profileImage?: string | null
        isActive?: boolean
        onboardingComplete: boolean
        lastLogin?: Date | null
        organizationId?: string | null // Optional, can be null
    }) {
        try {
            const { clerkId, ...updateData } = data
            if (!clerkId) throw new Error("clerkId is required for user upsert")
            if (!data.email)
                throw new Error("email is required for user upsert")

            // Validate organizationId if provided
            let validOrganizationId: string | null = null
            if (data.organizationId) {
                const org = await db.organization.findUnique({
                    where: { id: data.organizationId },
                })
                if (org) {
                    validOrganizationId = data.organizationId
                } else {
                    validOrganizationId = null
                }
            }

            const userDataForUpdate = {
                ...updateData,
                organizationId: validOrganizationId,
            }
            const userDataForCreate = {
                clerkId,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                profileImage: data.profileImage,
                isActive: data.isActive === undefined ? true : data.isActive,
                onboardingComplete:
                    data.onboardingComplete === undefined
                        ? false
                        : data.onboardingComplete,
                lastLogin: data.lastLogin,
                organizationId: validOrganizationId,
            }

            const user = await db.user.upsert({
                where: { clerkId },
                update: userDataForUpdate,
                create: userDataForCreate,
            })
            return user
        } catch (error) {
            console.error(
                `Error in upsertUser for clerkId: ${data.clerkId}`,
                error
            )
            handleDatabaseError(error)
        }
    }

    /**
     * Delete organization
     */
    static async deleteOrganization(clerkId: string) {
        try {
            console.log("[DB] deleteOrganization called with id:", clerkId)
            const organization = await db.organization.findFirst({
                where: { clerkId },
            })
            if (!organization) {
                console.warn(
                    `[DB] Organization with id ${clerkId} does not exist, skipping delete.`
                )
                return {
                    success: true,
                    message: "Organization already deleted or does not exist",
                }
            }
            await db.organization.delete({
                where: { clerkId },
            })
            console.log(`[DB] Organization deleted successfully: ${clerkId}`)
            return {
                success: true,
                message: "Organization deleted successfully",
            }
        } catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === "P2025"
            ) {
                return {
                    success: true,
                    message: "Organization already deleted or does not exist",
                }
            }
            console.error(`[DB] Error deleting organization ${clerkId}:`, error)
            return {
                success: false,
                message: `Failed to delete organization: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            }
        }
    }

    /**
     * Delete user
     */
    static async deleteUser(clerkId: string) {
        try {
            console.log("[DB] deleteUser called with clerkId:", clerkId)
            const user = await db.user.findUnique({
                where: { clerkId },
            })
            if (!user) {
                console.warn(
                    `[DB] User with clerkId ${clerkId} does not exist, skipping delete.`
                )
                return {
                    success: true,
                    message: "User already deleted or does not exist",
                }
            }
            await db.user.delete({
                where: { clerkId },
            })
            console.log(`[DB] User deleted successfully: ${clerkId}`)
            return { success: true, message: "User deleted successfully" }
        } catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === "P2025"
            ) {
                return {
                    success: true,
                    message: "User already deleted or does not exist",
                }
            }
            console.error(`[DB] Error deleting user ${clerkId}:`, error)
            return {
                success: false,
                message: `Failed to delete user: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            }
        }
    }
}

// Create db alias for consistent exports
const db = prisma

export default db

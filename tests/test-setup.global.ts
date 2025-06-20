/** @format */

import { test as setup } from "@playwright/test"
import { PrismaClient, UserRole } from "@prisma/client" // fixed import

const prisma = new PrismaClient()

/**
 * Global test setup for Playwright E2E tests
 * This runs before all tests and sets up:
 * 1. Test database with seed data
 */
setup("Global test setup", async () => {
    console.log("🚀 Starting global test setup...")

    // Set up test database with seed data
    await setupTestDatabase()

    console.log("✅ Global test setup completed")
})

/**
 * Set up test database with seed data
 */
async function setupTestDatabase() {
    try {
        console.log("📦 Setting up test database...")

        // Clean existing test data
        await prisma.auditLog.deleteMany()
        await prisma.iftaTrip.deleteMany()
        await prisma.load.deleteMany()
        await prisma.vehicle.deleteMany()
        await prisma.driver.deleteMany()
        // await prisma.invitation.deleteMany(); // Fix: Use correct model name for invitation table (likely 'invitation' or 'invitations' is wrong)
        await prisma.user.deleteMany()
        await prisma.organization.deleteMany()

        // Create test organization
        const organization = await prisma.organization.create({
            data: {
                id: "org-1",
                name: "Test Org",
                subscriptionTier: "pro",
                subscriptionStatus: "active",
                maxUsers: 10,
                createdAt: new Date(),
                settings: {
                    timezone: "UTC",
                    dateFormat: "YYYY-MM-DD",
                    distanceUnit: "miles",
                    fuelUnit: "gallons",
                },
                clerkId: "clerk-1", // FIXED: use camelCase for Prisma
                slug: "test-org", // required
            },
        })

        // Create test users with different roles
        const users = [
            {
                id: "user_admin123",
                clerkId: "user_admin123", // FIXED: use camelCase for Prisma
                email: "admin@test.com",
                firstName: "Admin", // FIXED: use camelCase for Prisma
                lastName: "User", // FIXED: use camelCase for Prisma
                role: UserRole.admin, // Use enum value
                organizationId: organization.id, // FIXED: use camelCase for Prisma
            },
            {
                id: "user_driver123",
                clerkId: "user_driver123",
                email: "driver@test.com",
                firstName: "Test",
                lastName: "Driver",
                role: UserRole.driver,
                organizationId: organization.id,
            },
            {
                id: "user_dispatcher123",
                clerkId: "user_dispatcher123",
                email: "dispatcher@test.com",
                firstName: "Test",
                lastName: "Dispatcher",
                role: UserRole.dispatcher,
                organizationId: organization.id,
            },
        ]

        for (const userData of users) {
            await prisma.user.create({
                data: {
                    ...userData,
                    isActive: true, // FIXED: use camelCase for Prisma
                    createdAt: new Date(), // FIXED: use camelCase for Prisma
                },
            })
        }

        // Create test drivers
        await prisma.driver.create({
            data: {
                createdAt: new Date(),
                id: "driver-1",
                email: "driver@example.com",
                firstName: "Driver",
                lastName: "Test",
                organizationId: organization.id,
                licenseNumber: "DL123456789",
                licenseState: "TX",
            },
        })

        // Create test vehicles
        await prisma.vehicle.create({
            data: {
                createdAt: new Date(),
                id: "vehicle-1",
                organizationId: organization.id,
                make: "Freightliner",
                model: "Cascadia",
                year: 2022,
                vin: "1FUJBBCK3NLBR1234",
                type: "TRUCK", // required
                unitNumber: "UNIT001", // required
            },
        })

        // Create test loads
        await prisma.load.create({
            data: {
                id: "load-1",
                organizationId: organization.id,
                referenceNumber: "REF123",
                // pickup: new Date(), // Removed: not a valid field
                // delivery: new Date(), // Removed: not a valid field
                scheduledPickupDate: new Date(), // Use correct field name
                scheduledDeliveryDate: new Date(), // Use correct field name
                status: "pending",
                createdAt: new Date(),
                loadNumber: "LN-001",
                originAddress: "123 Main St",
                originCity: "Origin City",
                originState: "OS",
                originZip: "12345", // required
                destinationAddress: "456 Elm St",
                destinationCity: "Dest City",
                destinationState: "DS",
                destinationZip: "67890", // required
                weight: 1000,
            },
        })

        console.log("✅ Test database setup completed")
    } catch (error) {
        console.error("❌ Failed to setup test database:", error)
        throw error
    }
}

// Global teardown - disconnect Prisma after all tests
setup.afterAll(async () => {
    console.log("🧹 Cleaning up test setup...")
    await prisma.$disconnect()
    console.log("✅ Test cleanup completed")
})

// No changes needed here. Fix the Prisma schema and run a migration to add `clerkId` to the organization table.

/** @format */

import { beforeEach, describe, expect, it, vi } from "vitest"

// Use dynamic import for actions and fetchers after mocks are set up
let actions: typeof import("../lib/actions/vehicleActions")
let listVehiclesByOrg: typeof import("../lib/fetchers/vehicleFetchers").listVehiclesByOrg

import { mockDbMethods } from "./__mocks__/mockDb"

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

vi.mock("../lib/database/db", () => ({
    __esModule: true,
    default: mockDbMethods,
}))

vi.mock("@/lib/errors/handleError", () => ({ handleError: vi.fn() }))

vi.mock("@clerk/nextjs/server", () => ({
    auth: () => Promise.resolve({ userId: "u1", orgId: "org1" }),
}))

vi.mock("../schemas/vehicles", async () => {
    const actual = await vi.importActual<typeof import("../schemas/vehicles")>(
        "../schemas/vehicles"
    )
    return {
        __esModule: true,
        ...actual,
        VehicleFormSchema: {
            safeParse: () => ({
                success: true,
                data: {
                    vin: "1XP5DB9X7YN525486",
                    type: "tractor",
                    make: "Make",
                    model: "Model",
                    year: 2024,
                },
            }),
        },
        VehicleUpdateStatusSchema: {
            parse: () => ({ status: "out_of_service", notes: "" }),
        },
    }
})

describe("vehicles domain", () => {
    beforeEach(async () => {
        vi.clearAllMocks()
        actions = await import("../lib/actions/vehicleActions")
        listVehiclesByOrg = (await import("../lib/fetchers/vehicleFetchers")).listVehiclesByOrg
    })

    it("validates VIN format", async () => {
        const schemas = await vi.importActual<
            typeof import("../schemas/vehicles")
        >("../schemas/vehicles")
        expect(() =>
            schemas.VehicleFormSchema.parse({
                type: "tractor",
                make: "Make",
                model: "Model",
                year: 2024,
                vin: "1XP5DB9X7YN525486",
            })
        ).not.toThrow()

        expect(() =>
            schemas.VehicleFormSchema.parse({
                type: "tractor",
                make: "Make",
                model: "Model",
                year: 2024,
                vin: "INVALIDVIN",
            })
        ).toThrow()
    })

    it("creates a vehicle", async () => {
        const formData = new FormData()
        formData.append("vin", "1XP5DB9X7YN525486")
        formData.append("type", "tractor")
        formData.append("make", "Make")
        formData.append("model", "Model")
        formData.append("year", "2024")

        mockDbMethods.vehicle.findFirst.mockResolvedValue(null)
        mockDbMethods.vehicle.create.mockResolvedValue({
            id: "v1",
            organizationId: "org1",
            type: "tractor",
            status: "active",
        })

        const result = await actions.createVehicleAction(null, formData)

        expect(result.success).toBe(true)
        expect(mockDbMethods.vehicle.create).toHaveBeenCalled()
    })

    it("fails when VIN exists", async () => {
        const formData = new FormData()
        formData.append("vin", "1XP5DB9X7YN525486")
        formData.append("type", "tractor")
        formData.append("make", "Make")
        formData.append("model", "Model")
        formData.append("year", "2024")

        mockDbMethods.vehicle.findFirst.mockResolvedValue({ id: "existing" })

        const result = await actions.createVehicleAction(null, formData)

        expect(result.success).toBe(false)
        expect(result.error).toMatch(/already exists/)
    })

    it("updates vehicle", async () => {
        const formData = new FormData()
        formData.append("vehicleId", "v1")
        formData.append("vin", "1XP5DB9X7YN525486")
        formData.append("type", "tractor")
        formData.append("make", "Make")
        formData.append("model", "Model")
        formData.append("year", "2024")

        mockDbMethods.vehicle.findUnique.mockResolvedValue({
            id: "v1",
            organizationId: "org1",
            vin: "1XP5DB9X7YN525486",
        })
        mockDbMethods.vehicle.update.mockResolvedValue({
            id: "v1",
            organizationId: "org1",
            type: "tractor",
            status: "active",
        })

        const result = await actions.updateVehicleAction(null, formData)

        expect(result.success).toBe(true)
        expect(mockDbMethods.vehicle.update).toHaveBeenCalled()
    })

    it("fails update with VIN conflict", async () => {
        const formData = new FormData()
        formData.append("vehicleId", "v1")
        formData.append("vin", "1XP5DB9X7YN525486")
        formData.append("type", "tractor")
        formData.append("make", "Make")
        formData.append("model", "Model")
        formData.append("year", "2024")

        mockDbMethods.vehicle.findUnique.mockResolvedValue({
            id: "v1",
            organizationId: "org1",
            vin: "DIFFERENTVIN",
        })
        mockDbMethods.vehicle.findFirst.mockResolvedValue({ id: "conflict" })

        const result = await actions.updateVehicleAction(null, formData)

        expect(result.success).toBe(false)
        expect(result.error).toMatch(/already exists/)
    })

    it("updates vehicle status", async () => {
        mockDbMethods.vehicle.findUnique.mockResolvedValue({
            id: "v1",
            organizationId: "org1",
            status: "active",
        })
        mockDbMethods.vehicle.update.mockResolvedValue({
            id: "v1",
            organizationId: "org1",
            status: "inactive",
        })

        const result = await actions.updateVehicleStatusAction("v1", {
            status: "out_of_service",
        })

        expect(result.success).toBe(true)
        expect(mockDbMethods.vehicle.update).toHaveBeenCalled()
    })

    it("deletes vehicle", async () => {
        mockDbMethods.vehicle.findUnique.mockResolvedValue({
            organizationId: "org1",
        })
        mockDbMethods.vehicle.delete.mockResolvedValue({})

        const result = await actions.deleteVehicleAction("v1")

        expect(result.success).toBe(true)
        expect(mockDbMethods.vehicle.delete).toHaveBeenCalledWith({
            where: { id: "v1" },
        })
    })

    it("assigns vehicle to driver", async () => {
        mockDbMethods.vehicle.findUnique.mockResolvedValue({
            id: "v1",
            organizationId: "org1",
            status: "active",
        })
        mockDbMethods.load.create.mockResolvedValue({ id: "load1" })
        mockDbMethods.vehicle.findUnique.mockResolvedValueOnce({
            id: "v1",
            organizationId: "org1",
            status: "active",
        })
        mockDbMethods.vehicle.findUnique.mockResolvedValueOnce({
            id: "v1",
            organizationId: "org1",
            status: "active",
        })

        const result = await actions.assignVehicleToDriverAction("v1", "d1")

        expect(result.success).toBe(true)
        expect(mockDbMethods.load.create).toHaveBeenCalled()
    })

    it("lists vehicles with filters", async () => {
        mockDbMethods.vehicle.findMany.mockResolvedValue([
            {
                id: "v1",
                organizationId: "org1",
                type: "tractor",
                status: "active",
                vin: "1XP5DB9X7YN525486",
                make: "Make",
                model: "Model",
                year: 2024,
            },
        ])
        mockDbMethods.vehicle.count.mockResolvedValue(1)

        const { vehicles } = await listVehiclesByOrg("org1", {
            search: "Make",
            page: 1,
            limit: 10,
        })

        expect(vehicles.length).toBe(1)
        expect(mockDbMethods.vehicle.findMany).toHaveBeenCalled()
    })
})

/** @format */

// @vitest-environment jsdom
import React from "react"
import { screen } from "@testing-library/dom"
import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import CompanySettingsPage from "../CompanySettingsPage"

vi.mock("@/lib/fetchers/settingsFetchers", () => ({
    getCompanyProfile: vi.fn(async () => ({ name: "Acme Inc." })),
}))

vi.mock("@/components/settings/CompanyProfileForm", () => ({
    CompanyProfileForm: ({ profile }: any) => (
        <form>Profile: {profile.name}</form>
    ),
}))

describe("CompanySettingsPage", () => {
    it("renders company profile form", async () => {
        const Component = await CompanySettingsPage({ orgId: "org1" })
        render(Component)
        expect(screen.getByText(/Profile: Acme Inc./i)).toBeInTheDocument()
    })
})
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CompanySettingsPage from '../CompanySettingsPage'

vi.mock('@/lib/fetchers/settingsFetchers', () => ({
  getCompanyProfile: vi.fn(async () => ({ name: 'Acme Inc.' })),
}))

vi.mock('@/components/settings/CompanyProfileForm', () => ({
  CompanyProfileForm: ({ profile }: any) => <form>Profile: {profile.name}</form>,
}))

describe('CompanySettingsPage', () => {
  it('renders company profile form', async () => {
    render(await CompanySettingsPage({ orgId: 'org1' }))
    expect(screen.getByText(/Profile: Acme Inc./i)).toBeInTheDocument()
  })
})

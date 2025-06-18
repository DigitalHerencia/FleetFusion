// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AdminDashboard } from '../AdminDashboard'

vi.mock('@/lib/actions/adminActions', () => ({
  getOrganizationStatsAction: vi.fn(async () => ({
    success: true,
    data: {
      userCount: 5,
      activeUserCount: 4,
      vehicleCount: 3,
      driverCount: 2,
      loadCount: 1,
    },
  })),
}))

describe('AdminDashboard', () => {
  it('renders organization stats', async () => {
    render(await AdminDashboard({ orgId: 'org1' }))
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})

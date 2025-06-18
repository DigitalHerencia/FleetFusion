export interface AdminDashboardData {
  organizationStats: OrganizationStats;
  userData: UserManagementData;
  billing: BillingInfo;
  systemHealth: SystemHealth;
  recentActivity: AuditLogEntry[];
}

export interface OrganizationStats {
  userCount: number;
  activeUserCount: number;
  vehicleCount: number;
  driverCount: number;
  loadCount: number;
}

export interface UserManagementData {
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  }[];
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  target: string;
  createdAt: string;
}

export interface BillingInfo {
  plan: string;
  status: string;
  currentPeriodEnds: string;
}

export interface SystemHealth {
  uptime: number;
  databaseStatus: string;
  queueStatus: string;
}

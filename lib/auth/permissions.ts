/**
 * ABAC (Attribute-Based Access Control) Utilities
 *
 * Provides permission checking and role management utilities
 * for the FleetFusion multi-tenant system with custom role/permission management
 *
 * @format
 */

import {
    Permission,
    Permissions,
    SystemRole,
    SystemRoles,
    getPermissionsForRole as abacGetPermissionsForRole,
    hasPermission as abacHasPermission,
    isAdmin as abacIsAdmin,
    canAccessCompliance,
    canManageLoads,
    canManageUsers,
} from "@/types/abac"
import type { UserContext } from "@/types/auth"

/**
 * Check if a user has a specific permission (by permission string)
 */
export function hasPermission(
    user: UserContext | null,
    permission: Permission
): boolean {
    if (!user || user.isActive === false || !user.permissions) return false
    return abacHasPermission(user.permissions, permission)
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
    user: UserContext | null,
    permissions: Permission[]
): boolean {
    if (!user || user.isActive === false || !user.permissions) return false
    return permissions.some(perm => abacHasPermission(user.permissions, perm))
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(
    user: UserContext | null,
    permissions: Permission[]
): boolean {
    if (!user || user.isActive === false || !user.permissions) return false
    return permissions.every(perm => abacHasPermission(user.permissions, perm))
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: UserContext | null, role: SystemRole): boolean {
    if (!user || user.isActive === false || !user.role) return false
    return user.role === role
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(
    user: UserContext | null,
    roles: SystemRole[]
): boolean {
    if (!user || user.isActive === false) return false
    return roles.includes(user.role as SystemRole)
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: UserContext | null): boolean {
    return user ? abacIsAdmin(user.role) : false
}

/**
 * Check if a user can access compliance features
 */
export function canAccessComplianceFeatures(user: UserContext | null): boolean {
    return user ? canAccessCompliance(user.permissions) : false
}

/**
 * Check if a user can manage other users
 */
export function canManageUsersAndRoles(user: UserContext | null): boolean {
    return user ? canManageUsers(user.permissions) : false
}

/**
 * Check if a user can manage loads
 */
export function canManageLoadsAndDispatch(user: UserContext | null): boolean {
    return user ? canManageLoads(user.permissions) : false
}

/**
 * Check if a user can view billing information
 */
export function canViewBilling(user: UserContext | null): boolean {
    return (
        hasPermission(user, Permissions["org:sys_billing:read"]) ||
        hasPermission(user, Permissions["org:sys_billing:manage"])
    )
}

/**
 * Check if a user can manage organization settings
 */
export function canManageSettings(user: UserContext | null): boolean {
    return (
        hasPermission(user, Permissions["org:sys_profile:manage"]) ||
        hasPermission(user, Permissions["org:admin:configure_company_settings"])
    )
}

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: SystemRole): Permission[] {
    return abacGetPermissionsForRole(role)
}

/**
 * Feature-specific permission checkers using exact Clerk permission strings
 */
export const FeaturePermissions = {
    // Vehicle Management
    canViewVehicles: (user: UserContext | null) =>
        hasPermission(user, Permissions["org:sys_memberships:read"]) ||
        hasPermission(user, Permissions["org:admin:view_edit_all_loads"]),

    // Driver Management
    canViewDrivers: (user: UserContext | null) =>
        hasPermission(user, Permissions["org:sys_memberships:read"]) ||
        hasPermission(
            user,
            Permissions["org:dispatcher:view_driver_vehicle_status"]
        ),
    canAssignDrivers: (user: UserContext | null) =>
        hasPermission(user, Permissions["org:dispatcher:assign_drivers"]),

    // Load Management
    canViewLoads: (user: UserContext | null) =>
        hasPermission(user, Permissions["org:driver:view_assigned_loads"]) ||
        hasPermission(user, Permissions["org:admin:view_edit_all_loads"]) ||
        hasPermission(user, Permissions["org:dispatcher:create_edit_loads"]),
    canCreateLoads: (user: UserContext | null) =>
        hasPermission(user, Permissions["org:dispatcher:create_edit_loads"]) ||
        hasPermission(user, Permissions["org:admin:view_edit_all_loads"]),
    canUpdateLoadStatus: (user: UserContext | null) =>
        hasPermission(user, Permissions["org:driver:update_load_status"]) ||
        hasPermission(user, Permissions["org:admin:view_edit_all_loads"]),

    // Document Management
    canUploadDocuments: (user: UserContext | null) =>
        hasPermission(user, Permissions["org:driver:upload_documents"]),
    canReviewCompliance: (user: UserContext | null) =>
        hasPermission(
            user,
            Permissions["org:compliance:upload_review_compliance"]
        ) || hasPermission(user, Permissions["org:admin:view_audit_logs"]),

    // HOS (Hours of Service)
    canLogHOS: (user: UserContext | null) =>
        hasPermission(user, Permissions["org:driver:log_hos"]),

    // Reporting and Analytics
    canAccessReports: (user: UserContext | null) =>
        hasPermission(user, Permissions["org:admin:access_all_reports"]) ||
        hasPermission(
            user,
            Permissions["org:compliance:generate_compliance_req"]
        ),
    canViewAuditLogs: (user: UserContext | null) =>
        hasPermission(user, Permissions["org:admin:view_audit_logs"]) ||
        hasPermission(user, Permissions["org:compliance:access_audit_logs"]),

    // Organization Management
    canManageCompanySettings: (user: UserContext | null) =>
        hasPermission(
            user,
            Permissions["org:admin:configure_company_settings"]
        ),
    canManageUserRoles: (user: UserContext | null) =>
        hasPermission(user, Permissions["org:admin:manage_users_and_roles"]),
    canManageBilling: (user: UserContext | null) =>
        hasPermission(user, Permissions["org:sys_billing:manage"]),
    canViewBillingInfo: (user: UserContext | null) =>
        hasPermission(user, Permissions["org:sys_billing:read"]) ||
        hasPermission(user, Permissions["org:sys_billing:manage"]),
} as const

/**
 * Context-aware permission checks for specific resources
 */
export class ResourcePermissions {
    /**
     * Check if user can access a specific driver's data
     * Drivers can only access their own data unless they have broader permissions
     */
    static canAccessDriver(
        user: UserContext | null,
        driverId: string
    ): boolean {
        if (!user) return false

        // If user has general driver viewing permissions, allow access
        if (FeaturePermissions.canViewDrivers(user)) return true

        // If user is the driver themselves, allow access to own data
        if (user.role === SystemRoles.DRIVER && user.userId === driverId)
            return true

        return false
    }

    /**
     * Check if user can access a specific load/dispatch
     * Drivers can only see their assigned loads
     */
    static canAccessLoad(
        user: UserContext | null,
        loadDriverId?: string
    ): boolean {
        if (!user) return false

        // If user has general load viewing permissions, allow access
        if (FeaturePermissions.canViewLoads(user)) return true

        // If user is a driver and the load is assigned to them, allow access
        if (user.role === SystemRoles.DRIVER && loadDriverId === user.userId)
            return true

        return false
    }

    /**
     * Check if user can access compliance documents
     * Drivers can only see their own compliance documents
     */
    static canAccessComplianceDocument(
        user: UserContext | null,
        documentDriverId?: string
    ): boolean {
        if (!user) return false

        // If user has general compliance permissions, allow access
        if (FeaturePermissions.canReviewCompliance(user)) return true

        // If user is a driver and the document belongs to them, allow access
        if (
            user.role === SystemRoles.DRIVER &&
            documentDriverId === user.userId
        )
            return true

        return false
    }
}

/**
 * Route protection utilities
 */
export class RouteProtection {
    // Define PROTECTED_ROUTES using SystemRole and real route patterns
    static PROTECTED_ROUTES: Record<string, SystemRole[]> = {
        // Dashboard: All authenticated users should access their dashboard
        "/:orgId/dashboard/:userId": [
            SystemRoles.ADMIN,
            SystemRoles.DISPATCHER,
            SystemRoles.DRIVER,
            SystemRoles.COMPLIANCE,
            SystemRoles.MEMBER,
        ],
        // Compliance dashboard: Compliance Officer, Admin
        "/:orgId/compliance/:userId": [
            SystemRoles.COMPLIANCE,
            SystemRoles.ADMIN,
        ],
        // Drivers list: Admin, Dispatcher, Compliance (need to see drivers for compliance), Member
        "/:orgId/drivers": [
            SystemRoles.ADMIN,
            SystemRoles.DISPATCHER,
            SystemRoles.COMPLIANCE,
            SystemRoles.MEMBER,
        ],
        // Drivers dashboard: Driver (own profile), Admin, Dispatcher, Compliance
        "/:orgId/drivers/:userId": [
            SystemRoles.DRIVER,
            SystemRoles.ADMIN,
            SystemRoles.DISPATCHER,
            SystemRoles.COMPLIANCE,
        ],
        // Dispatch dashboard: Dispatcher, Admin
        "/:orgId/dispatch/:userId": [SystemRoles.DISPATCHER, SystemRoles.ADMIN],
        // Analytics: Admin, Dispatcher, Compliance Officer, Member (read-only)
        "/:orgId/analytics": [
            SystemRoles.ADMIN,
            SystemRoles.DISPATCHER,
            SystemRoles.COMPLIANCE,
            SystemRoles.MEMBER,
        ],
        // Vehicles list: Admin, Dispatcher, Compliance (for inspections), Member
        "/:orgId/vehicles": [
            SystemRoles.ADMIN,
            SystemRoles.DISPATCHER,
            SystemRoles.COMPLIANCE,
            SystemRoles.MEMBER,
        ],
        // Admin dashboard and sub pages: Admin only
        "/:orgId/admin": [SystemRoles.ADMIN],
        "/:orgId/admin/:userId": [SystemRoles.ADMIN],
        // IFTA: Admin, Member (members can view basic IFTA info)
        "/:orgId/ifta": [SystemRoles.ADMIN, SystemRoles.MEMBER],
        // Settings: Admin only
        "/:orgId/settings": [SystemRoles.ADMIN],
        // Add more as needed for other tenant routes
    }

    /**
     * Check if user can access a specific route
     */
    static canAccessRoute(user: UserContext | null, path: string): boolean {
        if (!user || user.isActive === false) {
            return false // Deny access if user is null or not active
        }

        // Helper function to match dynamic routes
        const matchesRoute = (pattern: string, actualPath: string): boolean => {
            // Convert pattern like "/:orgId/drivers/:userId" to regex
            const regexPattern = pattern
                .replace(/:[^\\/]+/g, "[^/]+") // Replace :param with [^/]+ (non-slash characters)
                .replace(/\//g, "\\/") // Escape forward slashes

            const regex = new RegExp(`^${regexPattern}$`)
            return regex.test(actualPath)
        }

        const matchedRoute = Object.keys(RouteProtection.PROTECTED_ROUTES).find(
            routePattern => {
                return matchesRoute(routePattern, path)
            }
        )

        if (matchedRoute) {
            const requiredRoles = RouteProtection.PROTECTED_ROUTES[matchedRoute]
            return hasAnyRole(user, requiredRoles ?? [])
        }

        // Default to true if not in protected routes (meaning it's accessible to any authenticated, active user)
        return true
    }
}

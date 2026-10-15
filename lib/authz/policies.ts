import type {
  AccessContext,
  Permission,
  ResourceAccessDescriptor,
} from "../../types/access";

import { isPrivilegedRole } from "./roles";
import { assertPermission } from "./permissions";

export class ResourceAuthorizationError extends Error {
  constructor(resource: ResourceAccessDescriptor) {
    super(`Access denied for ${resource.kind} in the active organization.`);
    this.name = "ResourceAuthorizationError";
  }
}

export function isSameTenant(
  context: AccessContext,
  resource: ResourceAccessDescriptor,
): boolean {
  return context.organizationId === resource.organizationId;
}

export function ownsResource(
  context: AccessContext,
  resource: ResourceAccessDescriptor,
): boolean {
  return resource.ownerMembershipId === context.membershipId;
}

export function isAssignedResource(
  context: AccessContext,
  resource: ResourceAccessDescriptor,
): boolean {
  return resource.assigneeMembershipId === context.membershipId;
}

export function requestedResource(
  context: AccessContext,
  resource: ResourceAccessDescriptor,
): boolean {
  return resource.requesterUserId === context.userId;
}

export function canReadResource(
  context: AccessContext,
  resource: ResourceAccessDescriptor,
): boolean {
  if (!isSameTenant(context, resource)) {
    return false;
  }

  if (context.role !== "CLIENT") {
    return true;
  }

  return (
    resource.clientVisible === true ||
    ownsResource(context, resource) ||
    isAssignedResource(context, resource) ||
    requestedResource(context, resource)
  );
}

export function canManageOwnedOrAssignedResource(
  context: AccessContext,
  resource: ResourceAccessDescriptor,
): boolean {
  if (!isSameTenant(context, resource)) {
    return false;
  }

  return (
    isPrivilegedRole(context.role) ||
    context.role === "MANAGER" ||
    ownsResource(context, resource) ||
    isAssignedResource(context, resource) ||
    (context.role === "CLIENT" && requestedResource(context, resource))
  );
}

export function authorizeOwnedOrAssignedWrite(
  context: AccessContext,
  permission: Permission,
  resource: ResourceAccessDescriptor,
): void {
  assertPermission(context, permission);
  if (!canManageOwnedOrAssignedResource(context, resource)) {
    throw new ResourceAuthorizationError(resource);
  }
}

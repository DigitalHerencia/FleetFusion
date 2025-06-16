'use server';

import { currentUser, clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import db, { handleDatabaseError } from '@/lib/database/db';
import { handleError } from '@/lib/errors/handleError';
import type {
  OnboardingStepData,
  CompanySetupData,
  ProfileSetupData,
  OnboardingStatus,
} from '@/types/onboarding';
import { SystemRoles, getPermissionsForRole } from '@/types/abac';
import type { SystemRole } from '@/types/abac';
import type { OnboardingData, SetClerkMetadataResult } from '@/types/auth';
import type { UserRole } from '@/types/auth';
import {
  CompleteOnboardingSchema,
  type CompleteOnboardingData,
} from '@/schemas/onboarding';

// Infer the resolved client type
type ResolvedClerkClient = Awaited<ReturnType<typeof clerkClient>>;

export async function submitOnboardingStepAction(
  step: string,
  data: OnboardingStepData
) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get current user from database
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      include: { organization: true },
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    // Update onboarding steps
    const currentSteps =
      (dbUser.onboardingSteps as Record<string, boolean>) || {};
    const updatedSteps = { ...currentSteps, [step]: true };

    // Handle specific step data
    switch (step) {
      case 'profile':
        { const profileData = data as ProfileSetupData;
        await db.user.update({
          where: { id: dbUser.id },
          data: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            onboardingSteps: updatedSteps,
          },
        });
        break; }

      case 'company':
        { const companyData = data as CompanySetupData;
        if (dbUser.role === SystemRoles.ADMIN) {
          if (dbUser.organizationId) {
            // Ensure organizationId is not null
            await db.organization.update({
              where: { id: dbUser.organizationId },
              data: {
                dotNumber: companyData.dotNumber,
                mcNumber: companyData.mcNumber,
                address: companyData.address,
                city: companyData.city,
                state: companyData.state,
                zip: companyData.zip,
                phone: companyData.phone,
                settings: {
                  ...((dbUser.organization?.settings as object) || {}),
                  timezone: companyData.timezone,
                  dateFormat: companyData.dateFormat,
                  distanceUnit: companyData.distanceUnit,
                  fuelUnit: companyData.fuelUnit,
                },
              },
            });
          }
        }
        await db.user.update({
          where: { id: dbUser.id },
          data: { onboardingSteps: updatedSteps },
        });
        break; }

      default:
        await db.user.update({
          where: { id: dbUser.id },
          data: { onboardingSteps: updatedSteps },
        });
    }

    revalidatePath('/onboarding');
    return { success: true };
  } catch (error) {
    return handleError(error, 'Submit Onboarding Step');
  }
}

export async function completeOnboardingAction() {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    await db.user.update({
      where: { id: dbUser.id },
      data: {
        onboardingComplete: true,
        onboardingSteps: {
          profile: true,
          company: true,
          preferences: true,
        },
      },
    });

    revalidatePath('/onboarding');
    redirect(`/app/${dbUser.organizationId}/dashboard`);
  } catch (error) {
    return handleError(error, 'Complete Onboarding');
  }
}

/**
 * Server action to set Clerk metadata after custom organization creation
 * Updates user metadata only (no Clerk organization creation since orgs are disabled)
 */
export async function setClerkUserMetadata(
  userId: string,
  organizationSlug: string,
  role: SystemRole
): Promise<SetClerkMetadataResult> {
  const actualClient: ResolvedClerkClient = await clerkClient();

  try {
    console.log('🚀 Setting user metadata for custom organization approach:', {
      userId,
      organizationSlug,
      role
    });

    // Get permissions for the role
    const userPermissions = getPermissionsForRole(role);

    // Update Clerk user metadata with custom organization info
    await actualClient.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        organizationSlug: organizationSlug, // Use slug for URL routing
      },
      privateMetadata: {
        organizationId: organizationSlug, // Use slug as the organization identifier
        role: role,
        permissions: userPermissions, // Add permissions array
        onboardingComplete: true,
        lastLogin: new Date().toISOString(),
      },
    });

    console.log('✅ Updated user metadata in Clerk (custom organization approach):', {
      userId,
      organizationSlug,
      role,
      permissions: userPermissions.length,
      onboardingComplete: true,
    });

    return { success: true, organizationId: organizationSlug, userId };
  } catch (error: any) {
    console.error('Error setting Clerk user metadata:', error);
    return handleError(error, 'Set User Metadata');
  }
}


/**
 * Complete onboarding process with new stepper flow
 */
export async function completeOnboarding(data: CompleteOnboardingData) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const parsed = CompleteOnboardingSchema.parse(data);

    const isAdmin = parsed.role === SystemRoles.ADMIN;
    let organizationId: string;
    let organizationSlug: string;

    if (isAdmin) {
      // Admin path: Create new organization
      const slug = generateSlug(parsed.companyName);
        // Create organization in database
      const organization = await db.organization.create({
        data: {
          clerkId: `org_${slug}_${Date.now()}`, // Generate a unique clerkId
          name: parsed.companyName,
          slug: slug,
          dotNumber: parsed.dotNumber || null,
          mcNumber: parsed.mcNumber || null,
          address: parsed.address,
          city: parsed.city,
          state: parsed.state,
          zip: parsed.zip,
          phone: parsed.phone || null,
        },
      });

      organizationId = organization.id;
      organizationSlug = organization.slug;

      // Create user in database
      await db.user.upsert({
        where: { clerkId: user.id },
        update: {
          organizationId: organization.id,
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          role: parsed.role as UserRole,
          onboardingComplete: true,
        },
        create: {
          clerkId: user.id,
          organizationId: organization.id,
          email: parsed.email,
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          role: parsed.role as UserRole,
          onboardingComplete: true,
        },
      });

    } else {
      // Employee path: Join existing organization
      const organization = await db.organization.findFirst({
        where: {
          OR: [
            { slug: parsed.organizationId },
            { id: parsed.organizationId }
          ]
        }
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      organizationId = organization.id;
      organizationSlug = organization.slug;

      // Create/update user in database
      await db.user.upsert({
        where: { clerkId: user.id },
        update: {
          organizationId: organization.id,
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          role: parsed.role as UserRole,
          onboardingComplete: true,
        },
        create: {
          clerkId: user.id,
          organizationId: organization.id,
          email: parsed.email,
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          role: parsed.role as UserRole,
          onboardingComplete: true,
        },
      });
    }    // Update Clerk user metadata with role and permissions
    const clerkClientInstance = await clerkClient();
    const userPermissions = getPermissionsForRole(parsed.role as SystemRole);
    
    await clerkClientInstance.users.updateUserMetadata(user.id, {
      privateMetadata: {
        organizationId: organizationSlug, // Use slug for URL routing
        role: parsed.role as UserRole,
        permissions: userPermissions, // Add permissions array
        onboardingComplete: true,
      },
      publicMetadata: {
        onboardingComplete: true,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
      },
    });

    return {
      success: true,
      organizationId: organizationSlug, // Return slug for routing
      userId: user.id,
    };

  } catch (error) {
    console.error('Complete onboarding error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to complete onboarding');
  }
}

function generateSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);
}

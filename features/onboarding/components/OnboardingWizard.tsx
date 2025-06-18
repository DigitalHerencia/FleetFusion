'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  submitOnboardingStepAction,
  completeOnboardingAction,
} from '@/lib/actions/onboardingActions';
import {
  ProfileSetupSchema,
  CompanySetupSchema,
  PreferencesSchema,
} from '@/schemas/onboarding';
import type { OnboardingStatus, OnboardingStepData } from '@/types/onboarding';
import { ProfileSetupForm } from '@/components/onboarding/ProfileSetupForm';
import { CompanySetupForm } from '@/components/onboarding/CompanySetupForm';
import { PreferencesForm } from '@/components/onboarding/PreferencesForm';

interface OnboardingWizardProps {
  initialStatus?: OnboardingStatus | null;
}

export function OnboardingWizard({ initialStatus }: OnboardingWizardProps) {
  const [status, setStatus] = useState<OnboardingStatus | null>(
    initialStatus || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Load onboarding status

  const handleStepSubmit = async (step: string, data: OnboardingStepData) => {
    setIsLoading(true);
    try {
      const result = await submitOnboardingStepAction(step, data);

      if (result.success) {
        // Refresh status via router to avoid full page reload
        router.refresh();        toast({
          title: 'Progress saved',
          description: 'Your onboarding step has been completed.',
        });
      } else {
        toast({
          title: 'Error',
          description: ('error' in result ? result.error : 'Failed to save progress'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Onboarding step error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await completeOnboardingAction();
      toast({
        title: 'Welcome!',
        description: 'Your onboarding is complete. Redirecting to dashboard...',
      });
    } catch (error) {
      console.error('Complete onboarding error:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!status) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  const steps = [
    { id: 'profile', title: 'Profile Setup', completed: status.steps.profile },
    {
      id: 'company',
      title: 'Company Details',
      completed: status.steps.company,
    },
    {
      id: 'preferences',
      title: 'Preferences',
      completed: status.steps.preferences,
    },
  ];

  const currentStepIndex = steps.findIndex(
    step => step.id === status.currentStep
  );
  const progress = (steps.filter(s => s.completed).length / steps.length) * 100;

  if (status.isComplete) {
    return (
      <div className="mx-auto mt-16 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <CardTitle>Welcome to FleetFusion!</CardTitle>
            <CardDescription>
              Your account is set up and ready to go.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Redirecting...' : 'Go to Dashboard'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-center text-3xl font-bold">
          Welcome to FleetFusion
        </h1>
        <p className="text-muted-foreground mb-6 text-center">
          Let's set up your account to get you started
        </p>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="text-muted-foreground mb-2 flex justify-between text-sm">
            <span>
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="mb-4" />

          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : index === currentStepIndex
                        ? 'bg-blue-500 text-white'
                        : 'bg-muted text-muted-foreground'
                  } `}
                >
                  {step.completed ? '✓' : index + 1}
                </div>
                <span className="mt-1 text-center text-xs">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {' '}
          {status.currentStep === 'profile' && (
            <ProfileSetupForm
              onSubmit={data => handleStepSubmit('profile', data)}
              isLoading={isLoading}
              initialData={{
                firstName: status.user.firstName || '',
                lastName: status.user.lastName || '',
              }}
            />
          )}
          {status.currentStep === 'company' && (
            <CompanySetupForm
              onSubmit={data => handleStepSubmit('company', data)}
              onPrevious={() =>
                handleStepSubmit('profile', {
                  firstName: status.user.firstName || '',
                  lastName: status.user.lastName || '',
                })
              }
              isLoading={isLoading}
            />
          )}
          {status.currentStep === 'preferences' && (
            <PreferencesForm
              onSubmit={data => handleStepSubmit('preferences', data)}
              onPrevious={() =>
                setStatus({ ...status, currentStep: 'company' })
              }
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

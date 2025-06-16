'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Truck, Users, Building, MapPinned } from 'lucide-react';

// Step Components
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { RoleSelectionStep } from './steps/RoleSelectionStep';
import { CompanySetupStep } from './steps/CompanySetupStep';
import { EmployeeJoinStep } from './steps/EmployeeJoinStep';
import { ReviewSubmitStep } from './steps/ReviewSubmitStep';

import type { SystemRole } from '@/types/abac';
import { completeOnboarding } from '@/lib/actions/onboardingActions';
import type { CompleteOnboardingData } from '@/schemas/onboarding';

export interface OnboardingFormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  role: SystemRole | '';
  
  // Company Info (for admin)
  companyName: string;
  dotNumber: string;
  mcNumber: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  
  // Employee Join (for non-admin)
  organizationId: string;
  inviteCode: string;
  
  // Common
  preferences: Record<string, any>;
}

const steps = [
  { id: 'personal', title: 'Personal Info', icon: Users },
  { id: 'role', title: 'Your Role', icon: Badge },
  { id: 'setup', title: 'Setup', icon: Building },
  { id: 'review', title: 'Review', icon: CheckCircle },
];

export function OnboardingStepper() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    role: '',
    companyName: '',
    dotNumber: '',
    mcNumber: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    organizationId: '',
    inviteCode: '',
    preferences: {},
  });

  const updateFormData = (updates: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  const handleSubmit = async () => {
    if (!user) return;
      // Validate that role is set
    if (!formData.role) {
      toast({
        title: "Missing Information",
        description: "Please complete all steps before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await completeOnboarding(formData as CompleteOnboardingData);
      
      toast({
        title: "Welcome aboard! 🎉",
        description: "Your onboarding is complete. Redirecting to your dashboard...",
      });

      // Redirect based on role
      const orgSlug = formData.role === 'admin' 
        ? generateSlug(formData.companyName)
        : formData.organizationId;
      
      setTimeout(() => {
        router.push(`/${orgSlug}/dashboard/${user.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Oops! Something went wrong",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (companyName: string): string => {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 50);
  };

  const isAdmin = formData.role === 'admin';
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPinned className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">FleetFusion</h1>
          </div>
          <p className="text-lg text-gray-400">
            Let's get you set up! This will only take a few minutes.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 
                    ${isCompleted ? 'bg-blue-500 border-blue-500 text-white' :
                      isActive ? 'border-blue-500 text-blue-500 bg-neutral-900' :
                      'border-neutral-700 text-gray-400 bg-neutral-900'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-500' : 
                      isCompleted ? 'text-blue-400' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-neutral-700 mx-4" />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="w-full [&>div]:bg-blue-500 bg-neutral-700" />
        </div>

        {/* Step Content */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 shadow-lg">
          {currentStep === 0 && (
            <PersonalInfoStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
            />
          )}
          
          {currentStep === 1 && (
            <RoleSelectionStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          
          {currentStep === 2 && (
            <>
              {isAdmin ? (
                <CompanySetupStep
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              ) : (
                <EmployeeJoinStep
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
            </>
          )}
          
          {currentStep === 3 && (
            <ReviewSubmitStep
              formData={formData}
              isAdmin={isAdmin}
              onSubmit={handleSubmit}
              onPrev={prevStep}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Fun Footer Message */}
        <div className="text-center text-gray-500">
          <p className="text-sm">
            🚛 Almost there! Your virtual trip to productivity paradise awaits... 
            <br />
            <span className="text-xs">(Tahiti not included, but the dashboard is pretty nice!)</span>
          </p>
        </div>
      </div>
    </div>
  );
}

import type { UserRole } from './auth';

export interface OnboardingStatus {
  isComplete: boolean;
  currentStep: 'profile' | 'company' | 'preferences' | 'complete';
  steps: {
    profile: boolean;
    company: boolean;
    preferences: boolean;
  };
  user: {
    id: string;
    clerkId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProfileSetupData {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CompanySetupData {
  dotNumber?: string;
  mcNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  timezone?: string;
  dateFormat?: string;
  distanceUnit?: 'miles' | 'kilometers';
  fuelUnit?: 'gallons' | 'liters';
}

export interface PreferencesData {
  notifications: {
    email: boolean;
    push: boolean;
  };
  language: string;
  theme: 'light' | 'dark' | 'system';
}

export type OnboardingStepData =
  | ProfileSetupData
  | CompanySetupData
  | PreferencesData;

export interface OnboardingStepProps {
  onNext: (data: OnboardingStepData) => void;
  onPrevious?: () => void;
  initialData?: Partial<OnboardingStepData>;
  isLoading?: boolean;
}

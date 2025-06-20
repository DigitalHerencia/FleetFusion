'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  MapPin, 
  Phone, 
  FileText,
  ArrowRight,
  ArrowLeft,
  Crown,
  Shield
} from 'lucide-react';
import type { OnboardingFormData } from '../OnboardingStepper';

interface CompanySetupStepProps {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function CompanySetupStep({ formData, updateFormData, onNext, onPrev }: CompanySetupStepProps) {
  const isValid = formData.companyName.trim() && 
                  formData.address.trim() && 
                  formData.city.trim() && 
                  formData.state.trim() && 
                  formData.zip.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onNext();
    }
  };
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
          <Crown className="h-6 w-6 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Set up your company
        </h2>
        <p className="text-gray-400">
          Let's get your trucking operation configured. We'll need some basic company information to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        {/* Company Basic Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <Building className="h-5 w-5" />
            Company Information
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-medium text-gray-200">Company Name *</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="e.g., Acme Trucking LLC"
              value={formData.companyName}
              onChange={(e) => updateFormData({ companyName: e.target.value })}
              className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-200">Company Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <MapPin className="h-5 w-5" />
            Business Address
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-200">Street Address *</Label>
            <Input
              id="address"
              type="text"
              placeholder="123 Main Street"
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
              className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-gray-200">City *</Label>
              <Input
                id="city"
                type="text"
                placeholder="Los Angeles"
                value={formData.city}
                onChange={(e) => updateFormData({ city: e.target.value })}
                className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium text-gray-200">State *</Label>
              <Input
                id="state"
                type="text"
                placeholder="CA"
                value={formData.state}
                onChange={(e) => updateFormData({ state: e.target.value })}
                className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip" className="text-sm font-medium text-gray-200">ZIP Code *</Label>
            <Input
              id="zip"
              type="text"
              placeholder="90210"
              value={formData.zip}
              onChange={(e) => updateFormData({ zip: e.target.value })}
              className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* DOT/MC Numbers */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <Shield className="h-5 w-5" />
            DOT & MC Numbers
          </div>
          
          <div className="p-4 bg-amber-900/20 border border-amber-700/30 rounded-lg">
            <p className="text-sm text-amber-300">
              <strong>Optional but recommended:</strong> These help us provide better compliance tracking and IFTA reporting features.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dotNumber" className="text-sm font-medium text-gray-200">DOT Number</Label>
              <Input
                id="dotNumber"
                type="text"
                placeholder="1234567"
                value={formData.dotNumber}
                onChange={(e) => updateFormData({ dotNumber: e.target.value })}
                className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500">
                US Department of Transportation number
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mcNumber" className="text-sm font-medium text-gray-200">MC Number</Label>
              <Input
                id="mcNumber"
                type="text"
                placeholder="MC-123456"
                value={formData.mcNumber}
                onChange={(e) => updateFormData({ mcNumber: e.target.value })}
                className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500">
                Motor Carrier identification number
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300 font-medium">Privacy & Security</p>
              <p className="text-xs text-blue-400 mt-1">
                All information is encrypted and stored securely. We comply with industry standards 
                for protecting your business data. No information is shared with third parties without your consent.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPrev}
            className="w-full border-neutral-700 bg-neutral-800 text-gray-200 hover:bg-neutral-700 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            type="submit" 
            className="w-full bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={!isValid}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

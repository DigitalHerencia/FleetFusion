'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CompanySetupSchema,
  type CompanySetupFormData,
} from '@/schemas/onboarding';

interface CompanySetupFormProps {
  onSubmit: (data: CompanySetupFormData) => void;
  onPrevious?: () => void;
  isLoading?: boolean;
  initialData?: Partial<CompanySetupFormData>;
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'America/Anchorage', label: 'Alaska Time' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time' },
];

const DATE_FORMATS = [
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
];

export function CompanySetupForm({
  onSubmit,
  onPrevious,
  isLoading,
  initialData,
}: CompanySetupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CompanySetupFormData>({
    defaultValues: {
      timezone: 'America/Denver',
      dateFormat: 'MM/dd/yyyy',
      distanceUnit: 'miles',
      fuelUnit: 'gallons',
      ...initialData,
    },
    mode: 'onChange',
  });

  const watchedTimezone = watch('timezone');
  const watchedDateFormat = watch('dateFormat');
  const watchedDistanceUnit = watch('distanceUnit');
  const watchedFuelUnit = watch('fuelUnit');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold">Company Information</h2>
        <p className="text-muted-foreground">
          Set up your company profile and operational preferences
        </p>
      </div>

      {/* DOT & MC Numbers */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dotNumber">DOT Number</Label>
          <Input
            id="dotNumber"
            {...register('dotNumber')}
            placeholder="Enter DOT number"
            className={errors.dotNumber ? 'border-red-500' : ''}
          />
          {errors.dotNumber && (
            <p className="text-sm text-red-500">{errors.dotNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mcNumber">MC Number</Label>
          <Input
            id="mcNumber"
            {...register('mcNumber')}
            placeholder="Enter MC number"
            className={errors.mcNumber ? 'border-red-500' : ''}
          />
          {errors.mcNumber && (
            <p className="text-sm text-red-500">{errors.mcNumber.message}</p>
          )}
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Business Address</h3>

        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="Enter street address"
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...register('city')}
              placeholder="Enter city"
              className={errors.city ? 'border-red-500' : ''}
            />
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select
              value={watch('state') || ''}
              onValueChange={value => setValue('state', value)}
            >
              <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(state => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && (
              <p className="text-sm text-red-500">{errors.state.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              {...register('zip')}
              placeholder="Enter ZIP code"
              className={errors.zip ? 'border-red-500' : ''}
            />
            {errors.zip && (
              <p className="text-sm text-red-500">{errors.zip.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Business Phone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="Enter business phone number"
            type="tel"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Operational Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Operational Preferences</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={watchedTimezone}
              onValueChange={value => setValue('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(timezone => (
                  <SelectItem key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Format</Label>
            <Select
              value={watchedDateFormat}
              onValueChange={value => setValue('dateFormat', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map(format => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Distance Unit</Label>
            <Select
              value={watchedDistanceUnit}
              onValueChange={value =>
                setValue('distanceUnit', value as 'miles' | 'kilometers')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select distance unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="miles">Miles</SelectItem>
                <SelectItem value="kilometers">Kilometers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fuel Unit</Label>
            <Select
              value={watchedFuelUnit}
              onValueChange={value =>
                setValue('fuelUnit', value as 'gallons' | 'liters')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fuel unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gallons">Gallons</SelectItem>
                <SelectItem value="liters">Liters</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col justify-between pt-4">
        {onPrevious && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isLoading}
          >
            Previous
          </Button>
        )}
        <div className="flex-1" />
        <Button type="submit" disabled={isLoading} className="px-8">
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </form>
  );
}

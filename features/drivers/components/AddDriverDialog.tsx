'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DriverForm } from '@/components/drivers/DriverForm';
import { driverFormSchema } from '@/schemas/drivers';
import { createDriverAction } from '@/lib/actions/driverActions';
import { toast } from '@/hooks/use-toast';
import type { DriverFormData } from '@/types/drivers';

interface AddDriverDialogProps {
  orgId: string;
  onSuccess?: () => void;
}

export function AddDriverDialog({ orgId, onSuccess }: AddDriverDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    values: DriverFormData;
    errors: Record<string, string>;
    submitting: boolean;
    serverError: string | undefined;
    mode: 'create' | 'edit';
  }>({
    values: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      hireDate: '',
      payRate: 0,
      payType: 'salary',
      homeTerminal: '',
      cdlNumber: '',
      cdlState: '',
      cdlClass: 'A',
      cdlExpiration: '',
      medicalCardNumber: '',
      medicalCardExpiration: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
      },      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
      dateOfBirth: '',
      employeeId: '',
      endorsements: [],
      restrictions: [],
      tags: [],
      notes: '',
    },
    errors: {},
    submitting: false,
    serverError: undefined,
    mode: 'create',
  });

  const handleFieldChange = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      errors: { ...prev.errors, [field]: '' }, // Clear field error on change
      serverError: undefined, // Clear server error on change
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setForm(prev => ({ ...prev, submitting: true, errors: {}, serverError: undefined }));

    try {
      // Validate form data
      const validationResult = driverFormSchema.safeParse(form.values);
      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {};
        validationResult.error.errors.forEach(error => {
          const path = error.path.join('.');
          fieldErrors[path] = error.message;
        });
        setForm(prev => ({
          ...prev,
          errors: fieldErrors,
          submitting: false,
        }));
        return;
      }

      // Submit the form
      const result = await createDriverAction(orgId, form.values);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Driver created successfully',
        });
          // Reset form
        setForm(prev => ({
          ...prev,
          values: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            hireDate: '',
            payRate: 0,
            payType: 'salary',
            homeTerminal: '',
            cdlNumber: '',
            cdlState: '',
            cdlClass: 'A',
            cdlExpiration: '',
            medicalCardNumber: '',
            medicalCardExpiration: '',
            address: {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'US',
            },
            emergencyContact: {
              name: '',
              relationship: '',
              phone: '',
            },
            dateOfBirth: '',
            employeeId: '',
            endorsements: [],
            restrictions: [],
            tags: [],
            notes: '',
          },
          submitting: false,
        }));
        
        setOpen(false);
        onSuccess?.();
      } else {
        setForm(prev => ({
          ...prev,
          serverError: result.error,
          submitting: false,
        }));
        
        toast({
          title: 'Error',
          description: result.error || 'Failed to create driver',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setForm(prev => ({
        ...prev,
        serverError: 'An unexpected error occurred',
        submitting: false,
      }));
      
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
        </DialogHeader>
        <DriverForm
          form={{
            values: form.values,
            errors: form.errors,
            onChange: handleFieldChange,
            onSubmit: handleSubmit,
            submitting: form.submitting,
            serverError: form.serverError,
            mode: form.mode,
          }}
        />
        {form.serverError && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {form.serverError}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

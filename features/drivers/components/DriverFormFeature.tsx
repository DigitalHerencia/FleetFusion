'use client';
import React, { useState } from 'react';
import type { DriverFormData } from "@/types/drivers";
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DocumentUploadForm } from '@/components/compliance/DocumentUploadForm';
import { driverFormSchema } from '@/schemas/drivers';
import { DriverForm } from '@/components/drivers/DriverForm';
import {
  createDriverAction,
  updateDriverAction,
} from '@/lib/actions/driverActions';
import { toast } from '@/hooks/use-toast';

export interface DriverFormFeatureProps {
  initialValues?: DriverFormData;
  mode: 'create' | 'edit';
  driverId?: string;
  /** Tenant/organization id for create operations */
  orgId?: string;
  onSuccess?: () => void;
}

export function DriverFormFeature({
  initialValues,
  mode,
  driverId,
  orgId,
  onSuccess,
}: DriverFormFeatureProps) {
  const [form, setForm] = useState<{
    values: DriverFormData;
    errors: Record<string, string>;
    submitting: boolean;
    serverError: string | undefined;
    mode: 'create' | 'edit';
  }>({
    values:
      initialValues ||
      driverFormSchema.parse({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        hireDate: '',
        homeTerminal: '',
        cdlNumber: '',
        cdlState: '',
        cdlClass: 'A',
        cdlExpiration: '',
        medicalCardExpiration: '',
        notes: '',
      }),
    errors: {},
    submitting: false,
    serverError: undefined,
    mode,
  });

  const [showUpload, setShowUpload] = useState(false);

  function handleChange(field: string, value: any) {
    setForm(prev => {
      // Create a new errors object without the field
      const { [field]: _removed, ...restErrors } = prev.errors;
      return {
        ...prev,
        values: { ...prev.values, [field]: value },
        errors: restErrors,
      };
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setForm(prev => ({ ...prev, submitting: true, serverError: undefined }));
    let parsed;
    try {
      parsed = driverFormSchema.parse(form.values);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach(e => {
          if (e.path[0]) errors[e.path[0] as string] = e.message;
        });
        setForm(prev => ({ ...prev, errors, submitting: false }));
        return;
      }
      setForm(prev => ({
        ...prev,
        serverError: 'Validation failed',
        submitting: false,
      }));
      return;
    }
    try {
      let result;
      if (mode === 'edit' && driverId) {
        result = await updateDriverAction(driverId, parsed);
      } else {
        if (!orgId) {
          setForm(prev => ({
            ...prev,
            serverError: 'Organization ID required',
            submitting: false,
          }));
          return;
        }
        result = await createDriverAction(orgId, parsed);
      }
      if (result.success) {
        toast({
          title: 'Driver saved',
          description: 'Driver profile has been updated.',
        });
        setForm(prev => ({ ...prev, submitting: false }));
        onSuccess?.();
      } else {
        setForm(prev => ({
          ...prev,
          serverError: result.error || 'Failed to save',
          submitting: false,
        }));
      }
    } catch (err) {
      setForm(prev => ({
        ...prev,
        serverError: 'Server error',
        submitting: false,
      }));
    }
  }

  function handleUploadDocument() {
    setShowUpload(true);
  }

  return (
    <>
      <DriverForm
        form={{
          ...form,
          onChange: handleChange,
          onSubmit: handleSubmit,
        }}
        onUploadDocument={handleUploadDocument}
      />{' '}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <DocumentUploadForm
            entityType="driver"
            entityId={driverId || 'new'}
            onUpload={() => setShowUpload(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

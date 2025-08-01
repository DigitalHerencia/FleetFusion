'use client';
import React, { useState } from 'react';
import type { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { assignDriverAction, unassignDriverAction } from '@/lib/actions/driverActions';
import { toast } from '@/hooks/use-toast';
import { driverAssignmentSchema } from '@/schemas/drivers';

interface DriverAssignmentDialogProps {
  driverId: string;
  open: boolean;
  onClose: () => void;
  currentAssignment?: {
    loadId?: string;
    vehicleId?: string;
    trailerId?: string;
    assignmentType?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
  };
  onAssigned?: () => void;
}

export function DriverAssignmentDialog({
  driverId,
  open,
  onClose,
  currentAssignment,
  onAssigned,
}: DriverAssignmentDialogProps) {
  type AssignmentType = z.infer<typeof driverAssignmentSchema>['assignmentType'];

  const [form, setForm] = useState<{
    loadId: string;
    vehicleId: string;
    assignmentType: AssignmentType;
    scheduledStart: string;
    scheduledEnd: string;
    submitting: boolean;
    error: string;
  }>({
    loadId: currentAssignment?.loadId || '',
    vehicleId: currentAssignment?.vehicleId || '',
    assignmentType: (currentAssignment?.assignmentType as AssignmentType) || 'load',
    scheduledStart: currentAssignment?.scheduledStart || '',
    scheduledEnd: currentAssignment?.scheduledEnd || '',
    submitting: false,
    error: '',
  });

  async function handleAssign() {
    setForm((f) => ({ ...f, submitting: true, error: '' }));
    try {
      const assignment = driverAssignmentSchema.parse({
        driverId,
        loadId: form.loadId || undefined,
        vehicleId: form.vehicleId || undefined,
        assignmentType: form.assignmentType,
        scheduledStart: form.scheduledStart,
        scheduledEnd: form.scheduledEnd || undefined,
      });
      const result = await assignDriverAction(assignment);
      if (result.success) {
        toast({ title: 'Driver assigned', description: 'Assignment updated.' });
        onAssigned?.();
        onClose();
      } else {
        setForm((f) => ({ ...f, error: result.error || 'Failed to assign' }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Validation error';
      setForm((f) => ({ ...f, error: message }));
    } finally {
      setForm((f) => ({ ...f, submitting: false }));
    }
  }

  async function handleUnassign() {
    setForm((f) => ({ ...f, submitting: true, error: '' }));
    try {
      const result = await unassignDriverAction(driverId);
      if (result.success) {
        toast({
          title: 'Driver unassigned',
          description: 'Assignment removed.',
        });
        onAssigned?.();
        onClose();
      } else {
        setForm((f) => ({ ...f, error: result.error || 'Failed to unassign' }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error';
      setForm((f) => ({ ...f, error: message }));
    } finally {
      setForm((f) => ({ ...f, submitting: false }));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-black border-neutral-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Assign Driver</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Load ID (optional)"
            value={form.loadId}
            onChange={(e) => setForm((f) => ({ ...f, loadId: e.target.value }))}
            disabled={form.submitting}
            className="bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-400"
          />
          <Input
            placeholder="Vehicle ID (optional)"
            value={form.vehicleId}
            onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
            disabled={form.submitting}
            className="bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-400"
          />
          <Input
            placeholder="Assignment Type (e.g. load, maintenance)"
            value={form.assignmentType}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                assignmentType: e.target.value as AssignmentType,
              }))
            }
            disabled={form.submitting}
            className="bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-400"
          />
          <Input
            placeholder="Scheduled Start (YYYY-MM-DDTHH:mm)"
            value={form.scheduledStart}
            onChange={(e) => setForm((f) => ({ ...f, scheduledStart: e.target.value }))}
            disabled={form.submitting}
            type="datetime-local"
            className="bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-400"
          />
          <Input
            placeholder="Scheduled End (optional)"
            value={form.scheduledEnd}
            onChange={(e) => setForm((f) => ({ ...f, scheduledEnd: e.target.value }))}
            disabled={form.submitting}
            type="datetime-local"
            className="bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-400"
          />
          {form.error && <div className="text-sm text-red-400">{form.error}</div>}
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            onClick={handleAssign}
            disabled={form.submitting}
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Assign
          </Button>
          <Button
            onClick={handleUnassign}
            disabled={form.submitting}
            type="button"
            variant="outline"
            className="border-neutral-600 text-white hover:bg-neutral-700"
          >
            Unassign
          </Button>
          <Button
            onClick={onClose}
            type="button"
            variant="ghost"
            className="text-neutral-400 hover:text-white hover:bg-neutral-700"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

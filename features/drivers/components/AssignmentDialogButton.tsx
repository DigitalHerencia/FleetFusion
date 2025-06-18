'use client';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { DriverAssignmentDialog } from '@/features/drivers/components/DriverAssignmentDialog';

export function AssignmentDialogButton({
  driverId,
  currentAssignment,
}: {
  driverId: string;
  currentAssignment?: any;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" className="ml-2" onClick={() => setOpen(true)}>
        Assign/Unassign
      </Button>
      <DriverAssignmentDialog
        driverId={driverId}
        open={open}
        onClose={() => setOpen(false)}
        currentAssignment={
          typeof currentAssignment === 'object' ? currentAssignment : undefined
        }
        onAssigned={() => setOpen(false)}
      />
    </>
  );
}

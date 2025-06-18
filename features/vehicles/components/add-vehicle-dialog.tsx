'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VehicleFormData, Vehicle } from '@/types/vehicles';
import { submitVehicleForm } from '../lib/vehicleForm';

interface Props {
  orgId: string;
  onSuccess: (vehicle: Vehicle) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialState: VehicleFormData = {
  unitNumber: '',
  type: 'tractor',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  vin: '',
  licensePlate: '',
  fuelType: undefined,
  engineType: undefined,
  registrationNumber: undefined,
  registrationExpiry: undefined,
  insuranceProvider: undefined,
  insurancePolicyNumber: undefined,
  insuranceExpiry: undefined,
  currentLocation: undefined,
  totalMileage: undefined,
  nextMaintenanceDate: undefined,
  nextMaintenanceMileage: undefined,
};

export default function AddVehicleDialog({
  orgId,
  onSuccess,
  open,
  onOpenChange,
}: Props) {
  const [form, setForm] = useState<VehicleFormData>(initialState);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const vehicle = await submitVehicleForm(orgId, form);
      onSuccess(vehicle);
      onOpenChange(false);
      setForm(initialState);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitNumber">Unit Number</Label>
              <Input
                id="unitNumber"
                name="unitNumber"
                value={form.unitNumber}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Vehicle Type</Label>
              <Select
                value={form.type}
                onValueChange={val =>
                  setForm(prev => ({
                    ...prev,
                    type: val as VehicleFormData['type'],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tractor">Tractor</SelectItem>
                  <SelectItem value="trailer">Trailer</SelectItem>
                  <SelectItem value="straight_truck">Straight Truck</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                name="make"
                value={form.make}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                value={form.model}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                type="number"
                value={form.year}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                name="vin"
                value={form.vin}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {' '}
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input
                id="licensePlate"
                name="licensePlate"
                value={form.licensePlate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            Add Vehicle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

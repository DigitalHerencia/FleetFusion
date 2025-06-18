'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { updateLoadAction } from '@/lib/actions/loadActions';
import { AddressFields } from '@/components/shared/AddressFields';
import { ContactFields } from '@/components/shared/ContactFields';

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
}

interface Vehicle {
  id: string;
  unitNumber: string;
  type: string;
}

interface LoadFormProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  onClose?: () => void;
  load?: {
    id: string;
    referenceNumber: string;
    status: string;
    customerName: string;
    customerContact: string;
    customerPhone: string;
    customerEmail: string;
    originAddress: string;
    originCity: string;
    originState: string;
    originZip: string;
    destinationAddress: string;
    destinationCity: string;
    destinationState: string;
    destinationZip: string;
    pickupDate: string;
    deliveryDate: string;
    commodity: string;
    weight: number;
    rate: number;
    miles: number;
    notes: string;
    driverId: string;
    vehicleId: string;
    trailerId: string;
  };
}

export function LoadForm({ drivers, vehicles, load, onClose }: LoadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tractors = vehicles.filter(vehicle => vehicle.type === 'tractor');
  const trailers = vehicles.filter(vehicle => vehicle.type === 'trailer');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);

      if (load) {
        // Convert FormData to plain object and add id
        const data: any = { id: load.id };
        formData.forEach((value, key) => {
          data[key] = value;
        });
        const result = await updateLoadAction(load.id, data);
        if (result.success) {
          toast({
            title: 'Load updated',
            description: 'The load has been updated successfully.',
          });
          onClose?.();
        } else {
          toast({
            title: 'Error',
            description: 'Failed to update load. Please try again.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOriginAddressValues = () => ({
    address: load?.originAddress || '',
    city: load?.originCity || '',
    state: load?.originState || '',
    zip: load?.originZip || '',
  });
  const getDestinationAddressValues = () => ({
    address: load?.destinationAddress || '',
    city: load?.destinationCity || '',
    state: load?.destinationState || '',
    zip: load?.destinationZip || '',
  });
  const getContactValues = () => ({
    customerContact: load?.customerContact || '',
    customerPhone: load?.customerPhone || '',
    customerEmail: load?.customerEmail || '',
  });

  return (
    <Card className="mx-auto w-full max-w-2xl border border-gray-700 bg-neutral-900 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">
          {load ? 'Edit Load' : 'Create New Load'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="assignment">Assignment</TabsTrigger>
              <TabsTrigger value="details">Additional Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="referenceNumber">Reference Number</Label>
                      <Input
                        id="referenceNumber"
                        name="referenceNumber"
                        defaultValue={load?.referenceNumber || ''}
                        placeholder="e.g., L-1001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        name="status"
                        defaultValue={load?.status || 'pending'}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="in_transit">In Transit</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      defaultValue={load?.customerName || ''}
                      placeholder="e.g., ABC Distributors"
                      required
                    />
                  </div>

                  <ContactFields values={getContactValues()} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Origin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AddressFields
                    prefix="origin"
                    values={getOriginAddressValues()}
                    required
                  />
                  <div className="space-y-2">
                    <Label htmlFor="pickupDate">Pickup Date & Time</Label>
                    <Input
                      id="pickupDate"
                      name="pickupDate"
                      type="datetime-local"
                      defaultValue={load?.pickupDate || ''}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Destination</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AddressFields
                    prefix="destination"
                    values={getDestinationAddressValues()}
                    required
                  />
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Delivery Date & Time</Label>
                    <Input
                      id="deliveryDate"
                      name="deliveryDate"
                      type="datetime-local"
                      defaultValue={load?.deliveryDate || ''}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignment" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="driverId">Driver</Label>
                    <Select name="driverId" defaultValue={load?.driverId || ''}>
                      <SelectTrigger id="driverId">
                        <SelectValue placeholder="Select a driver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_assigned">
                          Not Assigned
                        </SelectItem>
                        {drivers.map(driver => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.firstName} {driver.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleId">Tractor</Label>
                    <Select
                      name="vehicleId"
                      defaultValue={load?.vehicleId || ''}
                    >
                      <SelectTrigger id="vehicleId">
                        <SelectValue placeholder="Select a tractor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_assigned">
                          Not Assigned
                        </SelectItem>
                        {tractors.map(tractor => (
                          <SelectItem key={tractor.id} value={tractor.id}>
                            {tractor.unitNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trailerId">Trailer</Label>
                    <Select
                      name="trailerId"
                      defaultValue={load?.trailerId || ''}
                    >
                      <SelectTrigger id="trailerId">
                        <SelectValue placeholder="Select a trailer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_assigned">
                          Not Assigned
                        </SelectItem>
                        {trailers.map(trailer => (
                          <SelectItem key={trailer.id} value={trailer.id}>
                            {trailer.unitNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="commodity">Commodity</Label>
                      <Input
                        id="commodity"
                        name="commodity"
                        defaultValue={load?.commodity || ''}
                        placeholder="e.g., Electronics"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (lbs)</Label>
                      <Input
                        id="weight"
                        name="weight"
                        type="number"
                        defaultValue={load?.weight || ''}
                        placeholder="e.g., 15000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="rate">Rate ($)</Label>
                      <Input
                        id="rate"
                        name="rate"
                        type="number"
                        step="0.01"
                        defaultValue={load?.rate || ''}
                        placeholder="e.g., 2500.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="miles">Miles</Label>
                      <Input
                        id="miles"
                        name="miles"
                        type="number"
                        defaultValue={load?.miles || ''}
                        placeholder="e.g., 267"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      defaultValue={load?.notes || ''}
                      placeholder="Enter any additional notes about this load"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end gap-2">
            {onClose && (
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="default" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : load
                  ? 'Update Load'
                  : 'Create Load'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

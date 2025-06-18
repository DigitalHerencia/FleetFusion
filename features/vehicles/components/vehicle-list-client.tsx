'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { Vehicle } from '@/types/vehicles';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { VehicleDetailsDialog } from '@/components/vehicles/vehicle-details-dialog';

import AddVehicleDialog from './add-vehicle-dialog';

interface Props {
  orgId: string;
  initialVehicles: Vehicle[]; // Now using the complete Vehicle type
}

export default function VehicleListClient({ orgId, initialVehicles }: Props) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const filtered = vehicles.filter(v =>
    [v.unitNumber || '', v.vin, v.make, v.model]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleAdd = (vehicle: Vehicle) => {
    setVehicles(prev => [...prev, vehicle]);
    setAddDialogOpen(false);
  };

  const handleCardClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailsDialogOpen(true);
  };

  const handleVehicleUpdate = (updatedVehicle: Vehicle) => {
    setVehicles(prev => 
      prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v)
    );
    setSelectedVehicle(updatedVehicle);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder="Search vehicles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {search ? 'No vehicles found matching your search.' : 'No vehicles found.'}
          </div>
          {!search && (
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Vehicle
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(vehicle => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onClick={() => handleCardClick(vehicle)} 
            />
          ))}
        </div>
      )}

      <AddVehicleDialog
        orgId={orgId}
        onSuccess={handleAdd}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      {selectedVehicle && (
        <VehicleDetailsDialog
          vehicle={selectedVehicle}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          onVehicleUpdate={handleVehicleUpdate}
        />
      )}
    </div>
  );
}

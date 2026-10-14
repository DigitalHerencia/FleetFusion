'use client';

import type {
  Vehicle,
  VehicleDocument,
  VehicleInspection,
  VehicleMaintenance,
} from '@prisma/client';

interface VehicleDetailClientProps {
  vehicle: Vehicle & {
    inspections: VehicleInspection[];
    maintenanceRecords: VehicleMaintenance[];
    documents: VehicleDocument[];
  };
}

/**
 * VehicleDetailClient is a client component for interactive parts of the vehicle detail view.
 * It displays full details of a vehicle and its related records.
 */
export function VehicleDetailClient({ vehicle }: VehicleDetailClientProps) {
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">
        Vehicle Detail: {vehicle.name || 'Unnamed'} ({vehicle.vin || 'No VIN'})
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p>
            <strong>Status:</strong> {vehicle.status}
          </p>
          <p>
            <strong>Type:</strong> {vehicle.type}
          </p>
          <p>
            <strong>Year/Make/Model:</strong> {vehicle.year ?? '—'} / {vehicle.make ?? '—'} /{' '}
            {vehicle.model ?? '—'}
          </p>
          <p>
            <strong>Unit Number:</strong> {vehicle.name || '—'}
          </p>
          <p>
            <strong>VIN:</strong> {vehicle.vin || '—'}
          </p>
          <p>
            <strong>License Plate:</strong>{' '}
            {vehicle.plateNumber ? `${vehicle.plateNumber} (${vehicle.plateState})` : '—'}
          </p>
          <p>
            <strong>Odometer:</strong> {vehicle.odometer ?? '—'}
          </p>
          <p>
            <strong>Fuel Type:</strong> {vehicle.fuelType ?? '—'}
          </p>
          <p>
            <strong>Axle Count:</strong> {vehicle.axleCount ?? '—'}
          </p>
        </div>
        <div>
          <h2 className="font-medium">Maintenance Records ({vehicle.maintenanceRecords.length})</h2>
          <ul className="list-disc pl-5 text-sm">
            {vehicle.maintenanceRecords.map((m) => (
              <li key={m.id}>
                {m.description} – {new Date(m.performedAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
          <h2 className="mt-4 font-medium">Inspections ({vehicle.inspections.length})</h2>
          <ul className="list-disc pl-5 text-sm">
            {vehicle.inspections.map((insp) => (
              <li key={insp.id}>
                Inspection on {new Date(insp.inspectedAt).toLocaleDateString()} – Defects:{' '}
                {insp.defectsFound ? 'Yes' : 'No'}
              </li>
            ))}
          </ul>
          <h2 className="mt-4 font-medium">Documents ({vehicle.documents.length})</h2>
          <ul className="list-disc pl-5 text-sm">
            {vehicle.documents.map((doc) => (
              <li key={doc.id}>
                {doc.title} ({doc.type})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

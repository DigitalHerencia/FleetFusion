import type { VehicleFormData, Vehicle } from '../types/vehicles';
import { createVehicleAction } from '@/lib/actions/vehicleActions';

export async function submitVehicleForm(orgId: string, form: VehicleFormData) {
  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  });
  const result = await createVehicleAction(orgId, formData);
  if (result.success && result.data) {
    return result.data as unknown as Vehicle;
  }
  throw new Error(result.error || 'Failed to create vehicle');
}

import { z } from 'zod';

export const tripSchema = z.object({
  source: z.string().min(1, 'Start location is required'),
  destination: z.string().min(1, 'Destination is required'),
  vehicleId: z.string().uuid('Please select a valid vehicle'),
  driverId: z.string().uuid('Please select a valid driver'),
  cargoWeightKg: z.preprocess((val) => Number(val), z.number().positive('Cargo weight must be positive')),
  plannedDistanceKm: z.preprocess((val) => Number(val), z.number().positive('Distance must be positive')),
  revenue: z.preprocess((val) => Number(val), z.number().nonnegative('Revenue cannot be negative')),
});

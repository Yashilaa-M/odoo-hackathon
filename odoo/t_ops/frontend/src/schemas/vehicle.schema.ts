import { z } from 'zod';

export const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required'),
  nameModel: z.string().min(1, 'Name and Model are required'),
  type: z.enum(['TRUCK', 'VAN', 'BIKE']),
  maxLoadCapacityKg: z.preprocess((val) => Number(val), z.number().positive('Capacity must be positive')),
  odometerKm: z.preprocess((val) => Number(val), z.number().nonnegative('Odometer reading cannot be negative').default(0)),
  acquisitionCost: z.preprocess((val) => Number(val), z.number().nonnegative('Cost cannot be negative')),
  region: z.string().optional(),
});

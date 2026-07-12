import { z } from 'zod';

export const driverSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseCategory: z.string().min(1, 'License category is required'),
  licenseExpiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid expiry date' }),
  contactNumber: z.string().min(1, 'Contact number is required'),
  safetyScore: z.preprocess((val) => Number(val), z.number().min(0).max(100).default(100)),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']).default('AVAILABLE'),
});

import { Trip } from './trip';
import { Vehicle } from './vehicle';

export type ExpenseCategory = 'TOLL' | 'MAINTENANCE' | 'FUEL' | 'OTHER';

export interface Expense {
  id: string;
  vehicleId: string;
  tripId?: string | null;
  category: ExpenseCategory;
  amount: number;
  description?: string | null;
  incurredDate: string;
  createdBy?: string | null;
  vehicle?: Vehicle;
  trip?: Trip;
}

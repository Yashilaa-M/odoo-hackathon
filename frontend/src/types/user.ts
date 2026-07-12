export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'FLEET_MANAGER' | 'DRIVER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { DriversPage } from './pages/DriversPage';
import { FinancePage } from './pages/FinancePage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { RegisterPage } from './pages/RegisterPage';
import { ReportsPage } from './pages/ReportsPage';
import { TripsPage } from './pages/TripsPage';
import { VehiclesPage } from './pages/VehiclesPage';

const UnauthorizedPage = () => (
  <div className="flex h-[80vh] items-center justify-center flex-col text-center space-y-4">
    <h1 className="text-3xl font-extrabold text-destructive">403 - Forbidden</h1>
    <p className="text-muted-foreground text-sm">Your security role permissions do not authorize access to this panel.</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <DashboardPage />,
      },
      {
        path: 'vehicles',
        element: <VehiclesPage />,
      },
      {
        path: 'drivers',
        element: (
          <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER']}>
            <DriversPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'trips',
        element: (
          <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER']}>
            <TripsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'maintenance',
        element: (
          <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'SAFETY_OFFICER']}>
            <MaintenancePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'finance',
        element: (
          <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}>
            <FinancePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
    ],
  },
  // legacy redirect
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

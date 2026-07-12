import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const DemoPage = lazy(() => import('./pages/DemoPage').then((module) => ({ default: module.DemoPage })));
const DriversPage = lazy(() => import('./pages/DriversPage').then((module) => ({ default: module.DriversPage })));
const FinancePage = lazy(() => import('./pages/FinancePage').then((module) => ({ default: module.FinancePage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage').then((module) => ({ default: module.MaintenancePage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((module) => ({ default: module.ReportsPage })));
const TripsPage = lazy(() => import('./pages/TripsPage').then((module) => ({ default: module.TripsPage })));
const VehiclesPage = lazy(() => import('./pages/VehiclesPage').then((module) => ({ default: module.VehiclesPage })));

const withSuspense = (element: React.ReactNode) => (
  <Suspense
    fallback={
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-transit-text-secondary">
        Loading TransitOps module...
      </div>
    }
  >
    {element}
  </Suspense>
);

const UnauthorizedPage = () => (
  <div className="flex h-[80vh] items-center justify-center flex-col text-center space-y-4">
    <h1 className="text-3xl font-extrabold text-destructive">403 - Forbidden</h1>
    <p className="text-muted-foreground text-sm">Your security role permissions do not authorize access to this panel.</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(<LandingPage />),
  },
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: withSuspense(<DashboardPage />),
      },
      {
        path: 'vehicles',
        element: withSuspense(<VehiclesPage />),
      },
      {
        path: 'drivers',
        element: (
          <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER']}>
            {withSuspense(<DriversPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'trips',
        element: (
          <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER']}>
            {withSuspense(<TripsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'maintenance',
        element: (
          <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'SAFETY_OFFICER']}>
            {withSuspense(<MaintenancePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'finance',
        element: (
          <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}>
            {withSuspense(<FinancePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}>
            {withSuspense(<ReportsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'demo',
        element: withSuspense(<DemoPage />),
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
    ],
  },
]);

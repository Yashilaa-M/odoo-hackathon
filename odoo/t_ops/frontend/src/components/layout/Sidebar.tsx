import { BarChart3, LayoutDashboard, Route, Shield, Truck, Users, Wallet, Wrench } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  if (!user) return null;

  const links = [
    {
      to: '/app',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
    },
    {
      to: '/app/vehicles',
      label: 'Vehicles',
      icon: Truck,
      roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
    },
    {
      to: '/app/drivers',
      label: 'Drivers',
      icon: Users,
      roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER'],
    },
    {
      to: '/app/trips',
      label: 'Trips',
      icon: Route,
      roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER'],
    },
    {
      to: '/app/maintenance',
      label: 'Maintenance',
      icon: Wrench,
      roles: ['FLEET_MANAGER', 'SAFETY_OFFICER'],
    },
    {
      to: '/app/finance',
      label: 'Finance',
      icon: Wallet,
      roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'],
    },
    {
      to: '/app/reports',
      label: 'Reports',
      icon: BarChart3,
      roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'],
    },
    {
      to: '/app/demo',
      label: 'Demo Lab',
      icon: Shield,
      roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
    },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(user.role));

  return (
    <aside className="hidden h-full w-72 flex-shrink-0 flex-col justify-between border-r border-border bg-transit-surface1/88 backdrop-blur md:flex">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="rounded-2xl bg-gradient-primary p-2 text-white shadow-glow-active">
            <Route className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">TransitOps</span>
        </div>
        <nav className="space-y-1">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-primary text-white shadow-glow-active scale-[1.01]'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-border p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-border bg-transit-surface2 p-2">
            <Shield className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Access Level</p>
            <p className="text-xs font-semibold text-foreground">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

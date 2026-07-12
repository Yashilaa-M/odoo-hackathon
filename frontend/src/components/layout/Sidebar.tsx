import { BarChart3, LayoutDashboard, Route, Shield, Truck, Users, Wallet, Wrench } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  if (!user) return null;

  const links = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
    },
    {
      to: '/vehicles',
      label: 'Vehicles',
      icon: Truck,
      roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
    },
    {
      to: '/drivers',
      label: 'Drivers',
      icon: Users,
      roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER'],
    },
    {
      to: '/trips',
      label: 'Trips',
      icon: Route,
      roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER'],
    },
    {
      to: '/maintenance',
      label: 'Maintenance',
      icon: Wrench,
      roles: ['FLEET_MANAGER', 'SAFETY_OFFICER'],
    },
    {
      to: '/finance',
      label: 'Finance',
      icon: Wallet,
      roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'],
    },
    {
      to: '/reports',
      label: 'Reports',
      icon: BarChart3,
      roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'],
    },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(user.role));

  return (
    <aside className="hidden md:flex w-64 bg-card border-r border-border h-full flex-col justify-between flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary rounded-lg text-white">
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
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
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
      <div className="p-6 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary rounded-full">
            <Shield className="h-5 w-5 text-primary" />
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

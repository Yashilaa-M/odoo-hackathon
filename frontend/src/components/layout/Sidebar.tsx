import {
  BarChart3,
  LayoutDashboard,
  Menu,
  Route,
  Shield,
  Truck,
  Users,
  Wallet,
  Wrench,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

const NAV_LINKS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
  },
  {
    to: '/dashboard/vehicles',
    label: 'Vehicles',
    icon: Truck,
    roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
  },
  {
    to: '/dashboard/drivers',
    label: 'Drivers',
    icon: Users,
    roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER'],
  },
  {
    to: '/dashboard/trips',
    label: 'Trips',
    icon: Route,
    roles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER'],
  },
  {
    to: '/dashboard/maintenance',
    label: 'Maintenance',
    icon: Wrench,
    roles: ['FLEET_MANAGER', 'SAFETY_OFFICER'],
  },
  {
    to: '/dashboard/finance',
    label: 'Finance',
    icon: Wallet,
    roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'],
  },
  {
    to: '/dashboard/reports',
    label: 'Reports',
    icon: BarChart3,
    roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'],
  },
];

interface SidebarContentProps {
  user: any;
  filteredLinks: typeof NAV_LINKS;
  onNavClick?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ user, filteredLinks, onNavClick }) => (
  <>
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
              end={link.to === '/dashboard'}
              onClick={onNavClick}
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
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Access Level
          </p>
          <p className="text-xs font-semibold text-foreground">{user?.role?.replace(/_/g, ' ')}</p>
        </div>
      </div>
    </div>
  </>
);

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const filteredLinks = NAV_LINKS.filter((link) => link.roles.includes(user.role));

  return (
    <>
      {/* ── Hamburger button (mobile only) ── */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-md text-foreground"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <div
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border flex flex-col justify-between transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-secondary text-muted-foreground"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent
          user={user}
          filteredLinks={filteredLinks}
          onNavClick={() => setMobileOpen(false)}
        />
      </div>

      {/* ── Desktop sidebar (always visible on md+) ── */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border h-full flex-col justify-between flex-shrink-0">
        <SidebarContent user={user} filteredLinks={filteredLinks} />
      </aside>
    </>
  );
};

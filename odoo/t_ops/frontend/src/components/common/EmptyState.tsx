import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<any>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon: Icon }) => (
  <div className="p-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
    {Icon && <Icon className="h-8 w-8 text-muted-foreground/60" />}
    <h3 className="font-semibold text-foreground">{title}</h3>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-card border border-border p-6 rounded-xl animate-pulse space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="h-4 w-1/3 bg-muted rounded"></div>
        <div className="h-8 w-8 bg-muted rounded-full"></div>
      </div>
      <div className="h-8 w-2/3 bg-muted rounded"></div>
      <div className="h-3 w-1/2 bg-muted rounded"></div>
    </div>
  );
};

export const SkeletonTable: React.FC = () => {
  return (
    <div className="w-full border border-border rounded-xl bg-card p-6 space-y-4 animate-pulse shadow-sm">
      <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-8 bg-muted rounded"></div>
        <div className="h-8 bg-muted rounded"></div>
        <div className="h-8 bg-muted rounded"></div>
        <div className="h-8 bg-muted rounded"></div>
        <div className="h-8 bg-muted rounded"></div>
      </div>
    </div>
  );
};

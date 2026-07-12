import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface CostBreakdownChartProps {
  data: { name: string; cost: number }[];
}

export const CostBreakdownChart: React.FC<CostBreakdownChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
        No operational cost data
      </div>
    );
  }

  return (
    <div className="h-60">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip formatter={(v) => `$${v}`} />
          <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

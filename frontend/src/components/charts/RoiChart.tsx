import React from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface RoiChartProps {
  data: { name: string; roi: number }[];
}

export const RoiChart: React.FC<RoiChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
        No asset ROI metrics
      </div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.roi >= 0 ? '#10b981' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

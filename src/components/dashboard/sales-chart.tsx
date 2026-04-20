'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for recharts to avoid SSR issues with React 19
const AreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  { ssr: false }
);
const Area = dynamic(
  () => import('recharts').then((mod) => mod.Area),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

interface SalesChartProps {
  data: Array<{ name: string; ventes: number; commandes: number }>;
  formatCurrency: (amount: number) => string;
}

export function SalesChart({ data, formatCurrency }: SalesChartProps) {
  const chartData = useMemo(() => data, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00B4A0" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00B4A0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-xs" />
        <YAxis className="text-xs" tickFormatter={(v) => `${v / 1000}k`} />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          labelStyle={{ color: '#000' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Area
          type="monotone"
          dataKey="ventes"
          stroke="#00B4A0"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorVentes)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

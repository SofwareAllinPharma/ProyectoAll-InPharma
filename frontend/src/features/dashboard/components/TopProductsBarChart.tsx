import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from 'recharts';
import type { TopProduct } from '../types/dashboard.types';

type Props = {
  data: TopProduct[];
  height?: number;
};

const TopProductsBarChart: React.FC<Props> = ({ data, height = 280 }) => {
  const chartData = (data || []).map((d) => ({ name: d.label, value: d.value, color: d.color }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <XAxis type="number" tick={{ fill: '#6B7280' }} />
          <YAxis dataKey="name" type="category" width={200} tick={{ fill: '#374151', fontSize: 13 }} />
          <Tooltip formatter={(value: any) => [value, 'Unidades']} />
          <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={14}>
            <LabelList dataKey="value" position="right" formatter={(v: any) => `${v} unidades`} />
            {chartData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color || '#2C5F6F'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsBarChart;

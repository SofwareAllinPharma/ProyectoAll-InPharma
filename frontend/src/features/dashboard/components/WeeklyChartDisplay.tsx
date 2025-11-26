import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import type { ChartData } from '../types/dashboard.types';

interface Props {
  data: ChartData[];
  loading: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartData;
    const dateObj = new Date(data.originalDateObj);

    const dateStr = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).format(dateObj);

    return (
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-md">
        <p className="text-gray-700 font-bold mb-1 capitalize">{dateStr}</p>
        <p className="text-[#5d5448]">
          Producción : {payload[0].value} g
        </p>
      </div>
    );
  }
  return null;
};

export const WeeklyChartDisplay: React.FC<Props> = ({ data, loading }) => {
  if (loading) {
    return <div className="h-full flex items-center justify-center text-gray-400">Cargando...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorGrams" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#5d5448" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#5d5448" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis
          dataKey="displayDate"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#7c6a55', fontSize: 12 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#7c6a55', fontSize: 12 }}
          tickFormatter={(value) => `${value}g`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="grams"
          stroke="#4b5563"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorGrams)"
          dot={{ r: 4, fill: '#fff', stroke: '#4b5563', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: '#4b5563', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

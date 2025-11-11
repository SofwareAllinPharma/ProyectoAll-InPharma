import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const chartData = (data || []).map((d) => ({ idProducto: d.idProducto, name: d.label, value: d.value, color: d.color }));
  if (!chartData || chartData.length === 0) {
    return <div className="p-6 text-center text-gray-500">No hay datos de productos elaborados para este mes.</div>;
  }

  return (
    <div style={{ width: '100%', height, outline: 'none' }} tabIndex={-1}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <XAxis type="number" tick={{ fill: '#6B7280' }} />
          <YAxis
            dataKey="name"
            type="category"
            width={200}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tick={({ x, y, payload }: any) => {
              const name: string = payload?.value;
              const id = chartData.find((c) => c.name === name)?.idProducto;
              return (
                <text
                  x={x - 6}
                  y={y + 4}
                  textAnchor="end"
                  style={{ fontSize: 13, fill: '#374151', cursor: id ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (id) navigate(`/adminsis/productos/${id}`);
                  }}
                >
                  {name}
                </text>
              );
            }}
          />
          <Tooltip formatter={(value: number | string) => [value, 'Unidades']} />
          <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={14}>
            <LabelList dataKey="value" position="right" />
            {chartData.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={entry.color || '#2C5F6F'}
                style={{ cursor: entry.idProducto ? 'pointer' : 'default' }}
                onMouseDown={(e) => {
                  // prevent browser focusing the SVG container which shows a black outline in some browsers
                  e.preventDefault();
                }}
                onClick={() => {
                  if (entry.idProducto) navigate(`/adminsis/productos/${entry.idProducto}`);
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsBarChart;

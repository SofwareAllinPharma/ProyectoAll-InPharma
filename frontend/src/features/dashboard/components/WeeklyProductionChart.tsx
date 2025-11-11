import React from 'react';

const WeeklyProductionChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-[#5d5448]">Producción semanal</h2>
      <p className="text-sm text-[#7c6a55]">Kilogramos producidos por día</p>
      <div className="mt-6 h-64 flex items-center justify-center border-2 border-dashed border-[#bdaf9e] rounded-lg">
        <p className="text-[#7c6a55]">Gráfico de líneas aquí (por implementar)</p>
      </div>
    </div>
  );
};

export default WeeklyProductionChart;

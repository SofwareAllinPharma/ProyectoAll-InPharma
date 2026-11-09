import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWeeklyProduction } from '../hooks/useWeeklyProduction';
import { WeeklyChartDisplay } from './WeeklyChartDisplay';

const WeeklyProductionChart: React.FC = () => {
  const { data, loading, handlePreviousWeek, handleNextWeek, isCurrentWeek } = useWeeklyProduction();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2 className="text-lg font-semibold text-[#5d5448]">Producción semanal</h2>
          <p className="text-sm text-[#7c6a55]">Gramos producidos por día</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousWeek}
            className="p-1 hover:bg-gray-100 rounded-full text-[#5d5448]"
            title="Semana anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs font-medium text-[#7c6a55] min-w-[100px] text-center capitalize">
            {data.length > 0 ? `${data[0]?.fullDate} - ${data[data.length - 1]?.fullDate}` : ''}
          </span>
          <button
            onClick={handleNextWeek}
            disabled={isCurrentWeek()}
            className={`p-1 rounded-full text-[#5d5448] ${isCurrentWeek() ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            title="Semana siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="mt-6 h-64 w-full">
        <WeeklyChartDisplay data={data} loading={loading} />
      </div>
    </div>
  );
};

export default WeeklyProductionChart;

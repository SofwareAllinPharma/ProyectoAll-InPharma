import { useState, useEffect } from 'react';
import { DashboardService } from '../services/dashboard.service';
import type { ChartData } from '../types/dashboard.types';

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const useWeeklyProduction = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));

  const fetchProduction = async (mondayDate: Date) => {
    setLoading(true);
    try {
      const sundayDate = new Date(mondayDate);
      sundayDate.setDate(mondayDate.getDate() + 6);

      const startStr = mondayDate.toISOString().split('T')[0];
      const endStr = sundayDate.toISOString().split('T')[0];

      const apiResult = await DashboardService.getWeeklyProduction(startStr, endStr);

      const fullWeekData: ChartData[] = [];

      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(mondayDate);
        currentDay.setDate(mondayDate.getDate() + i);

        const dateStr = currentDay.toISOString().split('T')[0];
        const foundData = apiResult.find(item => item.date.toString().startsWith(dateStr));

        fullWeekData.push({
          date: foundData ? foundData.date : currentDay.toISOString(),
          grams: foundData ? foundData.grams : 0,
          displayDate: new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(currentDay),
          fullDate: new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(currentDay),
          originalDateObj: currentDay
        });
      }

      setData(fullWeekData);
    } catch (error) {
      console.error('Error loading weekly production:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduction(currentWeekStart);
  }, [currentWeekStart]);

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const isCurrentWeek = () => {
    const today = new Date();
    const thisWeekStart = getStartOfWeek(today);
    return currentWeekStart.getTime() === thisWeekStart.getTime();
  };

  return {
    data,
    loading,
    handlePreviousWeek,
    handleNextWeek,
    isCurrentWeek
  };
};

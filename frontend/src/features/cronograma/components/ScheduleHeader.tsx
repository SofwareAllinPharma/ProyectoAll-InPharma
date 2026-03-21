import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSchedule } from '../context/ScheduleContext';
import type { ViewMode } from '../types/schedule';

const VIEW_LABELS: Record<ViewMode, string> = {
  dia: 'Día',
  semana: 'Semana',
  mes: 'Mes',
};

function formatTitle(date: Date, mode: ViewMode): string {
  if (mode === 'dia') return format(date, "EEEE d 'de' MMMM yyyy", { locale: es });
  if (mode === 'semana') {
    const s = startOfWeek(date, { weekStartsOn: 1 });
    const e = endOfWeek(date, { weekStartsOn: 1 });
    return `${format(s, 'd MMM', { locale: es })} – ${format(e, 'd MMM yyyy', { locale: es })}`;
  }
  return format(date, 'MMMM yyyy', { locale: es });
}

export default function ScheduleHeader() {
  const { viewMode, setViewMode, currentDate, setCurrentDate } = useSchedule();

  function goBack() {
    if (viewMode === 'dia') setCurrentDate(subDays(currentDate, 1));
    else if (viewMode === 'semana') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  }

  function goForward() {
    if (viewMode === 'dia') setCurrentDate(addDays(currentDate, 1));
    else if (viewMode === 'semana') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e0d5] bg-white">
      {/* Título */}
      <h1 className="text-xl font-bold text-[#3E3529] capitalize">
        {formatTitle(currentDate, viewMode)}
      </h1>

      {/* Controles */}
      <div className="flex items-center gap-3">
        {/* Selector de vista */}
        <div className="flex rounded-lg border border-[#bdaf9e] overflow-hidden text-sm">
          {(Object.keys(VIEW_LABELS) as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 transition-colors ${
                viewMode === mode
                  ? 'bg-[#5d5448] text-white'
                  : 'text-[#5d5448] hover:bg-[#f5f1e8]'
              }`}
            >
              {VIEW_LABELS[mode]}
            </button>
          ))}
        </div>

        {/* Navegación */}
        <div className="flex items-center gap-1">
          <button
            onClick={goBack}
            className="p-1.5 rounded-md text-[#5d5448] hover:bg-[#f5f1e8] transition-colors"
            title="Anterior"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-sm rounded-md border border-[#bdaf9e] text-[#5d5448] hover:bg-[#f5f1e8] transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={goForward}
            className="p-1.5 rounded-md text-[#5d5448] hover:bg-[#f5f1e8] transition-colors"
            title="Siguiente"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

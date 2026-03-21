// Vista mensual: grid de calendario. Click en un día navega a la vista de día.
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth } from 'date-fns';
import { useSchedule } from '../../context/ScheduleContext';

export default function MonthView() {
  const { currentDate, setCurrentDate, setViewMode, blocks } = useSchedule();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Genera todas las semanas del mes
  const weeks: Date[][] = [];
  let current = calStart;
  while (current <= monthEnd || weeks.length < 6) {
    const week = Array.from({ length: 7 }, (_, i) => addDays(current, i));
    weeks.push(week);
    current = addDays(current, 7);
    if (current > monthEnd && weeks.length >= 4) break;
  }

  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  function navigateToDay(day: Date) {
    setCurrentDate(day);
    setViewMode('dia');
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Cabecera días de la semana */}
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-[#9D977B] py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Semanas */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayBlocks = blocks.filter((b) => b.date === dateStr);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => navigateToDay(day)}
                  className={`min-h-[72px] rounded-lg border p-1.5 cursor-pointer transition-colors ${
                    isToday
                      ? 'border-[#9D977B] bg-[#faf8f4]'
                      : 'border-[#e8e0d5] hover:bg-[#faf8f4]'
                  } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                >
                  <div
                    className={`text-xs font-semibold mb-1 ${
                      isToday
                        ? 'text-[#3E3529] bg-[#9D977B] text-white w-5 h-5 rounded-full flex items-center justify-center'
                        : 'text-[#5d5448]'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayBlocks.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        className="text-[10px] truncate rounded px-1 text-white"
                        style={{ backgroundColor: b.color }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {b.startTime} {b.type === 'production_order'
                          ? `Pedido #${b.productionOrderId}`
                          : (b.taskLabel || 'Tarea')}
                      </div>
                    ))}
                    {dayBlocks.length > 3 && (
                      <div className="text-[10px] text-[#9D977B]">
                        +{dayBlocks.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

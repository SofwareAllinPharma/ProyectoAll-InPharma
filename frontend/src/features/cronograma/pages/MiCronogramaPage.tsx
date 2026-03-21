// MiCronogramaPage — Vista read-only para empleados.
// Muestra los bloques del store donde el usuario actual aparece en employeeIds.
// Agrupa por día y muestra horario, producto/tarea, sector, notas.

import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { useAuth } from '../../../lib/auth';
import { ScheduleProvider, useSchedule } from '../context/ScheduleContext';
import { EXTRAORDINARY_TASK_LABELS } from '../types/schedule';

const DAYS_AHEAD = 7;

function MiCronogramaInner() {
  const { user } = useAuth();
  const { blocks } = useSchedule();
  const [startDate, setStartDate] = useState(new Date());

  const mail = user?.mail ?? '';
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(startDate, i));

  const myBlocks = blocks.filter((b) => b.employeeIds.includes(mail));

  return (
    <div className="space-y-6 p-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Cronograma</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tus bloques asignados — solo lectura
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStartDate(subDays(startDate, DAYS_AHEAD))}
            className="px-3 py-1.5 text-sm rounded-md border border-[#bdaf9e] text-[#5d5448] hover:bg-[#f5f1e8]"
          >
            ‹ Anterior
          </button>
          <button
            onClick={() => setStartDate(new Date())}
            className="px-3 py-1.5 text-sm rounded-md bg-[#5d5448] text-white hover:bg-[#3E3529]"
          >
            Hoy
          </button>
          <button
            onClick={() => setStartDate(addDays(startDate, DAYS_AHEAD))}
            className="px-3 py-1.5 text-sm rounded-md border border-[#bdaf9e] text-[#5d5448] hover:bg-[#f5f1e8]"
          >
            Siguiente ›
          </button>
        </div>
      </div>

      {myBlocks.length === 0 && (
        <div className="bg-[#faf8f4] border border-[#e8e0d5] rounded-lg p-8 text-center">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-[#7C6A55]">No tenés bloques asignados en este período.</p>
        </div>
      )}

      {/* Días */}
      <div className="space-y-4">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayBlocks = myBlocks
            .filter((b) => b.date === dateStr)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          if (dayBlocks.length === 0) return null;

          return (
            <div key={dateStr}>
              <h2 className="text-sm font-semibold text-[#5d5448] capitalize mb-2">
                {format(day, "EEEE d 'de' MMMM", { locale: es })}
              </h2>
              <div className="space-y-2">
                {dayBlocks.map((block) => {
                  const label =
                    block.type === 'production_order'
                      ? `Pedido #${block.productionOrderId}`
                      : block.taskLabel ||
                        EXTRAORDINARY_TASK_LABELS[block.taskType!] ||
                        'Tarea';

                  return (
                    <div
                      key={block.id}
                      className="flex gap-3 rounded-lg border border-[#e8e0d5] bg-white p-3"
                      style={{ borderLeft: `4px solid ${block.color}` }}
                    >
                      {/* Horario */}
                      <div className="shrink-0 text-xs font-mono text-[#9D977B] w-20">
                        <div>{block.startTime}</div>
                        <div>↓</div>
                        <div>{block.endTime}</div>
                      </div>
                      {/* Detalle */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#3E3529] text-sm">{label}</div>
                        {block.sectorIds.length > 0 && (
                          <div className="text-xs text-[#7C6A55] mt-0.5">
                            Sectores: {block.sectorIds.join(', ')}
                          </div>
                        )}
                        {block.notes && (
                          <div className="text-xs text-gray-500 mt-1 italic">
                            {block.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MiCronogramaPage() {
  return (
    <ScheduleProvider>
      <MiCronogramaInner />
    </ScheduleProvider>
  );
}

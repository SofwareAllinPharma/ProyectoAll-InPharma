import { format, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDroppable } from '@dnd-kit/core';
import { useSchedule } from '../../context/ScheduleContext';
import ScheduleBlockComponent, { SLOT_HEIGHT, DAY_START_HOUR } from './ScheduleBlock';
import type { ScheduleBlock } from '../../types/schedule';

const TOTAL_SLOTS = 48;

function WeekSlot({ dateStr, slotIndex }: { dateStr: string; slotIndex: number }) {
  const slotMins = DAY_START_HOUR * 60 + slotIndex * 30;
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${dateStr}-${slotIndex}`,
    data: { date: dateStr, slotMins },
  });
  return (
    <div
      ref={setNodeRef}
      style={{ height: SLOT_HEIGHT }}
      className={`border-b border-[#f0ebe3] ${isOver ? 'bg-[#f5f1e8]' : ''}`}
    />
  );
}

interface Props {
  selectedBlockId: string | null;
  onSelectBlock: (block: ScheduleBlock) => void;
}

export default function WeekView({ selectedBlockId, onSelectBlock }: Props) {
  const { currentDate, blocks } = useSchedule();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // lunes
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="flex-1 overflow-auto">
      {/* Cabecera con los 7 días */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#e8e0d5] flex">
        <div className="w-14 shrink-0" />
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isToday = dateStr === todayStr;
          const count = blocks.filter((b) => b.date === dateStr).length;
          return (
            <div
              key={dateStr}
              className={`flex-1 text-center py-2 text-xs border-l border-[#e8e0d5] ${
                isToday ? 'bg-[#faf8f4] font-bold text-[#3E3529]' : 'text-[#7C6A55]'
              }`}
            >
              <div className="capitalize">{format(day, 'EEE', { locale: es })}</div>
              <div className={`text-lg font-semibold ${isToday ? 'text-[#5d5448]' : ''}`}>
                {format(day, 'd')}
              </div>
              {count > 0 && (
                <div className="text-[10px] text-[#9D977B]">{count} bloque{count !== 1 ? 's' : ''}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid compartido */}
      <div className="flex">
        {/* Etiquetas de hora */}
        <div className="w-14 shrink-0 select-none">
          {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
            const totalMins = DAY_START_HOUR * 60 + i * 30;
            const h = Math.floor(totalMins / 60) % 24;
            const m = totalMins % 60;
            return (
              <div
                key={i}
                style={{ height: SLOT_HEIGHT }}
                className="flex items-start justify-end pr-2 text-[10px] text-[#bdaf9e] border-b border-[#f0ebe3]"
              >
                {m === 0 ? `${String(h).padStart(2, '0')}:00` : ''}
              </div>
            );
          })}
        </div>

        {/* Columnas por día */}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayBlocks = blocks.filter((b) => b.date === dateStr);
          return (
            <div key={dateStr} className="flex-1 border-l border-[#e8e0d5] relative">
              {Array.from({ length: TOTAL_SLOTS }, (_, i) => (
                <WeekSlot key={i} dateStr={dateStr} slotIndex={i} />
              ))}
              {dayBlocks.map((b) => (
                <ScheduleBlockComponent
                  key={b.id}
                  block={b}
                  selected={b.id === selectedBlockId}
                  onSelect={onSelectBlock}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

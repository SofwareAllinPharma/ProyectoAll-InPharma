// Grid de tiempo: 08:00 a 08:00 del día siguiente (48 slots de 30 min).
// Cada slot es un droppable que acepta items del sidebar y bloques para reposicionar.

import { useDroppable } from '@dnd-kit/core';
import { SLOT_HEIGHT, DAY_START_HOUR } from './ScheduleBlock';
import type { ScheduleBlock as ScheduleBlockType } from '../../types/schedule';
import ScheduleBlockComponent from './ScheduleBlock';

const TOTAL_SLOTS = 48; // 24h × 2 slots/h

function SlotDroppable({ date, slotIndex }: { date: string; slotIndex: number }) {
  const slotMins = DAY_START_HOUR * 60 + slotIndex * 30;
  const id = `slot-${date}-${slotIndex}`;
  const { isOver, setNodeRef } = useDroppable({ id, data: { date, slotMins } });

  return (
    <div
      ref={setNodeRef}
      style={{ height: SLOT_HEIGHT }}
      className={`border-b border-[#f0ebe3] ${isOver ? 'bg-[#f5f1e8]' : ''} ${
        slotIndex % 2 === 0 ? '' : 'bg-[#fafaf9]/50'
      }`}
    />
  );
}

interface Props {
  date: string;
  blocks: ScheduleBlockType[];
  selectedBlockId: string | null;
  onSelectBlock: (block: ScheduleBlockType) => void;
}

export default function TimeGrid({ date, blocks, selectedBlockId, onSelectBlock }: Props) {
  return (
    <div className="flex">
      {/* Etiquetas de hora */}
      <div className="w-14 shrink-0 select-none">
        {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
          const totalMins = DAY_START_HOUR * 60 + i * 30;
          const h = Math.floor(totalMins / 60) % 24;
          const m = totalMins % 60;
          const label = m === 0 ? `${String(h).padStart(2, '0')}:00` : '';
          return (
            <div
              key={i}
              style={{ height: SLOT_HEIGHT }}
              className="flex items-start justify-end pr-2 text-[10px] text-[#bdaf9e] border-b border-[#f0ebe3]"
            >
              {label}
            </div>
          );
        })}
      </div>

      {/* Columna con slots y bloques */}
      <div className="flex-1 relative">
        {/* Slots droppables */}
        {Array.from({ length: TOTAL_SLOTS }, (_, i) => (
          <SlotDroppable key={i} date={date} slotIndex={i} />
        ))}

        {/* Bloques absolutos encima */}
        {blocks.map((b) => (
          <ScheduleBlockComponent
            key={b.id}
            block={b}
            selected={b.id === selectedBlockId}
            onSelect={onSelectBlock}
          />
        ))}
      </div>
    </div>
  );
}

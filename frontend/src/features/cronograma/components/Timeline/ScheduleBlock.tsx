// Bloque visual en el timeline. Soporta:
//   - Drag para mover (useDraggable)
//   - Resize desde el borde inferior (pointer events manual)
//   - Click para abrir BlockEditPanel
//   - Indicador de conflicto

import { useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useSchedule } from '../../context/ScheduleContext';
import type { ScheduleBlock as ScheduleBlockType } from '../../types/schedule';
import ConflictWarning from './ConflictWarning';
import { EXTRAORDINARY_TASK_LABELS } from '../../types/schedule';

// Constantes de layout
export const SLOT_HEIGHT = 40; // px por slot de 30 min → 80px/h
export const DAY_START_HOUR = 8; // 08:00

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesFromDayStart(time: string, isNextDay = false): number {
  return timeToMinutes(time) + (isNextDay ? 1440 : 0) - DAY_START_HOUR * 60;
}

export function minutesToTime(mins: number): string {
  const normalized = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

interface Props {
  block: ScheduleBlockType;
  onSelect: (block: ScheduleBlockType) => void;
  selected: boolean;
}

export default function ScheduleBlock({ block, onSelect, selected }: Props) {
  const { updateBlock, detectConflicts } = useSchedule();
  const conflicts = detectConflicts(block);
  const resizing = useRef(false);
  const resizeStartY = useRef(0);
  const resizeStartEnd = useRef('');

  const isNextDay = block.endTime <= block.startTime;
  const offsetMins = minutesFromDayStart(block.startTime);
  const durationMins =
    minutesFromDayStart(block.endTime, isNextDay) - offsetMins;

  const top = (offsetMins / 30) * SLOT_HEIGHT;
  const height = Math.max((durationMins / 30) * SLOT_HEIGHT, SLOT_HEIGHT);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `block-${block.id}`,
    data: { kind: 'block', block },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    top,
    height,
    backgroundColor: block.color + 'dd',
    borderLeft: `3px solid ${block.color}`,
    opacity: isDragging ? 0.4 : 1,
  };

  // --- Resize handle ---
  function onResizeStart(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    resizing.current = true;
    resizeStartY.current = e.clientY;
    resizeStartEnd.current = block.endTime;

    function onMove(ev: PointerEvent) {
      if (!resizing.current) return;
      const deltaY = ev.clientY - resizeStartY.current;
      const deltaSlots = Math.round(deltaY / SLOT_HEIGHT);
      const deltaMins = deltaSlots * 30;
      const endMins = timeToMinutes(resizeStartEnd.current) + deltaMins;
      const clamped = Math.max(timeToMinutes(block.startTime) + 30, endMins);
      updateBlock(block.id, { endTime: minutesToTime(clamped) });
    }

    function onUp() {
      resizing.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  const label =
    block.type === 'production_order'
      ? `Pedido #${block.productionOrderId}`
      : block.taskLabel || EXTRAORDINARY_TASK_LABELS[block.taskType!] || 'Tarea';

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, position: 'absolute', left: 2, right: 2, zIndex: selected ? 20 : 10 }}
      className={`rounded-md text-white text-xs overflow-hidden cursor-grab shadow-sm ${
        selected ? 'ring-2 ring-[#3E3529]' : ''
      }`}
      onClick={(e) => { e.stopPropagation(); onSelect(block); }}
      {...listeners}
      {...attributes}
    >
      <ConflictWarning conflicts={conflicts} />
      <div className="px-1.5 py-1 h-full flex flex-col">
        <div className="font-semibold truncate leading-tight">{label}</div>
        <div className="text-white/80 text-[10px] mt-0.5">
          {block.startTime} – {block.endTime}
        </div>
        {block.employeeIds.length > 0 && (
          <div className="text-white/70 text-[10px] truncate">
            {block.employeeIds.length} emp.
          </div>
        )}
      </div>
      {/* Resize handle */}
      <div
        onPointerDown={onResizeStart}
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-black/10 hover:bg-black/20"
      />
    </div>
  );
}

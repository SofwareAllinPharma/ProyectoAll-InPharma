// CronogramaPage — Vista principal del módulo de cronograma.
// Integra DnD (sidebar → timeline), vistas Día/Semana/Mes y panel de edición.

import { useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ScheduleProvider, useSchedule } from '../context/ScheduleContext';
import ScheduleHeader from '../components/ScheduleHeader';
import ScheduleSidebar from '../components/Sidebar/ScheduleSidebar';
import DayView from '../components/Timeline/DayView';
import WeekView from '../components/Timeline/WeekView';
import MonthView from '../components/Timeline/MonthView';
import BlockEditPanel from '../components/Timeline/BlockEditPanel';
import type { DraggableItemData, ScheduleBlock } from '../types/schedule';
import { minutesToTime } from '../components/Timeline/ScheduleBlock';

// ---------------------------------------------------------------------------
// Inner component (necesita acceso al contexto)
// ---------------------------------------------------------------------------

function CronogramaInner() {
  const { viewMode, currentDate, addBlock, updateBlock, blocks } = useSchedule();
  const [selectedBlock, setSelectedBlock] = useState<ScheduleBlock | null>(null);
  const [activeDragData, setActiveDragData] = useState<DraggableItemData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Rango visible para filtrar OPs sin programar en el sidebar
  const getSidebarRange = () => {
    if (viewMode === 'dia') {
      const d = format(currentDate, 'yyyy-MM-dd');
      return { from: d, to: d };
    }
    if (viewMode === 'semana') {
      const s = startOfWeek(currentDate, { weekStartsOn: 1 });
      const e = endOfWeek(currentDate, { weekStartsOn: 1 });
      return { from: format(s, 'yyyy-MM-dd'), to: format(e, 'yyyy-MM-dd') };
    }
    // mes
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return {
      from: format(new Date(year, month, 1), 'yyyy-MM-dd'),
      to: format(new Date(year, month + 1, 0), 'yyyy-MM-dd'),
    };
  };

  const { from, to } = getSidebarRange();

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragData(null);
    const { active, over } = event;
    if (!over) return;

    const overData = over.data.current as { date: string; slotMins: number } | undefined;
    if (!overData) return;

    const { date, slotMins } = overData;
    const startTime = minutesToTime(slotMins);
    const endTime = minutesToTime(slotMins + 60); // duración default 1h

    type ActiveData =
      | DraggableItemData
      | { kind: 'block'; block: ScheduleBlock };

    const activeData = active.data.current as ActiveData | undefined;
    if (!activeData) return;

    if (activeData.kind === 'block') {
      // Mover un bloque existente a otro slot
      const block = (activeData as { kind: 'block'; block: ScheduleBlock }).block;
      const durMins =
        (parseInt(block.endTime.split(':')[0]) * 60 + parseInt(block.endTime.split(':')[1])) -
        (parseInt(block.startTime.split(':')[0]) * 60 + parseInt(block.startTime.split(':')[1]));
      updateBlock(block.id, {
        date,
        startTime,
        endTime: minutesToTime(slotMins + Math.max(durMins, 60)),
      });
      return;
    }

    if (activeData.kind === 'pedido') {
      addBlock({
        date,
        startTime,
        endTime,
        type: 'production_order',
        productionOrderId: activeData.pedido.numPedido,
        color: '#9D977B',
        employeeIds: [],
        sectorIds: [],
        notes: '',
      });
      return;
    }

    if (activeData.kind === 'tarea') {
      addBlock({
        date,
        startTime,
        endTime,
        type: 'extraordinary_task',
        taskType: activeData.taskType,
        taskLabel: activeData.taskLabel,
        color: activeData.color,
        employeeIds: [],
        sectorIds: [],
        notes: '',
      });
    }
  }

  function handleSelectBlock(block: ScheduleBlock) {
    setSelectedBlock((prev) => (prev?.id === block.id ? null : block));
  }

  // Sincronizar selectedBlock con actualizaciones del store
  const currentSelectedBlock = selectedBlock
    ? blocks.find((b) => b.id === selectedBlock.id) ?? null
    : null;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <ScheduleHeader />

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={(e) => {
          const d = e.active.data.current as DraggableItemData & { kind: string } | undefined;
          if (d && (d.kind === 'pedido' || d.kind === 'tarea')) setActiveDragData(d as DraggableItemData);
        }}>
          {/* Sidebar */}
          <ScheduleSidebar from={from} to={to} />

          {/* Timeline */}
          <div className="flex-1 overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
            {viewMode === 'dia' && (
              <DayView
                selectedBlockId={currentSelectedBlock?.id ?? null}
                onSelectBlock={handleSelectBlock}
              />
            )}
            {viewMode === 'semana' && (
              <WeekView
                selectedBlockId={currentSelectedBlock?.id ?? null}
                onSelectBlock={handleSelectBlock}
              />
            )}
            {viewMode === 'mes' && <MonthView />}
          </div>

          {/* Panel de edición */}
          {currentSelectedBlock && (
            <BlockEditPanel
              block={currentSelectedBlock}
              onClose={() => setSelectedBlock(null)}
            />
          )}

          {/* Overlay de drag */}
          <DragOverlay>
            {activeDragData && (
              <div className="bg-[#5d5448] text-white text-xs rounded-md px-3 py-2 shadow-lg opacity-90">
                {activeDragData.kind === 'pedido'
                  ? `Pedido #${(activeDragData as any).pedido.numPedido}`
                  : (activeDragData as any).taskLabel}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export principal (envuelve con el provider)
// ---------------------------------------------------------------------------

export default function CronogramaPage() {
  return (
    <ScheduleProvider>
      <CronogramaInner />
    </ScheduleProvider>
  );
}

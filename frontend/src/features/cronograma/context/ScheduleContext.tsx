// ScheduleContext — Fase 1: todo el estado del cronograma vive en memoria.
//
// Fase 2 (migración a DB por el equipo del proyecto):
//   Cada función tiene un comentario indicando el endpoint API que la reemplazará.
//   Sólo este archivo necesita modificarse — los componentes no cambian.

import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  ScheduleBlock,
  ScheduleConflict,
  ViewMode,
} from '../types/schedule';
import type { Pedido } from '../../pedidos/types/pedido.types';

// ---------------------------------------------------------------------------
// Helpers de tiempo
// ---------------------------------------------------------------------------

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// Normaliza minutos a rango [0, 1440) para comparaciones dentro de un día.
// startHour = 8 → el día "comienza" a las 08:00.
function minutesFromDayStart(time: string, nextDay = false): number {
  const mins = timeToMinutes(time) + (nextDay ? 1440 : 0);
  const start = 8 * 60; // 08:00
  return mins - start;
}

function blocksOverlap(a: ScheduleBlock, b: ScheduleBlock): boolean {
  if (a.date !== b.date) return false;
  const aStart = minutesFromDayStart(a.startTime);
  const aEnd = minutesFromDayStart(a.endTime, a.endTime < a.startTime);
  const bStart = minutesFromDayStart(b.startTime);
  const bEnd = minutesFromDayStart(b.endTime, b.endTime < b.startTime);
  return aStart < bEnd && bStart < aEnd;
}

// ---------------------------------------------------------------------------
// Contrato del store
// ---------------------------------------------------------------------------

interface ScheduleContextValue {
  blocks: ScheduleBlock[];
  viewMode: ViewMode;
  currentDate: Date;

  setViewMode: (mode: ViewMode) => void;
  setCurrentDate: (date: Date) => void;

  // CRUD — Fase 2: reemplazar por llamadas API
  addBlock: (block: Omit<ScheduleBlock, 'id' | 'createdAt'>) => ScheduleBlock;     // Fase 2: POST /api/schedule/blocks
  updateBlock: (id: string, updates: Partial<ScheduleBlock>) => void;               // Fase 2: PUT  /api/schedule/blocks/:id
  removeBlock: (id: string) => void;                                                // Fase 2: DELETE /api/schedule/blocks/:id

  // Queries — Fase 2: reemplazar por llamadas API con filtros
  getBlocksByDateRange: (from: string, to: string) => ScheduleBlock[];              // Fase 2: GET /api/schedule/blocks?from=&to=
  getBlocksByEmployee: (employeeId: string, date: string) => ScheduleBlock[];       // Fase 2: GET /api/schedule/blocks?employee=&date=
  getBlocksBySector: (sectorId: number, date: string) => ScheduleBlock[];           // Fase 2: GET /api/schedule/blocks?sector=&date=
  getUnscheduledOrders: (allOrders: Pedido[], from: string, to: string) => Pedido[];// Fase 2: GET /api/schedule/unscheduled?from=&to=

  // Validación
  detectConflicts: (block: ScheduleBlock) => ScheduleConflict[];
}

const ScheduleContext = createContext<ScheduleContextValue | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('semana');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const addBlock = useCallback(
    (data: Omit<ScheduleBlock, 'id' | 'createdAt'>): ScheduleBlock => {
      const block: ScheduleBlock = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setBlocks((prev) => [...prev, block]);
      return block;
    },
    []
  );

  const updateBlock = useCallback((id: string, updates: Partial<ScheduleBlock>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const getBlocksByDateRange = useCallback(
    (from: string, to: string): ScheduleBlock[] =>
      blocks.filter((b) => b.date >= from && b.date <= to),
    [blocks]
  );

  const getBlocksByEmployee = useCallback(
    (employeeId: string, date: string): ScheduleBlock[] =>
      blocks.filter((b) => b.date === date && b.employeeIds.includes(employeeId)),
    [blocks]
  );

  const getBlocksBySector = useCallback(
    (sectorId: number, date: string): ScheduleBlock[] =>
      blocks.filter((b) => b.date === date && b.sectorIds.includes(sectorId)),
    [blocks]
  );

  const getUnscheduledOrders = useCallback(
    (allOrders: Pedido[], from: string, to: string): Pedido[] => {
      const scheduledIds = new Set(
        blocks
          .filter((b) => b.date >= from && b.date <= to && b.productionOrderId != null)
          .map((b) => b.productionOrderId)
      );
      return allOrders.filter((o) => !scheduledIds.has(o.numPedido));
    },
    [blocks]
  );

  const detectConflicts = useCallback(
    (block: ScheduleBlock): ScheduleConflict[] => {
      const conflicts: ScheduleConflict[] = [];
      const others = blocks.filter((b) => b.id !== block.id);

      for (const other of others) {
        if (!blocksOverlap(block, other)) continue;

        for (const empId of block.employeeIds) {
          if (other.employeeIds.includes(empId)) {
            conflicts.push({
              blockId: block.id,
              conflictingBlockId: other.id,
              reason: 'employee_overlap',
              entityId: empId,
            });
          }
        }

        for (const secId of block.sectorIds) {
          if (other.sectorIds.includes(secId)) {
            conflicts.push({
              blockId: block.id,
              conflictingBlockId: other.id,
              reason: 'sector_overlap',
              entityId: String(secId),
            });
          }
        }
      }

      return conflicts;
    },
    [blocks]
  );

  return (
    <ScheduleContext.Provider
      value={{
        blocks,
        viewMode,
        currentDate,
        setViewMode,
        setCurrentDate,
        addBlock,
        updateBlock,
        removeBlock,
        getBlocksByDateRange,
        getBlocksByEmployee,
        getBlocksBySector,
        getUnscheduledOrders,
        detectConflicts,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule debe usarse dentro de ScheduleProvider');
  return ctx;
}

export default ScheduleContext;

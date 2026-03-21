// Tipos del módulo Cronograma — Fase 1 (estado en memoria)
//
// Tipos del sistema existente consumidos:
//   - Pedido         → frontend/src/features/pedidos/types/pedido.types.ts
//   - Deposito       → frontend/src/features/deposito/types/deposito.types.ts
//   - UsuarioResumen → definido aquí, mapeado desde GET /usuarios

import type { Pedido } from '../../pedidos/types/pedido.types';
import type { Deposito } from '../../deposito/types/deposito.types';

export type { Pedido, Deposito };

// Empleado tal como viene del endpoint GET /usuarios
export interface UsuarioResumen {
  mail: string;
  nombre: string | null;
  apellido: string | null;
  nombreCompleto: string;
  perfiles: Array<{ idPerfil: number; nombrePerfil: string }>;
}

export type BlockType = 'production_order' | 'extraordinary_task';

export type ExtraordinaryTaskType =
  | 'deep_clean'
  | 'sector_clean'
  | 'machine_clean'
  | 'quality_control'
  | 'stock_check'
  | 'maintenance'
  | 'external_service'
  | 'external_visit'
  | 'other';

export const EXTRAORDINARY_TASK_LABELS: Record<ExtraordinaryTaskType, string> = {
  deep_clean: 'Limpieza profunda',
  sector_clean: 'Limpieza de sector',
  machine_clean: 'Limpieza de máquina',
  quality_control: 'Control de calidad',
  stock_check: 'Conteo de stock',
  maintenance: 'Mantenimiento',
  external_service: 'Servicio externo',
  external_visit: 'Visita externa',
  other: 'Otro',
};

export interface ScheduleBlock {
  id: string;                         // uuid generado en cliente (crypto.randomUUID())
  date: string;                       // 'YYYY-MM-DD'
  startTime: string;                  // 'HH:MM' (24h)
  endTime: string;                    // 'HH:MM' — puede ser del día siguiente
  type: BlockType;
  productionOrderId?: number;         // ref a Pedido.numPedido existente
  taskType?: ExtraordinaryTaskType;
  taskLabel?: string;                 // descripción libre para tareas extraordinarias
  color: string;                      // hex
  notes?: string;
  employeeIds: string[];              // refs a mail de usuarios existentes
  sectorIds: number[];                // refs a Deposito.id existentes
  createdAt: string;                  // ISO timestamp
}

export interface ScheduleConflict {
  blockId: string;
  conflictingBlockId: string;
  reason: 'employee_overlap' | 'sector_overlap';
  entityId: string;                   // mail del empleado o id del sector en conflicto
}

// Item que se arrastra desde el sidebar
export type DraggableItemData =
  | { kind: 'pedido'; pedido: Pedido }
  | {
      kind: 'tarea';
      taskType: ExtraordinaryTaskType;
      taskLabel: string;
      color: string;
    };

export type ViewMode = 'dia' | 'semana' | 'mes';

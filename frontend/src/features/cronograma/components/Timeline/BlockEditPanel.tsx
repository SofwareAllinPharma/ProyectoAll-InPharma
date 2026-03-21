// Panel lateral de edición de un bloque seleccionado.
// Consume usuarios reales (GET /usuarios) y depósitos reales (GET /depositos).

import { useEffect, useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { UsuarioService } from '../../services/usuario.service';
import { DepositoService } from '../../../deposito/services/deposito.service';
import type { ScheduleBlock, UsuarioResumen } from '../../types/schedule';
import type { Deposito } from '../../../deposito/types/deposito.types';
import { EXTRAORDINARY_TASK_LABELS } from '../../types/schedule';

interface Props {
  block: ScheduleBlock;
  onClose: () => void;
}

export default function BlockEditPanel({ block, onClose }: Props) {
  const { updateBlock, removeBlock, detectConflicts } = useSchedule();
  const [usuarios, setUsuarios] = useState<UsuarioResumen[]>([]);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const conflicts = detectConflicts(block);

  useEffect(() => {
    UsuarioService.getAll().then(setUsuarios).catch(console.error);
    DepositoService.getAll().then(setDepositos).catch(console.error);
  }, []);

  function toggleEmployee(mail: string) {
    const next = block.employeeIds.includes(mail)
      ? block.employeeIds.filter((e) => e !== mail)
      : [...block.employeeIds, mail];
    updateBlock(block.id, { employeeIds: next });
  }

  function toggleSector(id: number) {
    const next = block.sectorIds.includes(id)
      ? block.sectorIds.filter((s) => s !== id)
      : [...block.sectorIds, id];
    updateBlock(block.id, { sectorIds: next });
  }

  const title =
    block.type === 'production_order'
      ? `Pedido #${block.productionOrderId}`
      : (block.taskLabel || EXTRAORDINARY_TASK_LABELS[block.taskType!] || 'Tarea');

  return (
    <div className="w-72 shrink-0 border-l border-[#e8e0d5] bg-white flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e0d5]">
        <span className="font-semibold text-sm text-[#3E3529] truncate">{title}</span>
        <button onClick={onClose} className="text-[#9D977B] hover:text-[#3E3529] text-lg leading-none">
          ✕
        </button>
      </div>

      <div className="flex-1 p-4 space-y-5 text-sm">
        {/* Conflictos */}
        {conflicts.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="font-semibold text-yellow-800 mb-1">⚠ {conflicts.length} conflicto(s)</div>
            {conflicts.map((c, i) => (
              <div key={i} className="text-xs text-yellow-700">
                {c.reason === 'employee_overlap'
                  ? `Empleado ${c.entityId} solapado`
                  : `Sector ${c.entityId} solapado`}{' '}
                con otro bloque
              </div>
            ))}
          </div>
        )}

        {/* Hora inicio / fin */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#7C6A55] mb-1">Inicio</label>
            <input
              type="time"
              value={block.startTime}
              onChange={(e) => updateBlock(block.id, { startTime: e.target.value })}
              className="w-full border border-[#bdaf9e] rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-[#9D977B]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#7C6A55] mb-1">Fin</label>
            <input
              type="time"
              value={block.endTime}
              onChange={(e) => updateBlock(block.id, { endTime: e.target.value })}
              className="w-full border border-[#bdaf9e] rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-[#9D977B]"
            />
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs text-[#7C6A55] mb-1">Color</label>
          <input
            type="color"
            value={block.color}
            onChange={(e) => updateBlock(block.id, { color: e.target.value })}
            className="h-8 w-full rounded-md border border-[#bdaf9e] cursor-pointer"
          />
        </div>

        {/* Empleados */}
        <div>
          <label className="block text-xs font-medium text-[#7C6A55] mb-2">
            Empleados asignados
          </label>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {usuarios.map((u) => (
              <label
                key={u.mail}
                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-[#faf8f4] rounded px-1 py-0.5"
              >
                <input
                  type="checkbox"
                  checked={block.employeeIds.includes(u.mail)}
                  onChange={() => toggleEmployee(u.mail)}
                  className="accent-[#5d5448]"
                />
                <span className="text-[#3E3529]">{u.nombreCompleto}</span>
              </label>
            ))}
            {usuarios.length === 0 && (
              <div className="text-xs text-gray-400">Cargando empleados...</div>
            )}
          </div>
        </div>

        {/* Sectores / depósitos */}
        <div>
          <label className="block text-xs font-medium text-[#7C6A55] mb-2">
            Sectores (depósitos) asignados
          </label>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {depositos.map((d) => (
              <label
                key={d.id}
                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-[#faf8f4] rounded px-1 py-0.5"
              >
                <input
                  type="checkbox"
                  checked={block.sectorIds.includes(d.id)}
                  onChange={() => toggleSector(d.id)}
                  className="accent-[#5d5448]"
                />
                <span className="text-[#3E3529]">{d.nombre}</span>
              </label>
            ))}
            {depositos.length === 0 && (
              <div className="text-xs text-gray-400">Cargando sectores...</div>
            )}
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-xs text-[#7C6A55] mb-1">Notas</label>
          <textarea
            value={block.notes ?? ''}
            onChange={(e) => updateBlock(block.id, { notes: e.target.value })}
            rows={3}
            placeholder="Observaciones..."
            className="w-full border border-[#bdaf9e] rounded-md px-2 py-1.5 text-xs resize-none focus:outline-none focus:border-[#9D977B] placeholder-[#bdaf9e]"
          />
        </div>
      </div>

      {/* Footer con botón eliminar */}
      <div className="p-4 border-t border-[#e8e0d5]">
        <button
          onClick={() => {
            removeBlock(block.id);
            onClose();
          }}
          className="w-full text-xs py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        >
          Eliminar bloque
        </button>
      </div>
    </div>
  );
}

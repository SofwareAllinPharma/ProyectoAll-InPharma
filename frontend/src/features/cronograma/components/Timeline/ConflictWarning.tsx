import type { ScheduleConflict } from '../../types/schedule';

interface Props {
  conflicts: ScheduleConflict[];
}

export default function ConflictWarning({ conflicts }: Props) {
  if (conflicts.length === 0) return null;

  const employees = conflicts.filter((c) => c.reason === 'employee_overlap');
  const sectors = conflicts.filter((c) => c.reason === 'sector_overlap');

  return (
    <div
      title={`${conflicts.length} conflicto(s) detectado(s)`}
      className="absolute top-0.5 right-0.5 z-10 flex items-center gap-0.5 bg-yellow-400 text-yellow-900 rounded px-1 py-0.5 text-[10px] font-bold shadow"
    >
      ⚠ {conflicts.length}
      <span className="sr-only">
        {employees.length > 0 && ` Empleados solapados: ${employees.map((c) => c.entityId).join(', ')}.`}
        {sectors.length > 0 && ` Sectores solapados: ${sectors.map((c) => c.entityId).join(', ')}.`}
      </span>
    </div>
  );
}

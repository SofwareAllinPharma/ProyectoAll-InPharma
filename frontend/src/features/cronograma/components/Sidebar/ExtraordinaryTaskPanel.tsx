import { useState } from 'react';
import { EXTRAORDINARY_TASK_LABELS } from '../../types/schedule';
import type { ExtraordinaryTaskType } from '../../types/schedule';
import DraggableItem from './DraggableItem';

const TASK_COLORS: Record<ExtraordinaryTaskType, string> = {
  deep_clean: '#6366f1',
  sector_clean: '#8b5cf6',
  machine_clean: '#a78bfa',
  quality_control: '#0ea5e9',
  stock_check: '#14b8a6',
  maintenance: '#f59e0b',
  external_service: '#ef4444',
  external_visit: '#ec4899',
  other: '#6b7280',
};

interface PendingTask {
  id: string;
  taskType: ExtraordinaryTaskType;
  taskLabel: string;
  color: string;
}

export default function ExtraordinaryTaskPanel() {
  const [taskType, setTaskType] = useState<ExtraordinaryTaskType>('deep_clean');
  const [taskLabel, setTaskLabel] = useState('');
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);

  function handleAdd() {
    const label = taskLabel.trim() || EXTRAORDINARY_TASK_LABELS[taskType];
    setPendingTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        taskType,
        taskLabel: label,
        color: TASK_COLORS[taskType],
      },
    ]);
    setTaskLabel('');
  }

  function handleRemove(id: string) {
    setPendingTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-3">
      {/* Form inline */}
      <div className="space-y-2">
        <select
          value={taskType}
          onChange={(e) => setTaskType(e.target.value as ExtraordinaryTaskType)}
          className="w-full text-xs border border-[#bdaf9e] rounded-md px-2 py-1.5 bg-white text-[#3E3529] focus:outline-none focus:border-[#9D977B]"
        >
          {(Object.keys(EXTRAORDINARY_TASK_LABELS) as ExtraordinaryTaskType[]).map((k) => (
            <option key={k} value={k}>
              {EXTRAORDINARY_TASK_LABELS[k]}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={taskLabel}
          onChange={(e) => setTaskLabel(e.target.value)}
          placeholder="Descripción libre (opcional)"
          className="w-full text-xs border border-[#bdaf9e] rounded-md px-2 py-1.5 bg-white text-[#3E3529] placeholder-[#bdaf9e] focus:outline-none focus:border-[#9D977B]"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />

        <button
          onClick={handleAdd}
          className="w-full text-xs bg-[#5d5448] text-white rounded-md py-1.5 hover:bg-[#3E3529] transition-colors"
        >
          + Agregar tarea
        </button>
      </div>

      {/* Lista de tareas creadas (draggables) */}
      <div className="space-y-1.5">
        {pendingTasks.map((task) => (
          <DraggableItem
            key={task.id}
            id={`tarea-${task.id}`}
            data={{ kind: 'tarea', taskType: task.taskType, taskLabel: task.taskLabel, color: task.color }}
          >
            <div
              className="rounded-md px-2.5 py-2 text-xs select-none flex items-center justify-between gap-2"
              style={{ backgroundColor: task.color + '22', borderLeft: `3px solid ${task.color}` }}
            >
              <div>
                <div className="font-semibold truncate" style={{ color: task.color }}>
                  {EXTRAORDINARY_TASK_LABELS[task.taskType]}
                </div>
                {task.taskLabel !== EXTRAORDINARY_TASK_LABELS[task.taskType] && (
                  <div className="text-gray-600 truncate">{task.taskLabel}</div>
                )}
              </div>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => handleRemove(task.id)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
              >
                ✕
              </button>
            </div>
          </DraggableItem>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import UnscheduledOrders from './UnscheduledOrders';
import ExtraordinaryTaskPanel from './ExtraordinaryTaskPanel';

type SidebarTab = 'pedidos' | 'tareas';

interface Props {
  from: string;
  to: string;
}

export default function ScheduleSidebar({ from, to }: Props) {
  const [tab, setTab] = useState<SidebarTab>('pedidos');

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-[#e8e0d5] bg-white h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[#e8e0d5]">
        {(['pedidos', 'tareas'] as SidebarTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              tab === t
                ? 'text-[#3E3529] border-b-2 border-[#9D977B] bg-[#faf8f4]'
                : 'text-[#9D977B] hover:text-[#5d5448]'
            }`}
          >
            {t === 'pedidos' ? 'OPs sin programar' : 'Tareas extra.'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {tab === 'pedidos' ? (
          <UnscheduledOrders from={from} to={to} />
        ) : (
          <ExtraordinaryTaskPanel />
        )}
      </div>

      {/* Instrucción */}
      <div className="p-2.5 border-t border-[#e8e0d5] text-[10px] text-[#bdaf9e] text-center select-none">
        Arrastrá al cronograma para programar
      </div>
    </aside>
  );
}

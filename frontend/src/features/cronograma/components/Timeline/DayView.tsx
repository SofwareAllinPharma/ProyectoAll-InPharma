import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSchedule } from '../../context/ScheduleContext';
import TimeGrid from './TimeGrid';
import type { ScheduleBlock } from '../../types/schedule';

interface Props {
  selectedBlockId: string | null;
  onSelectBlock: (block: ScheduleBlock) => void;
}

export default function DayView({ selectedBlockId, onSelectBlock }: Props) {
  const { currentDate, blocks } = useSchedule();
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const dayBlocks = blocks.filter((b) => b.date === dateStr);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Cabecera del día */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#e8e0d5] px-4 py-2 flex items-center gap-3">
        <span className="text-sm font-semibold text-[#3E3529] capitalize">
          {format(currentDate, "EEEE d 'de' MMMM", { locale: es })}
        </span>
        <span className="text-xs text-[#9D977B]">{dayBlocks.length} bloque(s)</span>
      </div>

      <div className="px-2 py-2">
        <TimeGrid
          date={dateStr}
          blocks={dayBlocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
        />
      </div>
    </div>
  );
}

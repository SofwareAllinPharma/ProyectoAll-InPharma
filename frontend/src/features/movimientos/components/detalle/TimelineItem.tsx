import { FaCheck } from 'react-icons/fa';

export default function TimelineItem({ title, subtitle, note, date, colorClass = 'text-gray-400' }: { title: string; subtitle?: string; note?: string; date?: string | null; colorClass?: string }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" aria-hidden />
      <div className="absolute left-1.5 -translate-x-1/2 mt-0.5 h-5 w-5 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm">
        <FaCheck className={`${colorClass}`} size={10} />
      </div>
      <div className="pb-3">
        <div className="text-sm text-gray-900 font-medium">{title}</div>
        {subtitle && <div className="text-xs text-gray-600 mt-0.5">{subtitle}</div>}
        {note && <div className="text-xs text-gray-600 mt-0.5">{note}</div>}
        {date && <div className="text-xs text-gray-500 mt-0.5">{date}</div>}
      </div>
    </div>
  );
}

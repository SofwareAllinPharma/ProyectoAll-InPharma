export type StateHistoryItem = {
  title: string; // e.g., "CREADO", "EN CAMINO"
  lines?: string[]; // extra lines under title
  start?: string | null; // fecha inicio
  end?: string | null; // fecha fin (opcional)
  colorClass?: string; // override dot color
};

export default function StateHistory({ items, defaultColor = 'bg-green-500' }: { items: StateHistoryItem[]; defaultColor?: string }) {
  if (!items || items.length === 0) {
    return <div className="text-sm text-gray-500">Sin historial</div>;
  }
  return (
    <div className="relative">
      <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" aria-hidden />
      <div className="space-y-3">
        {items.map((it, idx) => {
          const isLast = idx === items.length - 1;
          const color = it.colorClass || (isLast ? 'bg-blue-500' : defaultColor);
          return (
            <div key={`${it.title}-${idx}`} className="relative pl-8">
              <div className={`absolute left-1.5 -translate-x-1/2 mt-0.5 h-3 w-3 rounded-full ${color} shadow`} />
              <div className="pb-2">
                <div className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{it.title}</div>
                {it.lines?.map((line, i) => (
                  <div key={i} className="text-xs text-gray-700">{line}</div>
                ))}
                {it.start && (
                  <div className="text-xs text-gray-500">{it.end ? `Inicio: ${it.start}` : it.start}</div>
                )}
                {it.end && (
                  <div className="text-xs text-gray-500">Fin: {it.end}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

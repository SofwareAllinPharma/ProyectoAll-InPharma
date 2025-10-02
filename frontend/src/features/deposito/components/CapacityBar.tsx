export default function CapacityBar({ used, total }: { used: number; total: number }) {
  const pct = Math.min(100, Math.round((used / Math.max(1, total)) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Capacidad</span>
        <span className="font-medium">{used} / {total}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-amber-600"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

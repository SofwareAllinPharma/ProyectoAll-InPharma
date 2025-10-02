type Props = {
  used?: number;             
  total: number;
  showHeader?: boolean;
  height?: number | string;
  trackClassName?: string;
  barClassName?: string;
};

export default function CapacityBar({
  used = 0,
  total,
  showHeader = true,
  height = 8,
  trackClassName = 'bg-gray-200',
  barClassName = 'bg-[#9D977B]',
}: Props) {
  const pct = Math.min(100, Math.round((used / Math.max(1, total)) * 100));
  const h = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className="space-y-1">
      {showHeader && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Capacidad</span>
          <span className="font-medium">{used} / {total}</span>
        </div>
      )}
      <div className={`w-full rounded-full ${trackClassName}`} style={{ height: h }}>
        <div
          className={`h-full rounded-full ${barClassName}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

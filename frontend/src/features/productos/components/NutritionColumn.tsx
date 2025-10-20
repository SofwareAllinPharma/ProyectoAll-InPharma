export default function NutritionColumn({
  title,
  subtitle,
  colorClass = 'green',
  rows,
}: {
  title: string;
  subtitle?: string;
  colorClass?: 'green' | 'orange' | 'purple';
  rows: { label: string; value: string }[];
}) {
  const bg = colorClass === 'green' ? 'bg-green-50 text-green-900' : colorClass === 'orange' ? 'bg-orange-50 text-orange-900' : 'bg-purple-50 text-purple-900';
  const textSub = colorClass === 'green' ? 'text-green-700' : colorClass === 'orange' ? 'text-orange-700' : 'text-purple-700';
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className={`${bg} px-4 py-3 border-b`}>
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle && <p className={`text-sm ${textSub}`}>{subtitle}</p>}
      </div>
      <div className="p-3">
        <table className="w-full text-sm">
          <tbody className="space-y-2">
            {rows.map((r, i) => (
              <tr key={i} className={i < rows.length - 1 ? 'border-b border-gray-100' : ''}>
                <td className="py-2 font-medium text-gray-700">{r.label}</td>
                <td className="py-2 text-right text-gray-900">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

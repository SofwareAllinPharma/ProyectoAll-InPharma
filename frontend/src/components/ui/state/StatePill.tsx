// no default React import needed with modern JSX transform

const classFor = (state: string) => {
  const s = (state || '').toLowerCase();
  if (s.includes('aprob') || s.includes('complet') || s.includes('entregado')) return 'bg-green-100 text-green-800';
  if (s.includes('rechaz') || s.includes('cancel')) return 'bg-red-100 text-red-800';
  if (s.includes('elabor') || s.includes('proceso') || s.includes('asign')) return 'bg-blue-100 text-blue-800';
  return 'bg-yellow-100 text-yellow-800';
};

export default function StatePill({ value }: { value: string }) {
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${classFor(value)}`}>{value}</span>
  );
}

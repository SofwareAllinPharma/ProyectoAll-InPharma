export default function ObservacionesField({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Aquí puede hacer indicaciones específicas para este movimiento."
        rows={3}
        maxLength={100}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] text-sm"
      />
    </div>
  );
}

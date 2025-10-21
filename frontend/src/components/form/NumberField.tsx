
interface Props {
  value: number | undefined | '';
  onChange: (v: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  step?: number;
  label?: string;
}

export default function NumberField({ value, onChange, placeholder, disabled = false, className = '', step = 1, label }: Props) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        disabled={disabled}
        placeholder={placeholder}
        min="0"
        step={step}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] disabled:bg-gray-100 font-roboto text-sm ${className}`}
      />
    </div>
  );
}

interface Props {
  value: number | undefined | '';
  onChange: (v: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function NumberField({ value, onChange, placeholder, disabled = false, className = '' }: Props) {
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      disabled={disabled}
      placeholder={placeholder}
      min="0"
      step="0.1"
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] disabled:bg-gray-100 font-roboto text-sm ${className}`}
    />
  );
}

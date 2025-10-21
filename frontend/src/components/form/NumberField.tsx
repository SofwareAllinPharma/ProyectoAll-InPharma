
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
        // show empty string when value is undefined or NaN so the user can erase the field
        value={Number.isNaN(value as number) ? '' : (value ?? '')}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '') {
            // signal empty by sending NaN (consumers often convert NaN to empty string)
            onChange(NaN);
            return;
          }
          const parsed = parseFloat(v);
          onChange(Number.isNaN(parsed) ? NaN : parsed);
        }}
        disabled={disabled}
        placeholder={placeholder}
        min="0"
        step={step}
        inputMode="numeric"
        pattern="[0-9]*"
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] disabled:bg-gray-100 font-roboto text-sm ${className}`}
      />
    </div>
  );
}

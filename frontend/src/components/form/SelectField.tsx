import SearchSelect from '../ui/SearchSelect';

interface Props<T> {
  items: T[];
  value: T | null;
  getKey: (t: T) => any;
  getLabel: (t: T) => string;
  onSelect: (t: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function SelectField<T>({ items, value, getKey, getLabel, onSelect, placeholder, disabled = false, className = '' }: Props<T>) {
  return (
    <div className={className}>
      <SearchSelect<T>
        items={items}
        value={value}
        getKey={getKey}
        getLabel={getLabel}
        onSelect={onSelect}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

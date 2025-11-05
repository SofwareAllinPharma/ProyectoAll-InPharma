import SearchSelect from '../../../../components/ui/SearchSelect';

type DepositoOption = { id: number; nombre: string };

type Props = {
  items: DepositoOption[];
  value: DepositoOption | null;
  onSelect: (d: DepositoOption | null) => void;
  excludeId?: number | null;
  placeholder?: string;
};

export default function DepositoSelect({ items, value, onSelect, excludeId, placeholder, onBlur }: Props & { onBlur?: () => void }) {
  const list = items.filter(d => d.id !== excludeId);
  return (
    <div onBlur={onBlur} tabIndex={-1}>
      <SearchSelect
        items={list}
        value={value}
        getKey={(d) => d.id}
        getLabel={(d) => d.nombre}
        onSelect={onSelect}
        onClear={() => onSelect(null)}
        placeholder={placeholder ?? 'Seleccionar depósito...'}
        noResultsText="Sin resultados"
        disableTyping
      />
    </div>
  );
}

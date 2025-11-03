import SearchSelect from '../../../../components/ui/SearchSelect';
import type { Deposito } from '../../../deposito/types/deposito.types';

type Props = {
  items: Deposito[];
  value: Deposito | null;
  onSelect: (d: Deposito | null) => void;
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
      />
    </div>
  );
}

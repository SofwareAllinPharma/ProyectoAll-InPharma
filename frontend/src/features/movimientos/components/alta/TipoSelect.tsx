import SearchSelect from '../../../../components/ui/SearchSelect';
import type { TipoMovimiento } from '../../types/movimiento.types';

type Option = { key: string; label: string; value: TipoMovimiento };

const tipos: Option[] = [
  { key: 'EGRESO', label: 'Egreso', value: 'EGRESO' },
  { key: 'TRASLADO', label: 'Traslado', value: 'TRASLADO' }
];

export default function TipoSelect({ value, onChange, onBlur }: { value: Option | null; onChange: (v: Option | null) => void; onBlur?: () => void }) {
  return (
    <div onBlur={onBlur} tabIndex={-1}>
      <SearchSelect
        items={tipos}
        value={value}
        getKey={(t) => t.key}
        getLabel={(t) => t.label}
        onSelect={onChange}
        onClear={() => onChange(null)}
        placeholder="Seleccionar tipo..."
        noResultsText="Sin resultados"
        disableTyping
      />
    </div>
  );
}

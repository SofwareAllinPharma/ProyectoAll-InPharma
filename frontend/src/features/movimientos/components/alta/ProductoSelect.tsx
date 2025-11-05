import SearchSelect from '../../../../components/ui/SearchSelect';
import type { InventarioProducto } from '../../../inventario/services/inventario.service';

type Props = {
  items: InventarioProducto[];
  value: InventarioProducto | null;
  onSelect: (p: InventarioProducto | null) => void;
  placeholder?: string;
};

export default function ProductoSelect({ items, value, onSelect, placeholder, onBlur }: Props & { onBlur?: () => void }) {
  return (
    <div onBlur={onBlur} tabIndex={-1}>
      <SearchSelect
        items={items}
        value={value}
        getKey={(p) => p.idProducto}
        getLabel={(p) => `${p.nombreComercial} (${p.cantidadProducto ?? 0})`}
        onSelect={onSelect}
        onClear={() => onSelect(null)}
        placeholder={placeholder ?? 'Seleccionar producto con stock...'}
        noResultsText="No hay productos con stock"
      />
    </div>
  );
}

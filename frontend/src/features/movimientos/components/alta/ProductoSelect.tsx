import SearchSelect from '../../../../components/ui/SearchSelect';

// Acepta cualquier opción que tenga como mínimo estas propiedades
type ProductoOption = {
  idProducto: number;
  nombreComercial?: string;
  nombre?: string;
  cantidadProducto?: number | null;
};

type Props = {
  items: ProductoOption[];
  value: ProductoOption | null;
  onSelect: (p: ProductoOption | null) => void;
  placeholder?: string;
};

export default function ProductoSelect({ items, value, onSelect, placeholder, onBlur, disabled }: Props & { onBlur?: () => void; disabled?: boolean }) {
  return (
    <div onBlur={onBlur} tabIndex={-1}>
      <SearchSelect
        items={items}
        value={value}
        getKey={(p) => p.idProducto}
        getLabel={(p) => `${p.nombreComercial ?? p.nombre ?? 'Producto'} (${p.cantidadProducto ?? 0})`}
        onSelect={onSelect}
        onClear={() => onSelect(null)}
        placeholder={placeholder ?? 'Seleccionar producto con stock...'}
        noResultsText="No hay productos con stock"
        disabled={disabled}
      />
    </div>
  );
}

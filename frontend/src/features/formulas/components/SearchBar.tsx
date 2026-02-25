import UI_SearchBar from '../../../components/ui/SearchBar';
import type { Insumo } from '../../insumos/types/insumo.types';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  insumos: Insumo[];
  selectedInsumo: number | null;
  onInsumoChange: (id: number | null) => void;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Buscar fórmulas...',
  insumos,
  selectedInsumo,
  onInsumoChange,
}: SearchBarProps) {
  return (
    <UI_SearchBar
      placeholder={placeholder}
      onSearch={onSearch}
      debounceMs={300}
      rightNode={
        <select
          value={selectedInsumo || ''}
          onChange={(e) => onInsumoChange(e.target.value ? Number(e.target.value) : null)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5d5448] text-sm bg-white"
        >
          <option value="">Todos los insumos</option>
          {insumos.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nombre}
            </option>
          ))}
        </select>
      }
    />
  );
}
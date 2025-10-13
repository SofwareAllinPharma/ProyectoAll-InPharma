import UI_SearchBar from '../../../components/ui/SearchBar';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch, placeholder = 'Buscar fórmulas...' }: SearchBarProps) {
  return <UI_SearchBar placeholder={placeholder} onSearch={onSearch} debounceMs={300} />;
}

import UI_SearchBar from '../../../components/ui/SearchBar';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  searchTerm: string;
}

export default function SearchBar({ placeholder = 'Buscar por nombre del insumo...', onSearch, searchTerm }: SearchBarProps) {
  return (
    <UI_SearchBar placeholder={placeholder} onSearch={onSearch} searchTerm={searchTerm} />
  );
}
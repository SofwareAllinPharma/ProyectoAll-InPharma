import React, { useEffect, useState, useRef } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  searchTerm?: string;
  debounceMs?: number;
  className?: string;
  rightNode?: React.ReactNode;
}

export default function SearchBar({
  placeholder = 'Buscar...',
  onSearch,
  searchTerm = '',
  debounceMs = 0,
  className = '',
  rightNode = null,
}: SearchBarProps) {
  const [local, setLocal] = useState(searchTerm);

  useEffect(() => {
    setLocal(searchTerm);
  }, [searchTerm]);

  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (debounceMs > 0) {
      const id = setTimeout(() => onSearch(local), debounceMs);
      return () => clearTimeout(id);
    }
    // immediate
    onSearch(local);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocal(e.target.value);
  };

  const clear = () => { setLocal(''); onSearch(''); };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-100 ${className}`}>
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          type="text"
          className={`block flex-1 pl-10 py-2 border border-gray-300 rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] placeholder-gray-500 text-sm transition-colors duration-200 ${rightNode ? 'pr-10' : 'pr-3'}`}
          placeholder={placeholder}
          value={local}
          onChange={handleChange}
        />

        {/* render clear button inline before rightNode so it doesn't overlap the selector */}
        {local && (
          <div className="ml-2 flex items-center">
            <button onClick={clear} title="Limpiar búsqueda" className="flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {rightNode && (
          <div className="ml-3 flex-shrink-0">
            {rightNode}
          </div>
        )}
      </div>
    </div>
  );
}

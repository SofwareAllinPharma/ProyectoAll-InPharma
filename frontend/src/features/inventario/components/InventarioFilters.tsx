import React from 'react';

interface Props {
    search: string;
    estadoFilter: string;
    onSearchChange: (v: string) => void;
    onEstadoChange: (v: string) => void;
}

const InventarioFilters: React.FC<Props> = ({ search, estadoFilter, onSearchChange, onEstadoChange }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
            <input
                type="text"
                placeholder="Buscar producto..."
                className="border rounded-md px-3 py-2 text-sm w-full md:w-64"
                value={search}
                onChange={e => onSearchChange(e.target.value)}
            />
            <div className="flex gap-2 mt-2 md:mt-0 items-center">
                <label htmlFor="estado-select" className="text-sm text-gray-700 mr-2">Estado:</label>
                <select
                    id="estado-select"
                    className="border rounded-md px-2 py-1 text-sm"
                    value={estadoFilter}
                    onChange={e => onEstadoChange(e.target.value)}
                >
                    <option value="">Todos</option>
                    <option value="CRITICO">Crítico</option>
                    <option value="BAJO">Bajo</option>
                    <option value="NORMAL">Normal</option>
                    <option value="DEFAULT">Sin umbral</option>
                </select>
            </div>
        </div>
    );
};

export default InventarioFilters;

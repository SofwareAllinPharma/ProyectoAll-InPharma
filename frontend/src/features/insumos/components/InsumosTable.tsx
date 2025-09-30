import { useState, useEffect } from 'react';
import type { Insumo } from '../types/insumo.types';

interface InsumosTableProps {
  insumos: Insumo[];
  onInsumoDoubleClick: (insumo: Insumo) => void;
  searchTerm: string;
}

export default function InsumosTable({ insumos, onInsumoDoubleClick, searchTerm }: InsumosTableProps) {
  const [filteredInsumos, setFilteredInsumos] = useState<Insumo[]>([]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInsumos(insumos);
    } else {
      const filtered = insumos.filter(insumo =>
        insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInsumos(filtered);
    }
  }, [insumos, searchTerm]);

  const formatNumber = (value: number): string => {
    return value % 1 === 0 ? value.toString() : value.toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#5d5448] text-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Calorías</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Grasas Tot.</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Grasas Trans</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Grasas Sat.</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Proteínas</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Carbohidratos</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Sodio</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Fibra</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Otros</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInsumos.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                  {searchTerm ? 'No se encontraron insumos con ese criterio de búsqueda' : 'No hay insumos disponibles'}
                </td>
              </tr>
            ) : (
              filteredInsumos.map((insumo, index) => (
                <tr
                  key={insumo.id}
                  className={`
                    transition-colors duration-200
                    hover:bg-[#f5f1e8] hover:shadow-sm
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  `}
                >
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{insumo.nombre}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{formatNumber(insumo.cal_100g)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{formatNumber(insumo.grasasTotales_100g)}g</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{formatNumber(insumo.grasasTrans_100g)}g</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{formatNumber(insumo.grasasSaturadas_100g)}g</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{formatNumber(insumo.proteinas_100g)}g</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{formatNumber(insumo.carbohidratos_100g)}g</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{formatNumber(insumo.sodio_100g * 1000)}mg</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{formatNumber(insumo.fibra_100g)}g</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{formatNumber(insumo.otro_100g)}g</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onInsumoDoubleClick(insumo)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                      title="Ver opciones"
                    >
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {filteredInsumos.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Mostrando {filteredInsumos.length} de {insumos.length} insumo{insumos.length !== 1 ? 's' : ''}
            {searchTerm && ` (filtrado por "${searchTerm}")`}
          </p>
        </div>
      )}
    </div>
  );
}
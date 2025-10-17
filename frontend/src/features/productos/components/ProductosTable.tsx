import React from 'react';
import type { Producto, ProductoModalAction } from '../types/producto.types';

interface Props {
  productos: Producto[];
  onProductoAction: (action: ProductoModalAction) => void;
  isLoading?: boolean;
}

export const ProductosTable: React.FC<Props> = ({
  productos,
  onProductoAction,
  isLoading = false,
}) => {
  const formatNumber = (value: number): string => {
    return value.toFixed(2);
  };

  const formatPorciones = (producto: Producto): string => {
    if (!producto.formula) return `${formatNumber(producto.cantPorcionesAportadas)} porciones`;
    
    const porcionesCompletas = Math.floor(producto.cantPorcionesAportadas);
    const porcionParcial = producto.cantPorcionesAportadas - porcionesCompletas;
    const pesoPorPorcion = producto.formula.porcion || producto.formula.porcionMinima || 0;
    const pesoParcial = porcionParcial * pesoPorPorcion;
    
    if (pesoParcial < 0.01) {
      return `${porcionesCompletas} porciones`;
    }
    
    return `${porcionesCompletas} porciones + ${formatNumber(pesoParcial)}g`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c6a55]"></div>
          <span className="ml-2 text-gray-600">Cargando productos...</span>
        </div>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">No se encontraron productos</p>
          <p className="text-sm">Ajusta los filtros de búsqueda o crea un nuevo producto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fórmula
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peso Neto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Porciones
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peso por Porción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.map((producto) => (
              <tr key={producto.idProducto} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {producto.nombreComercial}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {producto.idProducto}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {producto.formula?.nombre || 'Fórmula no encontrada'}
                  </div>
                  {producto.formula?.esProtegida && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Protegida
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {formatNumber(producto.pesoNeto)}g
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {formatPorciones(producto)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {producto.formula ? `${formatNumber(producto.formula.porcion || producto.formula.porcionMinima || 0)}g` : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    producto.estaActivo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {producto.estaActivo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="relative">
                    <button
                      onClick={() => onProductoAction({ type: 'view', producto })}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      title="Acciones"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
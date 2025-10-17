import React from 'react';
import type { Producto, ProductoModalAction } from '../types/producto.types';
import ActionMenu from '../../../components/ui/ActionMenu';
import DataTable from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';

interface Props {
  productos: Producto[];
  onProductoAction: (action: ProductoModalAction) => void;
  onShowNutrition?: (producto: Producto) => void;
  isLoading?: boolean;
}

export const ProductosTable: React.FC<Props> = ({
  productos,
  onProductoAction,
  onShowNutrition,
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

  const columns: Column<Producto>[] = [
    { 
      key: 'nombreComercial', 
      title: 'Producto', 
      width: '18%', 
      align: 'center',
      render: r => (
        <button
          onClick={() => onShowNutrition?.(r)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
          title="Ver información nutricional"
        >
          {r.nombreComercial}
        </button>
      )
    },
    { 
      key: 'formula', 
      title: 'Fórmula', 
      width: '18%', 
      align: 'center',
      render: r => (
        <div className="text-center">
          <div className="text-sm text-gray-900">
            {r.formula?.nombre || 'Fórmula no encontrada'}
          </div>
          {r.formula?.esProtegida && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
              Protegida
            </span>
          )}
        </div>
      )
    },
    { 
      key: 'pesoNeto', 
      title: 'Peso Neto', 
      width: '12%', 
      align: 'center',
      render: r => `${formatNumber(r.pesoNeto)}g`
    },
    { 
      key: 'cantPorcionesAportadas', 
      title: 'Porciones', 
      width: '20%', 
      align: 'center',
      render: r => formatPorciones(r)
    },
    { 
      key: 'pesoPorPorcion', 
      title: 'Peso por Porción', 
      width: '14%', 
      align: 'center',
      render: r => r.formula ? `${formatNumber(r.formula.porcion || r.formula.porcionMinima || 0)}g` : 'N/A'
    },
    { 
      key: 'estaActivo', 
      title: 'Estado', 
      width: '10%', 
      align: 'center',
      render: r => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          r.estaActivo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {r.estaActivo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    { 
      key: 'acciones', 
      title: 'Acciones', 
      width: '8%', 
      align: 'center',
      render: r => (
        <ActionMenu 
          items={[
            { 
              key: 'view', 
              label: 'Ver acciones', 
              onClick: () => onProductoAction({ type: 'view', producto: r }) 
            }
          ]} 
        />
      )
    }
  ];

  const emptyState = (
    <div className="text-center text-gray-500 py-4">
      <p className="text-lg mb-2">No se encontraron productos</p>
      <p className="text-sm">Ajusta los filtros de búsqueda o crea un nuevo producto</p>
    </div>
  );

  return (
    <DataTable 
      columns={columns} 
      data={productos} 
      rowKey={r => r.idProducto} 
      expandable={undefined}
      emptyState={emptyState}
      pagination 
      defaultPageSize={10} 
      pageSizeOptions={[5, 10, 20]} 
    />
  );
};
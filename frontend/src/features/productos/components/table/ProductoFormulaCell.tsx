import React from 'react';
import type { Producto } from '../../types/producto.types';

interface Props {
  producto: Producto;
}

const ProductoFormulaCell: React.FC<Props> = ({ producto }) => {
  return (
    <div className="text-center">
      <div className="text-sm text-gray-900">
        {producto.formula?.nombre || 'Fórmula no encontrada'}
      </div>
      {producto.formula?.esProtegida && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
          Protegida
        </span>
      )}
    </div>
  );
};

export default ProductoFormulaCell;

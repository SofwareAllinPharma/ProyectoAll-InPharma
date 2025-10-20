import React from 'react';
import type { Producto, ProductoModalAction } from '../../types/producto.types';

interface Props {
  producto: Producto;
  onAction: (action: ProductoModalAction) => void;
}

const ProductoNombreCell: React.FC<Props> = ({ producto, onAction }) => {
  return (
    <div
      className="text-sm font-medium text-gray-900 cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => onAction({ type: 'view', producto })}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onAction({ type: 'view', producto }); }}
    >
      {producto.nombreComercial}
    </div>
  );
};

export default ProductoNombreCell;

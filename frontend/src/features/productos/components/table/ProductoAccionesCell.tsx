import React from 'react';
import ActionMenu from '../../../../components/ui/ActionMenu';
import type { Producto, ProductoModalAction } from '../../types/producto.types';

interface Props {
  producto: Producto;
  onAction: (action: ProductoModalAction) => void;
}

const ProductoAccionesCell: React.FC<Props> = ({ producto, onAction }) => {
  const EyeIcon = (<svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
  const EditIcon = (<svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>);
  const TrashIcon = (<svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>);

  const items = [
    { key: 'view', label: 'Consultar', icon: EyeIcon, onClick: () => onAction({ type: 'view', producto }) },
    { key: 'edit', label: 'Editar', icon: EditIcon, onClick: () => onAction({ type: 'edit', producto }) },
    { key: 'delete', label: 'Eliminar', icon: TrashIcon, onClick: () => onAction({ type: 'delete', producto }) }
  ];

  return <ActionMenu items={items} ariaLabel={`acciones-producto-${producto.idProducto}`} menuWidth={180} />;
};

export default ProductoAccionesCell;

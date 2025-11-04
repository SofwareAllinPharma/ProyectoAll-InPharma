import React from 'react';
import ActionMenu from '../../../../components/ui/ActionMenu';
import type { Pedido } from '../../types/pedido.types';

interface Props {
  pedido: Pedido;
  onAction: (action: { type: 'view'; pedido: Pedido }) => void;
}

const PedidoAccionesCell: React.FC<Props> = ({ pedido, onAction }) => {
  const EyeIcon = (
    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const items = [
    { key: 'view', label: 'Consultar', icon: EyeIcon, onClick: () => onAction({ type: 'view', pedido }) }
  ];

  return <ActionMenu items={items} ariaLabel={`acciones-pedido-${pedido.numPedido}`} menuWidth={160} />;
};

export default PedidoAccionesCell;

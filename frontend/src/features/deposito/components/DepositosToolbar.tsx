import Button from '../../../components/ui/Button';
import { FaPlus } from 'react-icons/fa';

type Props = {
  onShowTraslado?: () => void;
  onShowPedido?: () => void;
};

export default function DepositosToolbar({ onShowPedido }: Props) {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="solid" title="Registrar Pedido" icon={<FaPlus size={16} />} onClick={onShowPedido}>
        Registrar Pedido
      </Button>
    </div>
  );
}

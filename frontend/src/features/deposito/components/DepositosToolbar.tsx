import Button from '../../../components/ui/Button';
import { FaTruck, FaPlus } from 'react-icons/fa';

type Props = {
  onShowTraslado?: () => void;
  onShowPedido?: () => void;
};

export default function DepositosToolbar({ onShowTraslado, onShowPedido }: Props) {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" title="Registrar Traslado" icon={<FaTruck size={16} className="text-[#7C6A55]" />} onClick={onShowTraslado}>
        Registrar Traslado
      </Button>
      <Button variant="solid" title="Registrar Pedido" icon={<FaPlus size={16} />} onClick={onShowPedido}>
        Registrar Pedido
      </Button>
    </div>
  );
}

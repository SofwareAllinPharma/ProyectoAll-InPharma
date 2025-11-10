import { FaClipboardList } from 'react-icons/fa';

interface PedidoHeaderProps {
  numPedido: number;
  estado: string;
  createdAt: string | Date;
}

export default function PedidoHeader({ numPedido, estado, createdAt }: PedidoHeaderProps) {
  const fecha = new Date(createdAt);
  
  return (
    <section className="relative rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <div className="absolute right-6 top-6">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          {estado || 'Pendiente'}
        </span>
      </div>
      <div className="flex flex-col items-center text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-[#F5F3EB] flex items-center justify-center">
          <FaClipboardList size={28} className="text-[#5d5448]" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Pedido PED-{numPedido}
        </h2>
        <div className="text-base text-gray-600">
          Creado: {fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} {fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </section>
  );
}

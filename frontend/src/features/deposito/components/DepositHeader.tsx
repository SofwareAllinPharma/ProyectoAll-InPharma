import { Link } from 'react-router-dom';
import { FaTruck, FaPlus } from 'react-icons/fa';

type Props = {
  title: string;
  subtitle?: string;
  onCreate: () => void;
};

export default function DepositHeader({ title, subtitle, onCreate }: Props) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
      <div>
        <h2 className="text-2xl font-semibold text-[#3E3529]">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      <div className="flex space-x-2">
        <Link
          to=" " //cuando se cree la pagina de traslados cambiar aqui
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#9D977B] text-[#3E3529] bg-transparent hover:bg-[#9D977B]/10 transition duration-200 text-sm font-medium"
        >
          <FaTruck size={18} className="text-[#7C6A55]" />
          Registrar Traslado
        </Link>

        <Link
          to=" " //cuando se cree la pagina de pedidos cambiar aqui
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#9D977B] text-white font-medium hover:bg-[#8A8569] transition duration-200 shadow-sm text-sm"
        >
          <FaPlus size={18} />
          Registrar Pedido
        </Link>

        <button
          onClick={onCreate}
          className="px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 focus:ring-2 focus:ring-[#5d5448]/50 focus:outline-none transition-all duration-200 flex items-center gap-2 text-sm font-medium"
          aria-label="Registrar Depósito"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Registrar Depósito
        </button>
      </div>
    </div>
  );
}

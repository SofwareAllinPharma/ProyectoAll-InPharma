import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaPlus } from 'react-icons/fa';

interface Props {
    estadoFilter: string;
}

const InventarioEmptyState: React.FC<Props> = ({ estadoFilter }) => {
    return (
        <div className="flex flex-col items-center gap-2 py-8">
            {estadoFilter && estadoFilter !== '' ? (
                <span className="text-gray-500">No hay productos con estado: {estadoFilter === 'CRITICO' ? 'Crítico' : estadoFilter === 'BAJO' ? 'Bajo' : estadoFilter === 'NORMAL' ? 'Normal' : 'Sin umbral'}</span>
            ) : (
                <span className="text-gray-500">Sin stock disponible</span>
            )}
            <div className="flex gap-2 mt-2">
                <Link
                    to=" "
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#9D977B] text-[#3E3529] bg-transparent hover:bg-[#9D977B]/10 transition duration-200 text-sm font-medium"
                >
                    <FaTruck size={18} className="text-[#7C6A55]" />
                    Registrar Traslado
                </Link>

                <Link
                    to=" "
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#9D977B] text-white font-medium hover:bg-[#8A8569] transition duration-200 shadow-sm text-sm"
                >
                    <FaPlus size={18} />
                    Registrar Pedido
                </Link>
            </div>
        </div>
    );
};

export default InventarioEmptyState;



import React, { useEffect, useState } from 'react';
import { ProductoService } from '../../features/productos/services/producto.service';
import type { Producto } from '../../features/productos/types/producto.types';

interface ConfigurarUmbralesModalProps {
  open: boolean;
  depositName: string;
  depositoId: number;
  onClose: () => void;
}


const ConfigurarUmbralesModal: React.FC<ConfigurarUmbralesModalProps> = ({ open, depositName, onClose }) => {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      ProductoService.getAllProductos()
        .then((data) => {
          setProducts(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Error al cargar productos');
          setLoading(false);
        });
    } else {
      setProducts([]);
    }
  }, [open]);

  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#3E3529]">
            Configurar Umbrales – {depositName}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Configura el <span className="font-semibold">umbral mínimo</span> para cada producto en este depósito.<br />
            El sistema alertará cuando el stock esté por debajo del umbral configurado.
          </p>

          <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-md border">
            <table className="min-w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Stock actual
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Umbral mínimo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-400">Cargando productos...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-red-400">{error}</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-400">No hay productos registrados.</td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.idProducto} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-[#3E3529]">{p.nombreComercial}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">-</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          disabled
                          className="w-28 px-2 py-1 border rounded-md text-sm border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                          placeholder="-"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-6 py-2 rounded-lg bg-[#5d5448] text-white opacity-50 cursor-not-allowed"
              disabled
            >
              Guardar todos
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default ConfigurarUmbralesModal;

import React, { useEffect, useState } from 'react';
import { InventarioService } from './services/inventario.service';
import type { InventarioProducto } from './services/inventario.service';

interface ConfigurarUmbralesModalProps {
  open: boolean;
  depositName: string;
  depositoId: number;
  onClose: () => void;
  onSuccess?: () => void;
}


const ConfigurarUmbralesModal: React.FC<ConfigurarUmbralesModalProps> = ({ open, depositName, depositoId, onClose, onSuccess }) => {
  const [inventario, setInventario] = useState<InventarioProducto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      InventarioService.getInventarioByDeposito(depositoId)
        .then((data) => {
          setInventario(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Error al cargar inventario');
          setLoading(false);
        });
    } else {
      setInventario([]);
    }
  }, [open, depositoId]);

  const [umbralMin, setUmbralMin] = useState<Record<number, number | ''>>({});

  useEffect(() => {
    if (open && inventario.length > 0) {
      const initial: Record<number, number | ''> = {};
      inventario.forEach(p => {
        initial[p.idProducto] = p.umbralMin ?? '';
      });
      setUmbralMin(initial);
    }
  }, [open, inventario]);

  const handleUmbralChange = (idProducto: number, value: string) => {
    const num = value === '' ? '' : Math.max(0, Number(value));
    setUmbralMin(prev => ({ ...prev, [idProducto]: num }));
  };

  const handleSave = async () => {
    const items = Object.entries(umbralMin)
      .filter(([_, val]) => val !== '' && !isNaN(Number(val)))
      .map(([id, val]) => ({ idProducto: Number(id), umbralMin: Number(val) }));
    if (!items.length) return;
    setLoading(true);
    setError(null);
    try {
      await InventarioService.bulkUpdateUmbrales(depositoId, items);
      setLoading(false);
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
      onClose();
    } catch (e: any) {
      setError(e.message || 'Error al guardar umbrales');
      setLoading(false);
    }
  };

  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#3E3529]">
            Configurar Umbrales – {depositName}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <span className="text-xl">×</span>
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Configura el <span className="font-semibold">umbral mínimo</span> para cada producto en este depósito.<br />
            El sistema alertará cuando el stock esté por debajo del umbral configurado.
          </p>

          <form
            onSubmit={e => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-md border">
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Stock Actual
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
                  ) : inventario.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-400">No hay productos registrados.</td>
                    </tr>
                  ) : (
                    inventario.map((p) => (
                      <tr key={p.idProducto} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-[#3E3529]">{p.nombreComercial}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">{p.cantidadProducto === null || p.cantidadProducto === undefined ? '-' : p.cantidadProducto}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={umbralMin[p.idProducto] ?? ''}
                            onChange={e => handleUmbralChange(p.idProducto, e.target.value)}
                            className="w-28 px-2 py-1 border rounded-md text-sm border-gray-300 focus:ring-[#5d5448] focus:border-[#5d5448]"
                            placeholder="-"
                            disabled={loading}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 disabled:opacity-50"
                disabled={loading}
              >
                Guardar umbrales
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : null;
};

export default ConfigurarUmbralesModal;

import React, { useEffect } from 'react';
import Modal from '../../../components/ui/modales/Modal';
import ModalHeader from '../../../components/ui/modales/ModalHeader';
import type { Pedido } from '../types/pedido.types';

interface Props {
  isOpen: boolean;
  pedido: Pedido | null | undefined;
  onClose: () => void;
}

const PedidoDetailModal: React.FC<Props> = ({ isOpen, pedido, onClose }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !pedido) return null;

  type FormulaInsumo = { idInsumo: number; cantidadInsumo: number; insumo?: { nombre?: string } };
  const computeInsumos = (): { nombre: string; cantidad: number }[] => {
    if (!pedido || !pedido.cantAProducir_gramos) return [];
    const prod = pedido.producto as unknown as { formula?: { insumos?: FormulaInsumo[] } };
    const insumos: FormulaInsumo[] = prod?.formula?.insumos ?? [];
    const totalFormula = insumos.reduce((s: number, i: FormulaInsumo) => s + (i.cantidadInsumo || 0), 0) || 0;
    const factor = totalFormula > 0 ? pedido.cantAProducir_gramos / totalFormula : 0;
    return insumos.map((fi: FormulaInsumo) => ({ nombre: fi.insumo?.nombre || `Insumo ${fi.idInsumo}`, cantidad: +(((fi.cantidadInsumo || 0) * factor)).toFixed(3) }));
  };

  return (
    <Modal open={isOpen} onClose={onClose} containerClass={`bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col`} backdropClassName="bg-black/30">
      <ModalHeader>
        <span className="text-2xl">Pedido PED-{pedido.numPedido}</span>
      </ModalHeader>

      <div className="p-6 overflow-y-auto flex-1 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-50 border rounded p-4">
            <h3 className="font-semibold mb-2">Información del Pedido</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Producto</div>
                <div className="font-medium">{pedido.producto?.nombreComercial ?? `#${pedido.idProducto}`}</div>
                <div className="text-xs text-gray-500">SKU: {pedido.idProducto}</div>
                <div className="mt-2 text-sm">Observaciones</div>
                <div className="mt-1 text-sm text-gray-700 bg-white p-2 rounded border">{pedido.observacion ?? '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Fechas</div>
                <div className="mt-1 text-sm">Creación: {new Date(pedido.createdAt).toLocaleString()}</div>
                <div className="mt-1 text-sm">Última actualización: {new Date(pedido.updatedAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Cant. gramos</div>
                <div className="font-medium">{pedido.cantAProducir_gramos} g</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Cant. paquetes</div>
                <div className="font-medium">{pedido.cantAProducir_paquetes} pqt</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Cant. porciones</div>
                <div className="font-medium">{pedido.cantAProducir_porciones} porciones</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 border rounded p-4">
              <h3 className="font-semibold mb-2">Estado del Pedido</h3>
              <div className="text-sm">{pedido.cambioActual?.estado?.nombre ?? '-'}</div>
              <div className="mt-2 text-sm">Creador</div>
              <div className="mt-1">{pedido.mailUsuarioCreador}</div>
              <div className="mt-2 text-sm">Técnico asignado</div>
              <div className="mt-1">{pedido.mailUsuarioCocinero ?? '-'}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded p-4">
          <h3 className="font-semibold mb-2">Insumos Requeridos</h3>
          {computeInsumos().length === 0 ? (
            <div className="text-sm text-gray-500">No hay insumos para mostrar.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500">
                <tr>
                  <th>Insumo</th>
                  <th className="text-right">Cantidad (g)</th>
                </tr>
              </thead>
              <tbody>
                {computeInsumos().map((i) => (
                  <tr key={i.nombre} className="border-t">
                    <td className="py-2">{i.nombre}</td>
                    <td className="py-2 text-right">{i.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white border rounded p-4">
          <h3 className="font-semibold mb-2">Historial de estados</h3>
          <div className="space-y-2">
            {(pedido.cambios || []).map((c) => (
              <div key={c.idCambioEstado} className="p-2 bg-gray-50 rounded">
                <div className="text-sm font-medium">{c.estado?.nombre}</div>
                <div className="text-xs text-gray-500">Inicio: {new Date(c.fechaHoraInicio).toLocaleString()}</div>
                {c.fechaHoraFin && <div className="text-xs text-gray-500">Fin: {new Date(c.fechaHoraFin).toLocaleString()}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 px-6 py-4 justify-center sm:justify-end">
        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 transition-colors">Cerrar</button>
      </div>
    </Modal>
  );
};

export default PedidoDetailModal;

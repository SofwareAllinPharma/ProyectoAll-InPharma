import React, { useEffect, useState } from 'react';
import Modal from '../../../components/ui/modales/Modal';
import ModalHeader from '../../../components/ui/modales/ModalHeader';
import type { Pedido } from '../types/pedido.types';
import ProductInfoCard from '../../productos/components/ProductInfoCard';
import type { Producto } from '../../productos/types/producto.types';
import { ProductoService } from '../../productos/services/producto.service';
import { PedidoService } from '../services/pedido.service';

interface Props {
  isOpen: boolean;
  pedido: Pedido | null | undefined;
  onClose: () => void;
  loading?: boolean;
  onRefresh?: () => Promise<void>;
}

const PedidoDetailModal: React.FC<Props> = ({ isOpen, pedido, onClose, loading, onRefresh }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pedido) return;
    const prod = pedido.producto as unknown as { formula?: { insumos?: unknown[] } };
    const hasInsumos = Array.isArray(prod?.formula?.insumos) && prod?.formula?.insumos.length > 0;
    if (!hasInsumos) {
      (async () => {
        try {
          const p = await ProductoService.getProductoById(pedido.idProducto);
          setProductoDetalle(p);
        } catch {
        }
      })();
    }
  }, [pedido]);

  if (!isOpen || !pedido) return null;

  const userProfile = Number(localStorage.getItem('userPerfil') || 0);
  const isTecnico = userProfile === 1;
  const isAdminFab = userProfile === 2;
  const isAdminSis = userProfile === 3;

  type FormulaInsumo = { idInsumo: number; cantidadInsumo: number; insumo?: { nombre?: string } };
  const computeInsumos = (): { nombre: string; cantidad: number }[] => {
    if (!pedido || !pedido.cantAProducir_gramos) return [];
    const prod = (productoDetalle ?? pedido.producto) as unknown as { formula?: { insumos?: FormulaInsumo[] } };
    const insumos: FormulaInsumo[] = prod?.formula?.insumos ?? [];
    const totalFormula = insumos.reduce((s: number, i: FormulaInsumo) => s + (i.cantidadInsumo || 0), 0) || 0;
    const factor = totalFormula > 0 ? Number(pedido.cantAProducir_gramos) / totalFormula : 0;
    return insumos.map((fi: FormulaInsumo) => ({ nombre: fi.insumo?.nombre || `Insumo ${fi.idInsumo}`, cantidad: +(((fi.cantidadInsumo || 0) * factor)).toFixed(3) }));
  };

  const formatQty = (v: number | string | undefined | null) => {
    if (v === undefined || v === null || v === '') return '-';
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    if (Number.isInteger(n)) return String(n);
    return Number(n.toFixed(4)).toString();
  };

  const estadoInfo = (estadoName?: string) => {
    const normalize = (s: string) =>
      s
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, '')
        .toLowerCase();
    const map: Record<string, { label: string; cls: string }> = {
      creado: { label: 'Pendiente', cls: 'bg-yellow-100 text-yellow-800' },
      enelaboracion: { label: 'En Proceso', cls: 'bg-blue-100 text-blue-800' },
      elaboradoydepositadoenfabrica: { label: 'Completado', cls: 'bg-green-100 text-green-800' },
      cancelado: { label: 'Cancelado', cls: 'bg-red-100 text-red-800' },
    };
    const key = normalize(estadoName || '');
    return map[key] ?? { label: estadoName || '-', cls: 'bg-gray-100 text-gray-800' };
  };

  const formatUserName = (email?: string | null) => {
    if (!email) return '-';
    const special: Record<string, string> = {
      'tecnico@aip.com': 'Técnico',
      'adminfab@aip.com': 'Admin Fábrica',
      'adminsis@aip.com': 'Admin Sistema',
    };
    if (special[email]) return special[email];
    const name = email.split('@')[0].replace(/[._-]/g, ' ');
    return name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
  };


  return (
    <Modal open={isOpen} onClose={onClose} containerClass={`bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col`} backdropClassName="bg-black/30">
      <ModalHeader>
        <span className="text-2xl">Pedido PED-{pedido.numPedido}</span>
      </ModalHeader>

      {loading ? (
        <div className="p-8 flex flex-col items-center justify-center flex-1">
          <div className="mb-4 text-lg">Cargando pedido…</div>
          <div className="h-8 w-8 border-4 border-gray-200 border-t-[#5d5448] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {pedido.producto && (() => {
              const grams = Number(pedido.cantAProducir_gramos) || 0;
              const portions = Number(pedido.cantAProducir_porciones) || 0;
              const pesoPorPorcion = portions > 0 ? Number((grams / portions).toFixed(2)) : 0;
              return <ProductInfoCard producto={pedido.producto as unknown as Producto} pesoPorPorcion={pesoPorPorcion} />;
            })()}
            <div className="bg-white border rounded p-4 mt-4">
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
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 border rounded p-4">
              <h3 className="font-semibold mb-2">Estado del Pedido</h3>
              <div className="mt-2">
                {(() => {
                  const info = estadoInfo(pedido.cambioActual?.estado?.nombre);
                  return <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${info.cls}`}>{info.label}</div>;
                })()}
              </div>
              <div className="mt-4 text-sm">Creador</div>
              <div className="mt-1">{formatUserName(pedido.mailUsuarioCreador)}</div>
              <div className="mt-2 text-sm">Técnico asignado</div>
              <div className="mt-1">{formatUserName(pedido.mailUsuarioCocinero ?? undefined)}</div>

              <div className="mt-4 flex flex-col gap-2">
                {pedido.cambioActual?.estado?.nombre === 'Creado' && !pedido.estaAsignado && (isTecnico || isAdminFab || isAdminSis) && (
                  <button
                    onClick={async () => {
                      if (busy) return;
                      setBusy(true);
                      try {
                        await PedidoService.tomarPedido(pedido.numPedido);
                        if (typeof onRefresh === 'function') await onRefresh();
                      } catch {
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className={`px-4 py-2 rounded ${busy ? 'opacity-60 pointer-events-none' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >Tomar pedido</button>
                )}

                {pedido.cambioActual?.estado?.nombre === 'EnElaboración' && (isTecnico || isAdminFab || isAdminSis) && (
                  <>
                    <button
                      onClick={async () => {
                        if (busy) return;
                        setBusy(true);
                        try {
                          await PedidoService.finalizarElaboracion(pedido.numPedido);
                          if (typeof onRefresh === 'function') await onRefresh();
                        } finally { setBusy(false); }
                      }}
                      className={`px-4 py-2 rounded ${busy ? 'opacity-60 pointer-events-none' : 'bg-green-600 text-white hover:bg-green-700'}`}
                    >Finalizar elaboración</button>
                    <button
                      onClick={async () => {
                        if (busy) return;
                        setBusy(true);
                        try {
                          await PedidoService.cancelar(pedido.numPedido);
                          if (typeof onRefresh === 'function') await onRefresh();
                        } finally { setBusy(false); }
                      }}
                      className={`px-4 py-2 rounded ${busy ? 'opacity-60 pointer-events-none' : 'bg-red-600 text-white hover:bg-red-700'}`}
                    >Cancelar pedido</button>
                  </>
                )}
              </div>
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
                    <td className="py-2 text-right">{formatQty(i.cantidad)}</td>
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
      )}

      <div className="flex gap-3 px-6 py-4 justify-center sm:justify-end">
        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 transition-colors">Cerrar</button>
      </div>
    </Modal>
  );
};

export default PedidoDetailModal;

import React, { useEffect, useState } from "react";
import type { Pedido } from "../types/pedido.types";
import ProductInfoCard from "../../productos/components/ProductInfoCard";
import type { Producto } from "../../productos/types/producto.types";
import { ProductoService } from "../../productos/services/producto.service";
import PedidoActions from "./PedidoActions";
import PedidoEstadoCell from "./PedidoEstadoCell";
import PedidoModalShell from "./PedidoModalShell";
import { productoParaOrden, descripcionComposicion } from '../utils/productoOrden';
import { computeInsumosRequeridos } from "../utils/insumos.utils";

interface Props {
  isOpen: boolean;
  pedido: Pedido | null | undefined;
  onClose: () => void;
  loading?: boolean;
  onRefresh?: () => Promise<void>;
}

const PedidoDetailModal: React.FC<Props> = ({
  isOpen,
  pedido,
  onClose,
  loading,
  onRefresh,
}) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);

  useEffect(() => {
    setProductoDetalle(null);
    if (!isOpen || !pedido) return;
    if (pedido.productoSnapshot != null) {
      setProductoDetalle(productoParaOrden(pedido));
      return;
    }
    let cancelled = false;
    ProductoService.getProductoById(pedido.idProducto)
      .then(p => { if (!cancelled) setProductoDetalle(p); })
      .catch(() => { if (!cancelled) setProductoDetalle(null); });
    return () => { cancelled = true; };
  }, [isOpen, pedido?.idProducto, pedido?.numPedido]);

  if (!isOpen || !pedido) return null;

  // Note: action/state logic lives in the dedicated <PedidoActions /> component.
  // This modal focuses on displaying pedido details only.

  const insumos = computeInsumosRequeridos(pedido, productoDetalle);

  const formatQty = (v: number | string | undefined | null) => {
    if (v === undefined || v === null || v === "") return "-";
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    if (Number.isInteger(n)) return String(n);
    // show up to 4 decimals, trim trailing zeros
    return Number(n.toFixed(4)).toString();
  };

  // estado badge ahora reutiliza PedidoEstadoCell

  const formatUserName = (email?: string | null) => {
    if (!email) return "-";
    const special: Record<string, string> = {
      "tecnico@aip.com": "Técnico",
      "adminfab@aip.com": "Admin Fábrica",
      "adminsis@aip.com": "Admin Sistema",
    };
    if (special[email]) return special[email];
    const name = email.split("@")[0].replace(/[._-]/g, " ");
    return name
      .split(" ")
      .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
      .join(" ");
  };

  return (
    <PedidoModalShell
      open={isOpen}
      onClose={onClose}
      title={<span className="text-2xl">Pedido PED-{pedido.numPedido}</span>}
      size="xl"
      loading={loading}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 transition-colors"
        >
          Cerrar
        </button>
      }
    >
      <div className="space-y-4">
        <p className="rounded bg-amber-50 p-3 text-sm text-amber-900">{descripcionComposicion(pedido)}</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Reuse ProductInfoCard used in Productos for consistent look */}
            {pedido.producto &&
              (() => {
                const grams = Number(pedido.cantAProducir_gramos) || 0;
                const portions = Number(pedido.cantAProducir_porciones) || 0;
                const pesoPorPorcion =
                  portions > 0 ? Number((grams / portions).toFixed(4)) : 0;
                return (
                  <ProductInfoCard
                    producto={(productoDetalle ?? pedido.producto) as Producto}
                    pesoPorPorcion={pesoPorPorcion}
                  />
                );
              })()}
            <div className="bg-white border rounded p-4 mt-4">
              <h3 className="font-semibold mb-2">Información de la Orden</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Producto</div>
                  <div className="font-medium">
                    {pedido.producto?.nombreComercial ??
                      `#${pedido.idProducto}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    SKU: {pedido.idProducto}
                  </div>
                  <div className="mt-2 text-sm">Observaciones</div>
                  <div className="mt-1 text-sm text-gray-700 bg-white p-2 rounded border">
                    {pedido.observacion ?? "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Fechas</div>
                  <div className="mt-1 text-sm">
                    Creación: {new Date(pedido.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-1 text-sm">
                    Última actualización:{" "}
                    {new Date(pedido.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Cant. gramos</div>
                  <div className="font-medium">
                    {pedido.cantAProducir_gramos} g
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Cant. paquetes</div>
                  <div className="font-medium">
                    {(() => {
                      const n = Number(pedido.cantAProducir_paquetes) || 0;
                      if (!n) return "-";
                      return `${n} ${n === 1 ? "paquete" : "paquetes"}`;
                    })()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Cant. porciones</div>
                  <div className="font-medium">
                    {pedido.cantAProducir_porciones} porciones
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 border rounded p-4">
              <h3 className="font-semibold mb-2">Estado de la Orden</h3>
              <div className="mt-2">
                <PedidoEstadoCell
                  estado={pedido.cambioActual?.estado?.nombre ?? ""}
                  asignado={pedido.estaAsignado === true}
                />
              </div>
              <div className="mt-4 text-sm">Creador</div>
              <div className="mt-1">
                {pedido.creador?.usuario?.persona
                  ? `${(pedido.creador.usuario.persona.nombre || "").trim()} ${(pedido.creador.usuario.persona.apellido || "").trim()}`.trim()
                  : formatUserName(pedido.mailUsuarioCreador)}
              </div>
              <div className="mt-2 text-sm">Técnico asignado</div>
              <div className="mt-1">
                {formatUserName(pedido.mailUsuarioCocinero ?? undefined)}
              </div>

              {/* Actions handled by a dedicated component to keep this file small */}
              <div className="mt-4">
                <PedidoActions pedido={pedido} onRefresh={onRefresh} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded p-4">
          <h3 className="font-semibold mb-2">Insumos Requeridos</h3>
          {insumos.length === 0 ? (
            <div className="text-sm text-gray-500">
              Composición no disponible. Verificá la fórmula antes de elaborar.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500">
                <tr>
                  <th>Insumo</th>
                  <th className="text-right">Cantidad (g)</th>
                </tr>
              </thead>
              <tbody>
                {insumos.map((i) => (
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
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Responsable:</span>{" "}
                  {c.responsable ?? "-"}
                </div>
                <div className="text-xs text-gray-500">
                  Inicio: {new Date(c.fechaHoraInicio).toLocaleString()}
                </div>
                {c.fechaHoraFin && (
                  <div className="text-xs text-gray-500">
                    Fin: {new Date(c.fechaHoraFin).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PedidoModalShell>
  );
};

export default PedidoDetailModal;

import React, { useState } from "react";
import { PedidoService } from "../services/pedido.service";
import type { Pedido, CambioEstado } from "../types/pedido.types";
import { useToast } from "../../../components/ui/toast/ToastContext";
import PedidoModalShell from "./PedidoModalShell";
import PedidoEstadoCell from "./PedidoEstadoCell";

interface Props {
  isOpen: boolean;
  pedido?: Pedido;
  onClose: () => void;
  onRefresh?: () => void;
}

const PedidoHistoryModal: React.FC<Props> = ({
  isOpen,
  pedido,
  onClose,
  onRefresh,
}) => {
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  if (!isOpen || !pedido) return null;

  const cambios: CambioEstado[] = pedido.cambios ?? [];
  cambios.sort(
    (a, b) =>
      new Date(a.fechaHoraInicio).getTime() -
      new Date(b.fechaHoraInicio).getTime()
  );

  const currentState = pedido.cambioActual?.estado?.nombre || "";
  const userProfile = localStorage.getItem("userPerfil") || "";

  const getAvailableActions = () => {
    const actions: Array<{ label: string; action: string; variant?: string }> =
      [];

    switch (currentState) {
      case "Pendiente":
        if (userProfile === "3" || userProfile === "2") {
          actions.push({ label: "Tomar Pedido", action: "tomar" });
        }
        break;
      case "Asignado":
        if (userProfile === "3") {
          actions.push({ label: "Iniciar Elaboración", action: "iniciar" });
        }
        break;
      case "En elaboracion":
        if (userProfile === "3") {
          actions.push({ label: "Finalizar Elaboración", action: "finalizar" });
        }
        break;
      case "Finalizado":
        if (userProfile === "2") {
          actions.push({ label: "Aprobar", action: "aprobar" });
          actions.push({
            label: "Rechazar",
            action: "rechazar",
            variant: "danger",
          });
        }
        break;
      default:
        break;
    }

    return actions;
  };

  const handleAction = async (action: string) => {
    if (!pedido) return;

    setLoading(true);
    try {
      let message = "";
      switch (action) {
        case "tomar":
          await PedidoService.tomarPedido(pedido.numPedido);
          message = "Pedido tomado exitosamente";
          break;
        case "iniciar":
          await PedidoService.iniciarElaboracion(pedido.numPedido);
          message = "Elaboración iniciada";
          break;
        case "finalizar":
          await PedidoService.finalizarElaboracion(pedido.numPedido);
          message = "Elaboración finalizada";
          break;
        case "aprobar":
          await PedidoService.aprobarPedido(pedido.numPedido);
          message = "Pedido aprobado";
          break;
        case "rechazar":
          await PedidoService.rechazarPedido(pedido.numPedido);
          message = "Pedido rechazado";
          break;
        default:
          throw new Error("Acción no válida");
      }

      show({ message, type: "success" });
      onRefresh?.();
      onClose();
    } catch (error) {
      show({
        message: (error as Error)?.message || "Error ejecutando acción",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const availableActions = getAvailableActions();

  return (
    <PedidoModalShell
      open={isOpen}
      onClose={onClose}
      title={<>Pedido #{pedido.numPedido} - {pedido.producto?.nombreComercial}</>}
      size="lg"
      footer={(
        <button
          className="px-5 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 disabled:opacity-50"
          onClick={onClose}
          disabled={loading}
        >
          Cerrar
        </button>
      )}
    >
      <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Producto:</span>{" "}
              {pedido.producto?.nombreComercial}
            </div>
            <div>
              <span className="font-medium">Estado actual:</span>
              <span className="ml-2 inline-block align-middle">
                <PedidoEstadoCell estado={currentState} asignado={pedido.estaAsignado === true} />
              </span>
            </div>
            <div>
              <span className="font-medium">Cantidad:</span>{" "}
              {pedido.cantAProducir_gramos}g / {pedido.cantAProducir_paquetes}{" "}
              pqt / {pedido.cantAProducir_porciones} por
            </div>
            <div>
              <span className="font-medium">Creado por:</span>{" "}
              {(() => {
                const email = pedido.mailUsuarioCreador;
                if (!email) return '-';
                const special: Record<string, string> = {
                  'tecnico@aip.com': 'Técnico',
                  'adminfab@aip.com': 'Admin Fábrica',
                  'adminsis@aip.com': 'Admin Sistema',
                };
                if (special[email]) return special[email];
                const name = email.split('@')[0].replace(/[._-]/g, ' ');
                return name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
              })()}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Observaciones:</span>{" "}
              {pedido.observacion || "Sin observaciones"}
            </div>
          </div>
      </div>

      <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">
            Historial de Estados
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {cambios.map((c, index) => (
              <div key={c.idCambioEstado} className="flex items-start gap-3">
                <div
                  className={`w-3 h-3 mt-1 rounded-full ${
                    index === cambios.length - 1
                      ? "bg-blue-500"
                      : "bg-green-500"
                  }`}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {c.estado?.nombre ?? "Estado"}
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
              </div>
            ))}
            {cambios.length === 0 && (
              <p className="text-gray-500 text-sm">
                No hay historial disponible
              </p>
            )}
          </div>
      </div>

      {availableActions.length > 0 && (
        <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-3">
              Acciones Disponibles
            </h4>
            <div className="flex gap-2 flex-wrap">
              {availableActions.map((action) => (
                <button
                  key={action.action}
                  onClick={() => handleAction(action.action)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-medium disabled:opacity-50 ${
                    action.variant === "danger"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-[#5d5448] hover:bg-[#5d5448]/90 text-white"
                  }`}
                >
                  {loading ? "Procesando..." : action.label}
                </button>
              ))}
            </div>
        </div>
      )}
    </PedidoModalShell>
  );
};

export default PedidoHistoryModal;

import React, { useEffect, useState } from "react";
import Modal from "../../../../components/ui/modales/Modal";
import ModalHeader from "../../../../components/ui/modales/ModalHeader";
import ModalFooter from "../../../../components/ui/modales/ModalFooter";
import { ProductoService } from "../../../productos/services/producto.service";
import type { Producto } from "../../../productos/types/producto.types";
import type { CreatePedidoRequest } from "../../types/pedido.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePedidoRequest) => Promise<void>;
}

const PedidoFormModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mode, setMode] = useState<"gramos" | "paquetes" | "porciones">(
    "gramos"
  );
  const [value, setValue] = useState<number | "">("");
  const [observacion, setObservacion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void ProductoService.getAllProductos({ search: "", buscarPor: "producto" })
      .then(setProductos)
      .catch(() => setProductos([]));
  }, []);

  const selected = productos.find((p) => p.idProducto === selectedId);

  function calcular() {
    if (!selected || typeof value !== "number" || value <= 0) return null;
    const pesoPaquete = Number(selected.pesoNeto);
    const porcion = Number(selected.formula?.porcion ?? 0);
    if (!pesoPaquete || !porcion) return null;
    let gramos = 0,
      paquetes = 0,
      porciones = 0;
    if (mode === "gramos") {
      gramos = value;
      paquetes = +(gramos / pesoPaquete).toFixed(4);
      porciones = +(gramos / porcion).toFixed(4);
    } else if (mode === "paquetes") {
      paquetes = value;
      gramos = +(paquetes * pesoPaquete).toFixed(4);
      porciones = +(gramos / porcion).toFixed(4);
    } else {
      porciones = value;
      gramos = +(porciones * porcion).toFixed(4);
      paquetes = +(gramos / pesoPaquete).toFixed(4);
    }
    return { gramos, paquetes, porciones };
  }

  const handleSubmit = async () => {
    if (!selectedId) return;
    const conv = calcular();
    if (!conv) throw new Error("Seleccione producto y cantidad válida");
    const payload: CreatePedidoRequest = {
      idProducto: selectedId,
      gramos: conv.gramos,
      paquetes: conv.paquetes,
      porciones: conv.porciones,
      observacion: observacion || undefined,
      // Anotar creador: intentamos usar el token si existe, si no pedirá en backend
      mailUsuarioCreador:
        localStorage.getItem("userMail") || "adminfab@aip.com",
      idPerfilCreador: Number(localStorage.getItem("userPerfil")) || 2,
    };
    setSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const conv = calcular();

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      containerClass="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4"
    >
      <div className="p-4">
        <ModalHeader>Crear Pedido</ModalHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="space-y-4 mt-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Producto
            </label>
            <select
              className="mt-1 block w-full"
              value={selectedId ?? ""}
              onChange={(e) =>
                setSelectedId(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">-- Seleccione --</option>
              {productos.map((p) => (
                <option key={p.idProducto} value={p.idProducto}>
                  {p.nombreComercial}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cantidad (seleccione unidad)
            </label>
            <div className="flex gap-2 items-center mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={mode === "gramos"}
                  onChange={() => setMode("gramos")}
                />{" "}
                Gramos
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={mode === "paquetes"}
                  onChange={() => setMode("paquetes")}
                />{" "}
                Paquetes
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={mode === "porciones"}
                  onChange={() => setMode("porciones")}
                />{" "}
                Porciones
              </label>
            </div>
            <input
              className="mt-2 block w-full"
              type="number"
              min="0"
              value={value as any}
              onChange={(e) =>
                setValue(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
            {conv && (
              <div className="mt-2 text-sm text-gray-600">
                Equivalencias: {conv.gramos} g — {conv.paquetes} pqt —{" "}
                {conv.porciones} porciones
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Observación
            </label>
            <textarea
              className="mt-1 block w-full"
              rows={3}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
            />
          </div>
        </form>

        <div className="mt-4 border-t pt-4">
          <ModalFooter
            onCancel={onClose}
            submitting={submitting}
            submitLabel="Crear Pedido"
          />
        </div>
      </div>
    </Modal>
  );
};

export default PedidoFormModal;

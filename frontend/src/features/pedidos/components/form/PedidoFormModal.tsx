import React, { useEffect, useState } from "react";
import Modal from "../../../../components/ui/modales/Modal";
import ModalHeader from "../../../../components/ui/modales/ModalHeader";
import Button from "../../../../components/ui/Button";
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
  const [value, setValue] = useState<number | string>("");
  const [observacion, setObservacion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void ProductoService.getAllProductos({ search: "", buscarPor: "producto" })
      .then(setProductos)
      .catch(() => setProductos([]));
  }, []);

  const selected = productos.find((p) => p.idProducto === selectedId);
  const creatorMail = localStorage.getItem("userMail") || "adminfab@aip.com";
  const creationDate = new Date().toLocaleString();

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
              className="mt-1 block w-full px-4 py-2 border rounded-md"
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
            <div className="flex gap-4 items-center mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={mode === "gramos"}
                  onChange={() => setMode("gramos")}
                />
                <span className="ml-1">Gramos</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={mode === "paquetes"}
                  onChange={() => setMode("paquetes")}
                />
                <span className="ml-1">Paquetes</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={mode === "porciones"}
                  onChange={() => setMode("porciones")}
                />
                <span className="ml-1">Porciones</span>
              </div>
            </div>
            <input
              className="mt-2 block w-full px-4 py-3 border rounded-md text-lg"
              type="number"
              min="0"
              step="0.0001"
              value={value}
              onChange={(e) =>
                setValue(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
            {conv && (
              <div className="mt-2 text-sm text-gray-600">
                Equivalencias: {conv.gramos} g — {conv.paquetes} pqt — {conv.porciones} porciones
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Observación
            </label>
            <textarea
              className="mt-1 block w-full px-4 py-3 border rounded-md"
              rows={4}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
            />
          </div>
          
          {/* Info: creador y fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Creado por</label>
              <div className="mt-1 text-sm text-gray-700">{creatorMail}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha</label>
              <div className="mt-1 text-sm text-gray-700">{creationDate}</div>
            </div>
          </div>

          {/* Insumos requeridos calculados */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Insumos Requeridos</label>
            <div className="mt-2 p-3 border rounded-md bg-gray-50 min-h-[80px]">
              {!selected || !conv ? (
                <div className="text-sm text-gray-500">Seleccione un producto y cantidad para ver los insumos requeridos.</div>
              ) : selected.formula?.insumos && selected.formula.insumos.length > 0 ? (
                <ul className="space-y-2 text-sm text-gray-700">
                  {(() => {
                    const totalFormula = selected.formula.insumos.reduce((s, i) => s + (i.cantidadInsumo || 0), 0) || 0;
                    const factor = totalFormula > 0 ? conv.gramos / totalFormula : 0;
                    return selected.formula!.insumos!.map((fi) => {
                      const nombre = fi.insumo?.nombre || `Insumo ${fi.idInsumo}`;
                      const required = +( (fi.cantidadInsumo || 0) * factor ).toFixed(3);
                      return (
                        <li key={fi.idInsumo} className="flex justify-between">
                          <span>{nombre}</span>
                          <span className="font-medium">{required} g</span>
                        </li>
                      );
                    });
                  })()}
                </ul>
              ) : (
                <div className="text-sm text-gray-500">No hay insumos en la fórmula del producto.</div>
              )}
            </div>
          </div>
        </form>

        <div className="mt-4 border-t pt-4">
          <div className="flex gap-3 pt-4 px-4 py-4 justify-center sm:justify-end">
            <Button variant="outline" onClick={onClose} className="px-6 py-2">
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                setSubmitting(true);
                try {
                  await handleSubmit();
                } finally {
                  setSubmitting(false);
                }
              }}
              className="px-6 py-2"
              ariaLabel="Crear Pedido"
            >
              {submitting ? "Creando..." : "Crear Pedido"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PedidoFormModal;

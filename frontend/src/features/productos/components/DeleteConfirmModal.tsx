import React from "react";
import ConfirmDialog from "../../../components/ui/modales/ConfirmDialog";
import type { Producto } from "../types/producto.types";

interface Props {
  isOpen: boolean;
  producto: Producto | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<Props> = ({
  isOpen,
  producto,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen || !producto) return null;

  const description = (
    <div className="space-y-4">
      <p className="text-gray-700">
        Se eliminará el producto{" "}
        <strong className="text-gray-900">"{producto.nombreComercial}"</strong>?
      </p>

      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
        <p>
          <strong>Nombre:</strong> {producto.nombreComercial}
        </p>
        <p>
          <strong>Fórmula:</strong>{" "}
          {producto.formula?.nombre || "No disponible"}
        </p>
        <p>
          <strong>Peso neto:</strong> {producto.pesoNeto.toFixed(4)}g
        </p>
        <p>
          <strong>Porciones:</strong>{" "}
          {producto.cantPorcionesAportadas.toFixed(4)}
        </p>
      </div>
    </div>
  );

  return (
    <ConfirmDialog
      open={isOpen}
      title="¿Eliminar producto?"
      description={description}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmLabel={isLoading ? "Eliminando..." : "Sí, eliminar"}
      cancelLabel="Cancelar"
      loading={isLoading}
    />
  );
};

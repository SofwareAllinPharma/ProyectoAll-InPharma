import React, { useEffect, useState } from "react";
import { useToast } from "../../../../components/ui/toast/ToastContext";
import Modal from "../../../../components/ui/modales/Modal";
import ModalHeader from "../../../../components/ui/modales/ModalHeader";
import Button from "../../../../components/ui/Button";
import { ProductoService } from "../../../productos/services/producto.service";
import type { Producto } from "../../../productos/types/producto.types";
import QuantityControl from "./QuantityControl";
import ProductSelector from "./ProductSelector";
import InsumosPreview from "./InsumosPreview";
import CreatorInfo from "./CreatorInfo";
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
    "paquetes"
  );
  const [value, setValue] = useState<number | string>("");
  const [observacion, setObservacion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ producto?: string; cantidad?: string; insumos?: string }>({});
  const { show } = useToast();

  useEffect(() => {
    void ProductoService.getAllProductos({ search: "", buscarPor: "producto" })
      .then(setProductos)
      .catch(() => setProductos([]));
  }, []);

  // Reset form state when modal opens (ensure stale data doesn't persist)
  const resetForm = () => {
    setSelectedId(null);
    // force mode to paquetes so user edits only packages
    setMode('paquetes');
    setValue('');
    setObservacion('');
    setSubmitting(false);
    setValidationError(null);
    setErrors({});
  };

  // Reset form whenever the modal open state changes (open or close)
  useEffect(() => {
    resetForm();
  }, [isOpen]);

  // ensure we clear state before notifying parent that modal closed
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Keep previous mode to convert value when switching units
  const prevModeRef = React.useRef(mode);

  // Selected product derived from productos/selectedId (moved up so effects can reference it)
  const selected = productos.find((p) => p.idProducto === selectedId);

  // When mode changes, convert existing numeric value to the new unit so input reflects equivalence
  useEffect(() => {
    // Only convert when there is a selected product and a numeric value
    if (!selected) return;
    if (value === "" || value === null) return;
    if (typeof value !== 'number') return;
    const pesoPaquete = Number(selected.pesoNeto) || 0;
    const porcion = Number(selected.formula?.porcion ?? 0) || 0;
    if (!pesoPaquete || !porcion) {
      // update prevModeRef then exit
      prevModeRef.current = mode;
      return;
    }

    const from = prevModeRef.current; // previous mode
    const to = mode;
    let gramosEquivalent = 0;
    if (from === 'gramos') gramosEquivalent = Number(value);
    else if (from === 'paquetes') gramosEquivalent = Number(value) * pesoPaquete;
    else gramosEquivalent = Number(value) * porcion;

    if (to === 'gramos') {
      setValue(Number(Number(gramosEquivalent).toFixed(4)));
    } else if (to === 'paquetes') {
      const paquetesExact = gramosEquivalent / pesoPaquete;
      // show exact equivalent (can be fractional in the UI) but arrows will step by 1
      setValue(Number(Number(paquetesExact).toFixed(4)));
    } else {
      const porcionesExact = gramosEquivalent / porcion;
      setValue(Number(Number(porcionesExact).toFixed(4)));
    }

    // finally update previous mode
    prevModeRef.current = mode;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selected]);

  const creatorMail = localStorage.getItem("userMail") || "adminfab@aip.com";
  const [creationDate] = useState(() => new Date().toLocaleString());


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
      paquetes = gramos / pesoPaquete;
      porciones = +(gramos / porcion).toFixed(6);
    } else if (mode === "paquetes") {
      // ensure paquetes are interpreted as integer count for conversion, but keep decimal representation for UI
      paquetes = Math.round(value);
      gramos = +(paquetes * pesoPaquete).toFixed(6);
      // Use cantPorcionesAportadas for exact integer-based porciones (avoids floating point drift)
      porciones = selected.cantPorcionesAportadas
        ? paquetes * selected.cantPorcionesAportadas
        : +(gramos / porcion).toFixed(6);
    } else {
      porciones = value;
      gramos = +(porciones * porcion).toFixed(6);
      paquetes = selected.cantPorcionesAportadas
        ? porciones / selected.cantPorcionesAportadas
        : +(gramos / pesoPaquete).toFixed(6);
    }
    return { gramos, paquetes, porciones };
  }

  const handleSubmit = async () => {
    // reset errors
    setErrors({});
    setValidationError(null);

    if (!selectedId) {
      setErrors((s) => ({ ...s, producto: 'Seleccione un producto' }));
      // don't show global toast for validation errors; keep inline only
      return;
    }

    const conv = calcular();
    if (!conv) {
      setErrors((s) => ({ ...s, cantidad: 'Ingrese una cantidad válida' }));
      return;
    }

    // ensure selected product object exists
    if (!selected) {
      setErrors((s) => ({ ...s, producto: 'Producto no encontrado' }));
      return;
    }

    // Validation: the final quantities must resolve to an exact integer number of packages
    const pesoPaquete = Number(selected.pesoNeto) || 0;
    const porcion = Number(selected.formula?.porcion ?? 0) || 0;
    const paquetesFloat = Number(conv.paquetes) || 0;
    const porcionesFloat = Number(conv.porciones) || 0;
    const EPS = 1e-6;

    if (pesoPaquete <= 0 || porcion <= 0) {
      const msg = 'Producto con datos de peso/porción inválidos';
      setErrors((s) => ({ ...s, cantidad: msg }));
      show({ message: msg, type: 'error' });
      return;
    }

    if (mode === 'gramos') {
      const rounded = Math.round(paquetesFloat);
      if (Math.abs(paquetesFloat - rounded) > EPS) {
        const next = Math.ceil(paquetesFloat);
        const missingPaquetes = next - paquetesFloat;
        const missingGramos = +(next * pesoPaquete - conv.gramos).toFixed(4);
        const paqLabel = Math.round(missingPaquetes) === 1 ? 'paquete' : 'paquetes';
        const nextLabel = next === 1 ? 'paquete' : 'paquetes';
        const msg = `Cantidad en gramos no completa paquetes enteros. Faltan ${missingPaquetes.toFixed(4)} ${paqLabel} (~${missingGramos} g) para llegar a ${next} ${nextLabel}.`;
        setErrors((s) => ({ ...s, cantidad: msg }));
        return;
      }
    }

    if (mode === 'porciones') {
      const portionsPerPackage = pesoPaquete / porcion;
      const roundedPPP = Math.round(portionsPerPackage);
      if (roundedPPP <= 0) {
        const msg = 'El producto tiene porciones por paquete inválidas';
        setErrors((s) => ({ ...s, cantidad: msg }));
        show({ message: msg, type: 'error' });
        return;
      }
      const remainder = porcionesFloat % roundedPPP;
      if (Math.abs(remainder) > EPS) {
        const missingPorciones = roundedPPP - remainder;
        const missingGramos = +(missingPorciones * porcion).toFixed(4);
        const msg = `La cantidad en porciones no completa paquetes enteros. Faltan ${missingPorciones} porciones (~${missingGramos} g) para completar ${roundedPPP} porciones por paquete.`;
        setErrors((s) => ({ ...s, cantidad: msg }));
        return;
      }
    }

    const payload: CreatePedidoRequest = {
      idProducto: selectedId,
      gramos: Number(Number(conv.gramos).toFixed(4)),
      // paquetes must be integer
      paquetes: Math.round(Number(conv.paquetes)),
      porciones: Number(Number(conv.porciones).toFixed(4)),
      observacion: observacion || undefined,
      // Anotar creador: intentamos usar el token si existe, si no pedirá en backend
      mailUsuarioCreador:
        localStorage.getItem("userMail") || "adminfab@aip.com",
      idPerfilCreador: Number(localStorage.getItem("userPerfil")) || 2,
    };
    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      show({ message: (err as Error)?.message || 'Error creando pedido', type: 'error' });
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const conv = calcular();

  

  const formatQty = (v: number | undefined) => {
    if (v === undefined || v === null) return '-';
    if (Number.isInteger(v)) return String(v);
    return String(Number(v.toFixed(4)));
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      containerClass="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col"
    >
      <ModalHeader>Crear Pedido</ModalHeader>

      <div className="overflow-y-auto px-6 py-4 flex-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="space-y-4"
        >
            <ProductSelector productos={productos} selectedId={selectedId} setSelectedId={setSelectedId} error={errors.producto} />

            <div className="border-t border-gray-100 pt-4">
              <div className="mb-2 text-sm text-gray-500"><span className="font-medium text-gray-700">Paquetes</span></div>
              <QuantityControl
                mode={mode}
                value={value}
                setValue={setValue}
                selected={selected}
                disabled={!selected}
              />
              {conv && (
                <div className="mt-2 p-2 bg-[#F5F3EB] rounded-md text-xs text-gray-700 text-center border border-gray-200">
                  <span className="text-xs text-gray-500 mr-1">Equivalencias:</span>
                  <span className="font-medium text-[#5d5448]">{formatQty(conv.gramos)} g</span>
                  <span className="mx-1 text-gray-400">•</span>
                  <span className="font-medium text-[#5d5448]">{Math.round(conv.paquetes)} {Math.round(conv.paquetes) === 1 ? 'paquete' : 'paquetes'}</span>
                  <span className="mx-1 text-gray-400">•</span>
                  <span className="font-medium text-[#5d5448]">{formatQty(conv.porciones)} porciones</span>
                </div>
              )}
              {validationError && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-200">{validationError}</div>
              )}
              {errors.cantidad && <p className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-200">{errors.cantidad}</p>}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observación
              </label>
              <textarea
                className="block w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#5d5448] focus:border-[#5d5448] text-sm transition-colors"
                rows={2}
                maxLength={256}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Notas adicionales…"
              />
              <div className="mt-1 text-xs text-gray-400 text-right">
                {observacion.length}/256
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4">
              <CreatorInfo creatorMail={creatorMail} creationDate={creationDate} />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <InsumosPreview selected={selected} gramos={conv?.gramos ?? null} error={errors.insumos} />
            </div>
        </form>
      </div>

      <div className="border-t border-gray-100 px-6 py-4 flex-none bg-white">
        <div className="flex gap-3 justify-center sm:justify-end">
          <Button variant="outline" onClick={handleClose} className="px-6 py-2">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setValidationError(null);
              void handleSubmit();
            }}
            className="px-6 py-2"
            ariaLabel="Crear Pedido"
          >
            {submitting ? "Creando..." : "Crear Pedido"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PedidoFormModal;
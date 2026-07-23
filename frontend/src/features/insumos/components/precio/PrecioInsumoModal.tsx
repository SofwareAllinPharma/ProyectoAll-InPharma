import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/modales/Modal';
import ModalHeader from '../../../../components/ui/modales/ModalHeader';
import SearchSelect from '../../../../components/ui/SearchSelect';
import { ProveedorService } from '../../../proveedores/services/proveedor.service';
import { InsumoService } from '../../services/insumo.service';
import type { Proveedor } from '../../../proveedores/types/proveedor.types';

interface Props {
  open: boolean;
  insumoId: number;
  insumoNombre: string;
  onSaved: () => void;
  onCancel: () => void;
}

export default function PrecioInsumoModal({ open, insumoId, insumoNombre, onSaved, onCancel }: Props) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [precio, setPrecio] = useState('');
  const [obs, setObs] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setProveedor(null);
    setPrecio('');
    setObs('');
    setError('');
    ProveedorService.list().then(setProveedores).catch(() => setProveedores([]));
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedor) { setError('Seleccioná un proveedor.'); return; }
    const num = parseFloat(precio);
    if (isNaN(num) || num <= 0) { setError('Ingresá un precio válido mayor a 0.'); return; }
    setSaving(true);
    try {
      await InsumoService.setNuevoPrecio(insumoId, {
        idProveedor: proveedor.id,
        precioPorKg: num,
        observacion: obs.trim() || undefined,
      });
      onSaved();
    } catch (e: any) {
      setError(e?.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onCancel} className="z-[11000]" containerClass="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
      <ModalHeader>Actualizar precio — {insumoNombre}</ModalHeader>
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="p-6 flex-1 overflow-auto min-h-0 space-y-4">
          <p className="text-xs text-gray-500">El precio anterior quedará en el historial. Solo puede haber un precio activo por insumo.</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor <span className="text-red-500">*</span></label>
            <SearchSelect
              items={proveedores}
              value={proveedor}
              getKey={p => String(p.id)}
              getLabel={p => p.nombre}
              getSearchString={p => `${p.nombre} ${p.razonSocial ?? ''} ${p.cuit ?? ''}`}
              onSelect={p => { setProveedor(p); setError(''); }}
              onClear={() => setProveedor(null)}
              placeholder="Seleccioná un proveedor..."
              noResultsText="No se encontraron proveedores"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio por kg ($) <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={precio}
              onChange={e => { setPrecio(e.target.value); setError(''); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9D977B]"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
            <input
              value={obs}
              onChange={e => setObs(e.target.value)}
              maxLength={300}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9D977B]"
              placeholder="Ej: cotización julio 2026"
            />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">{error}</p>}
        </div>
        <div className="flex gap-3 px-6 py-4 flex-none border-t border-gray-100">
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#5d5448] rounded-lg hover:bg-[#4a433e] disabled:opacity-50 transition-colors">
            {saving ? 'Guardando…' : 'Guardar precio'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/modales/Modal';
import ModalHeader from '../../../components/ui/modales/ModalHeader';
import type { Proveedor, CreateProveedorDto } from '../types/proveedor.types';

interface Props {
  open: boolean;
  proveedor?: Proveedor | null;
  onSave: (dto: CreateProveedorDto) => Promise<void>;
  onCancel: () => void;
}

const EMPTY: CreateProveedorDto = { nombre: '', telefono: '', email: '', cuit: '', razonSocial: '' };

export default function ProveedorFormModal({ open, proveedor, onSave, onCancel }: Props) {
  const [form, setForm] = useState<CreateProveedorDto>(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(proveedor
      ? { nombre: proveedor.nombre, telefono: proveedor.telefono ?? '', email: proveedor.email ?? '', cuit: proveedor.cuit ?? '', razonSocial: proveedor.razonSocial ?? '' }
      : EMPTY
    );
    setError('');
  }, [open, proveedor]);

  const set = (k: keyof CreateProveedorDto, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true);
    try {
      await onSave({
        nombre: form.nombre.trim(),
        telefono: form.telefono?.trim() || undefined,
        email: form.email?.trim() || undefined,
        cuit: form.cuit?.trim() || undefined,
        razonSocial: form.razonSocial?.trim() || undefined,
      });
    } catch (e: any) {
      setError(e?.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const isEditing = !!proveedor;

  return (
    <Modal open={open} onClose={onCancel} containerClass="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
      <ModalHeader>{isEditing ? 'Editar proveedor' : 'Nuevo proveedor'}</ModalHeader>
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="p-6 flex-1 overflow-auto min-h-0 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9D977B]" placeholder="Nombre del proveedor" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
            <input value={form.razonSocial} onChange={e => set('razonSocial', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9D977B]" placeholder="Razón social (opcional)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CUIT</label>
            <input value={form.cuit} onChange={e => set('cuit', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9D977B]" placeholder="20-12345678-9" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
            <input value={form.telefono} onChange={e => set('telefono', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9D977B]" placeholder="+54 9 351 000-0000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9D977B]" placeholder="contacto@proveedor.com" />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">{error}</p>}
        </div>
        <div className="flex gap-3 px-6 py-4 flex-none border-t border-gray-100">
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#5d5448] rounded-lg hover:bg-[#4a433e] disabled:opacity-50 transition-colors">
            {saving ? 'Guardando…' : isEditing ? 'Guardar' : 'Crear proveedor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

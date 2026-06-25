import { useCallback, useEffect, useState } from 'react';
import PageShell from '../../../components/PageShell';
import { ProveedorService } from '../services/proveedor.service';
import type { Proveedor, CreateProveedorDto } from '../types/proveedor.types';
import ProveedorFormModal from '../components/ProveedorFormModal';
import Modal from '../../../components/ui/modales/Modal';
import ModalHeader from '../../../components/ui/modales/ModalHeader';
import { useGlobalSnack } from '../../../components/ui/overlay/GlobalSnackContext';

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Proveedor | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { show } = useGlobalSnack();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProveedores(await ProveedorService.list());
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando proveedores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleSave = async (dto: CreateProveedorDto) => {
    if (selected) {
      await ProveedorService.update(selected.id, dto);
      show({ message: 'Proveedor actualizado', type: 'success' });
    } else {
      await ProveedorService.create(dto);
      show({ message: 'Proveedor creado', type: 'success' });
    }
    setFormOpen(false);
    setSelected(null);
    void load();
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await ProveedorService.remove(selected.id);
      show({ message: 'Proveedor eliminado', type: 'success' });
      setDeleteOpen(false);
      setSelected(null);
      void load();
    } catch (e: any) {
      show({ message: e?.message ?? 'Error al eliminar', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageShell
      title="Proveedores"
      subtitle="Gestión de proveedores de insumos"
      onCreate={() => { setSelected(null); setFormOpen(true); }}
      createLabel="Nuevo proveedor"
      loading={loading}
      error={error}
      onDismissError={() => setError(null)}
      modals={(
        <>
          <ProveedorFormModal
            open={formOpen}
            proveedor={selected}
            onSave={handleSave}
            onCancel={() => { setFormOpen(false); setSelected(null); }}
          />
          <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} containerClass="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 flex flex-col">
            <ModalHeader>Eliminar proveedor</ModalHeader>
            <div className="p-6 space-y-3">
              <p className="text-sm text-gray-700">¿Confirma que desea eliminar <strong>{selected?.nombre}</strong>?</p>
              <p className="text-xs text-gray-500">Solo se puede eliminar si no tiene precios activos en insumos.</p>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setDeleteOpen(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                {deleting ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </Modal>
        </>
      )}
    >
      {proveedores.length === 0 && !loading ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-1">No hay proveedores registrados</p>
          <p className="text-sm">Agregá el primero con el botón "Nuevo proveedor"</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Razón Social</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">CUIT</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Contacto</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {proveedores.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.razonSocial ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{p.cuit ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    <div>{p.telefono ?? ''}</div>
                    <div className="text-xs text-gray-400">{p.email ?? ''}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setSelected(p); setFormOpen(true); }}
                        className="px-3 py-1 text-xs font-medium text-[#5d5448] border border-[#5d5448]/30 rounded-md hover:bg-[#5d5448]/5 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => { setSelected(p); setDeleteOpen(true); }}
                        className="px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}

import { useEffect, useState } from 'react';
import { useToast } from '../../../components/ui/toast/ToastContext';
import type { Insumo, CreateInsumoDto } from '../types/insumo.types';
import { InsumoService } from '../services/insumo.service';

export function useInsumos() {
  const { show } = useToast();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modales
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { loadInsumos(); }, []);

  const loadInsumos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await InsumoService.getAllInsumos();
      setInsumos(data);
    } catch (err) {
      setError('Error al cargar los insumos. Por favor, intente nuevamente.');
      console.error('Error loading insumos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditFromTable = (insumo: Insumo) => { setSelectedInsumo(insumo); setFormModalOpen(true); };
  const handleDeleteFromTable = (insumo: Insumo) => { setSelectedInsumo(insumo); setDeleteModalOpen(true); };
  const handleCreateNew = () => { setSelectedInsumo(null); setFormModalOpen(true); };

  const handleFormSave = async (insumoData: CreateInsumoDto) => {
    try {
      setFormLoading(true);
      if (selectedInsumo) await InsumoService.updateInsumo(selectedInsumo.id, insumoData);
      else await InsumoService.createInsumo(insumoData);
      // show success toast
      if (selectedInsumo) show({ message: 'Insumo actualizado correctamente', type: 'success' });
      else show({ message: 'Insumo creado correctamente', type: 'success' });
      setFormModalOpen(false); setSelectedInsumo(null); await loadInsumos();
    } catch (err) {
      setError(`Error al ${selectedInsumo ? 'actualizar' : 'crear'} el insumo. Por favor, intente nuevamente.`);
      console.error('Error saving insumo:', err);
    } finally { setFormLoading(false); }
  };

  const handleDeleteConfirm = async (insumo: Insumo) => {
    try {
      setFormLoading(true);
      await InsumoService.deleteInsumo(insumo.id);
      show({ message: 'Insumo eliminado correctamente', type: 'success' });
      setDeleteModalOpen(false); setSelectedInsumo(null); await loadInsumos();
    } catch (err) {
      setError('Error al eliminar el insumo. Por favor, intente nuevamente.');
      console.error('Error deleting insumo:', err);
    } finally { setFormLoading(false); }
  };

  const closeAllModals = () => { setFormModalOpen(false); setDeleteModalOpen(false); setSelectedInsumo(null); };
  const dismissError = () => setError(null);

  return {
    insumos, searchTerm, setSearchTerm, loading, error, formModalOpen, deleteModalOpen,
    selectedInsumo, formLoading,
    handleEditFromTable, handleDeleteFromTable, handleCreateNew,
    handleFormSave, handleDeleteConfirm, closeAllModals, dismissError,
  } as const;
}

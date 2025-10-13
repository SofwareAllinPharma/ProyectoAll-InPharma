import { } from 'react';
// types handled in the hook
import { useInsumos } from '../hooks/useInsumos';
import InsumosTable from '../components/InsumosTable';
import SearchBar from '../components/SearchBar';
import InsumoFormModal from '../components/form/InsumoFormModal';
import DeleteConfirmModal from '../components/form/DeleteConfirmModal';
import PageShell from '../../../components/PageShell';
import TipBox from '../../../components/ui/TipBox';

export default function InsumosPage() {
  const {
    insumos, searchTerm, setSearchTerm, loading, error, formModalOpen, deleteModalOpen,
    selectedInsumo, formLoading,
    handleEditFromTable, handleDeleteFromTable, handleCreateNew,
    handleFormSave, handleDeleteConfirm, closeAllModals, dismissError,
  } = useInsumos();

  return (
    <PageShell
      title="Insumos"
      subtitle="Gestiona el inventario de insumos de la fábrica"
      onCreate={handleCreateNew}
      createLabel="Agregar Insumo"
      loading={loading}
      error={error}
      onDismissError={dismissError}
      noContainer={true}
      searchNode={(
        <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} placeholder="Buscar por nombre del insumo..." />
      )}
      helpTip={(
        <div className="-mt-4">
          <TipBox mt="mt-4">
            <><strong>Tip:</strong> Usa el botón de tres puntos en cada fila para ver las opciones de editar o eliminar</>
          </TipBox>
        </div>
      )}
      modals={(
        <>
          <InsumoFormModal
            open={formModalOpen}
            insumo={selectedInsumo}
            onSave={handleFormSave}
            onCancel={closeAllModals}
            loading={formLoading}
          />

          <DeleteConfirmModal
            open={deleteModalOpen}
            insumo={selectedInsumo}
            onConfirm={handleDeleteConfirm}
            onCancel={closeAllModals}
            loading={formLoading}
          />
        </>
      )}
    >
      <InsumosTable
        insumos={insumos}
        onEdit={handleEditFromTable}
        onDelete={handleDeleteFromTable}
        searchTerm={searchTerm}
      />
    </PageShell>
  );
}
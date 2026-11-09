import { useState } from 'react';
import PageShell from '../../../components/PageShell';
import RegisterForm from '../components/RegisterForm';
import EditUserForm from '../components/EditUserForm';
import UserList from '../components/UserList';
import Button from '../../../components/ui/Button';
import SearchBar from '../../../components/ui/SearchBar';
import DeleteUserConfirmModal from '../components/DeleteUserConfirmModal';
import ReactivateUserConfirmModal from '../components/ReactivateUserConfirmModal';
import { registerService } from '../services/register.service';
import { ROLE_LABEL } from '../../../constants/roles';
import type { User } from '../services/register.service';

export default function RegisterPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [view, setView] = useState<'list' | 'form' | 'edit'>('list');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setView('edit');
  };

  // delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    setUserToDelete(null);
    setDeleteOpen(false);
    setDeleteLoading(false);
  };

  const handleConfirmDelete = async (user: User) => {
    try {
      setDeleteLoading(true);
      await registerService.deactivateUser(user.mail);
      // refresh list
      setRefreshKey(k => k + 1);
      closeDelete();
    } catch (e) {
      console.error(e);
      setDeleteLoading(false);
    }
  };

  // reactivate modal state
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [userToReactivate, setUserToReactivate] = useState<User | null>(null);
  const [reactivateLoading, setReactivateLoading] = useState(false);

  const openReactivate = (user: User) => {
    setUserToReactivate(user);
    setReactivateOpen(true);
  };

  const closeReactivate = () => {
    setUserToReactivate(null);
    setReactivateOpen(false);
    setReactivateLoading(false);
  };

  const handleConfirmReactivate = async (user: User) => {
    try {
      setReactivateLoading(true);
      await registerService.activateUser(user.mail);
      setRefreshKey(k => k + 1);
      closeReactivate();
    } catch (e) {
      console.error(e);
      setReactivateLoading(false);
    }
  };

  return (
    <PageShell
      title="Gestión de Usuarios"
      subtitle="Gestiona cuentas, roles y datos de los usuarios del sistema"
      noContainer={true}
      onCreate={view === 'list' ? () => setView('form') : undefined}
      createLabel="Registrar Usuario"
      extraActions={view !== 'list' ? (
        <Button variant="outline" onClick={() => { setView('list'); setEditingUser(null); }}>
          Volver
        </Button>
      ) : undefined}
      searchNode={view === 'list' ? (
        <SearchBar
          placeholder="Buscar por nombre, apellido o email..."
          onSearch={setSearchTerm}
          debounceMs={300}
          rightNode={(
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5d5448] text-sm bg-white"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Todos los roles</option>
                {Object.keys(ROLE_LABEL).map((key) => (
                  <option key={key} value={key}>
                    {ROLE_LABEL[key]}
                  </option>
                ))}
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5d5448] text-sm bg-white"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          )}
        />
      ) : undefined}
    >
      <div className="space-y-8">
        {view === 'list' && (
          <>
              <UserList key={refreshKey} onEdit={handleEdit} onDelete={openDelete} onActivate={openReactivate} searchTerm={searchTerm} selectedRole={selectedRole} selectedStatus={selectedStatus} />
          </>
        )}

        {view === 'form' && (
          <RegisterForm 
            onSuccess={() => {
              setRefreshKey(k => k + 1);
              setView('list');
            }}
            onCancel={() => setView('list')}
          />
        )}

        {view === 'edit' && editingUser && (
          <EditUserForm 
            user={editingUser}
            onSuccess={() => {
              setRefreshKey(k => k + 1);
              setView('list');
              setEditingUser(null);
            }}
            onCancel={() => {
              setView('list');
              setEditingUser(null);
            }}
          />
        )}
      </div>
        <DeleteUserConfirmModal
          open={deleteOpen}
          user={userToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={closeDelete}
          loading={deleteLoading}
        />
        <ReactivateUserConfirmModal
          open={reactivateOpen}
          user={userToReactivate}
          onConfirm={handleConfirmReactivate}
          onCancel={closeReactivate}
          loading={reactivateLoading}
        />
    </PageShell>
  );
}

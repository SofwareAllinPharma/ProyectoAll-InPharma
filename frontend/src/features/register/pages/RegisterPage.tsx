import { useState } from 'react';
import PageShell from '../../../components/PageShell';
import RegisterForm from '../components/RegisterForm';
import EditUserForm from '../components/EditUserForm';
import UserList from '../components/UserList';
import Button from '../../../components/ui/Button';
import type { User } from '../services/register.service';

export default function RegisterPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [view, setView] = useState<'list' | 'form' | 'edit'>('list');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setView('edit');
  };

  return (
    <PageShell title="Gestión de Usuarios">
      <div className="max-w-6xl mx-auto space-y-8">
        {view === 'list' && (
          <>
            <div className="flex justify-end">
              <Button onClick={() => setView('form')}>
                Registrar Usuario
              </Button>
            </div>
            <UserList key={refreshKey} onEdit={handleEdit} />
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
    </PageShell>
  );
}

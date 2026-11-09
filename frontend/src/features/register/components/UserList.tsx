import { useEffect, useState, useMemo } from 'react';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import { registerService, type User } from '../services/register.service';
import { useToast } from '../../../components/ui/toast/ToastContext';
import LoadingPanel from '../../../components/LoadingPanel';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import ActionMenu from '../../../components/ui/ActionMenu';

type SortConfig = {
  key: 'nombre' | 'mail';
  direction: 'asc' | 'desc';
} | null;

interface Props {
  onEdit: (user: User) => void;
  onDelete?: (user: User) => void;
  onActivate?: (user: User) => void;
  searchTerm?: string;
  selectedRole?: string;
  selectedStatus?: string;
}

export default function UserList({ onEdit, onDelete, onActivate, searchTerm = '', selectedRole = '', selectedStatus = '' }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const { show } = useToast();

  const fetchUsers = () => {
    setLoading(true);
    registerService.getUsers()
      .then(setUsers)
      .catch(err => {
        console.error(err);
        show({ type: 'error', title: 'Error', message: 'No se pudieron cargar los usuarios' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSort = (key: 'nombre' | 'mail') => {
    setSortConfig(current => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(u =>
        (u.nombre || '').toLowerCase().includes(lower) ||
        (u.apellido || '').toLowerCase().includes(lower) ||
        (u.mail || '').toLowerCase().includes(lower)
      );
    }

    if (selectedRole) {
      result = result.filter(u => u.roles.some(r => r.toUpperCase() === selectedRole.toUpperCase()));
    }

    if (selectedStatus === 'active') {
      result = result.filter(u => u.activo !== false);
    } else if (selectedStatus === 'inactive') {
      result = result.filter(u => u.activo === false);
    }

    // Always place active users first. Then apply the configured sort (if any).
    result.sort((a, b) => {
      const aActive = a.activo !== false; // treat undefined as active
      const bActive = b.activo !== false;

      if (aActive !== bActive) return aActive ? -1 : 1;

      if (!sortConfig) return 0;

      let valA = '';
      let valB = '';

      if (sortConfig.key === 'nombre') {
        valA = `${a.nombre || ''} ${a.apellido || ''}`.trim().toLowerCase();
        valB = `${b.nombre || ''} ${b.apellido || ''}`.trim().toLowerCase();
      } else {
        valA = (a.mail || '').toLowerCase();
        valB = (b.mail || '').toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, searchTerm, selectedRole, selectedStatus, sortConfig]);

  const renderSortableHeader = (label: string, key: 'nombre' | 'mail') => (
    <div
      className="flex items-center gap-2 cursor-pointer hover:text-gray-200 select-none"
      onClick={() => handleSort(key)}
    >
      {label}
      {sortConfig?.key === key ? (
        sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
      ) : (
        <FaSort className="opacity-50" />
      )}
    </div>
  );

  const columns: Column<User>[] = [
    {
      key: 'nombre',
      title: renderSortableHeader('Nombre', 'nombre'),
      width: '14%',
      render: (user) => `${user.nombre || ''} ${user.apellido || ''}`.trim() || '-'
    },
    {
      key: 'dni',
      title: 'DNI',
      width: '10%',
      render: (user) => user.dni || '-'
    },
    {
      key: 'mail',
      title: renderSortableHeader('Email', 'mail'),
      width: '21%',
      render: (user) => user.mail
    },
    {
      key: 'telefono',
      title: 'Teléfono',
      width: '15%',
      render: (user) => user.telefono || '-'
    },
    {
      key: 'roles',
      title: 'Roles',
      width: '21%',
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map(role => (
            <span key={role} className="px-2 py-1 text-xs bg-[#5d5448] text-white rounded-full">
              {role}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'activo',
      title: 'Activo',
      width: '10%',
      align: 'center',
      render: (user) => {
        const isActive = user.activo !== false; // default true if undefined
        return (
          <span
            className={`inline-flex items-center justify-center px-2 py-1 text-sm font-medium rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            aria-label={`activo-${user.mail}`}
          >
            {isActive ? 'Sí' : 'No'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      title: 'Acciones',
      align: 'center',
      width: '10%',
      render: (user) => {
        const EditIcon = (<svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>);
        const DeactivateIcon = (<svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>);

        const isActive = user.activo !== false;
        const isAdminSis = user.roles.some(r => r.toUpperCase() === 'ADMINSIS');
        const ReactivateIcon = (<svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M5 13a7 7 0 1014 0 7 7 0 00-14 0z"/></svg>);

        const items: any[] = [];

        if (isActive) {
          items.push({ key: 'edit', label: 'Editar', icon: EditIcon, onClick: () => onEdit(user) });
          // No permitir dar de baja a administradores del sistema
          if (!isAdminSis) {
            items.push({ key: 'delete', label: 'Dar de baja', icon: DeactivateIcon, onClick: () => onDelete && onDelete(user) });
          }
        } else {
          items.push({ key: 'reactivate', label: 'Reactivar', icon: ReactivateIcon, onClick: () => onActivate && onActivate(user) });
        }

        return <ActionMenu items={items} ariaLabel={`acciones-usuario-${user.mail}`} menuWidth={180} />;
      }
    }
  ];

  if (loading) return <LoadingPanel />;

  return (
    <div className="mt-4">
      <DataTable
        columns={columns}
        data={filteredAndSortedUsers}
        rowKey={(user) => user.mail}
        pagination
        defaultPageSize={10}
        emptyState={<div className="p-4 text-center text-gray-500">No se encontraron usuarios</div>}
      />
    </div>
  );
}

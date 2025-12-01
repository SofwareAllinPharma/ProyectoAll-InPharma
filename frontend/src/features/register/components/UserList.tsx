import { useEffect, useState, useMemo } from 'react';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import { registerService, type User } from '../services/register.service';
import { useToast } from '../../../components/ui/toast/ToastContext';
import LoadingPanel from '../../../components/LoadingPanel';
import SearchBar from '../../../components/ui/SearchBar';
import { FaSort, FaSortUp, FaSortDown, FaEdit } from 'react-icons/fa';
import IconButton from '../../../components/ui/IconButton';

type SortConfig = {
  key: 'nombre' | 'mail';
  direction: 'asc' | 'desc';
} | null;

interface Props {
  onEdit: (user: User) => void;
}

export default function UserList({ onEdit }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

    // Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(u => 
        (u.nombre?.toLowerCase() || '').includes(lower) ||
        (u.apellido?.toLowerCase() || '').includes(lower) ||
        (u.mail?.toLowerCase() || '').includes(lower)
      );
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
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
    }

    return result;
  }, [users, searchTerm, sortConfig]);

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
      render: (user) => `${user.nombre || ''} ${user.apellido || ''}`.trim() || '-'
    },
    {
      key: 'dni',
      title: 'DNI',
      render: (user) => user.dni || '-'
    },
    {
      key: 'mail',
      title: renderSortableHeader('Email', 'mail'),
      render: (user) => user.mail
    },
    {
      key: 'telefono',
      title: 'Teléfono',
      render: (user) => user.telefono || '-'
    },
    {
      key: 'roles',
      title: 'Roles',
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
      key: 'actions',
      title: 'Acciones',
      align: 'center',
      render: (user) => (
        <IconButton 
          onClick={() => onEdit(user)} 
          aria-label="Editar usuario"
          className="text-blue-600 hover:text-blue-800"
        >
          <FaEdit />
        </IconButton>
      )
    }
  ];

  if (loading) return <LoadingPanel />;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#5d5448]">Usuarios Registrados</h2>
      </div>
      
      <div className="mb-4 max-w-md">
        <SearchBar 
          placeholder="Buscar por nombre, apellido o email..." 
          onSearch={setSearchTerm} 
          debounceMs={300}
        />
      </div>

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

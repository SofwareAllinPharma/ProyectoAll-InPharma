import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';

interface Props {
  creatorMail: string;
  creationDate: string;
}

const formatUserNameFromEmail = (email?: string | null) => {
  if (!email) return '-';
  const special: Record<string, string> = {
    'tecnico@aip.com': 'Técnico',
    'adminfab@aip.com': 'Admin Fábrica',
    'adminsis@aip.com': 'Admin Sistema',
  };
  if (special[email]) return special[email];
  const name = email.split('@')[0].replace(/[._-]/g, ' ');
  return name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
};

const CreatorInfo: React.FC<Props> = ({ creatorMail, creationDate }) => {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!creatorMail) {
        setDisplayName('-');
        return;
      }
      try {
        const { data } = await api.get('/personas');
        const found = Array.isArray(data) ? data.find((p: any) => p.mail === creatorMail) : null;
        if (mounted) {
          if (found && (found.nombre || found.apellido)) {
            setDisplayName(`${(found.nombre || '').trim()} ${(found.apellido || '').trim()}`.trim());
          } else {
            setDisplayName(formatUserNameFromEmail(creatorMail));
          }
        }
      } catch (e) {
        if (mounted) setDisplayName(formatUserNameFromEmail(creatorMail));
      }
    };
    void load();
    return () => { mounted = false; };
  }, [creatorMail]);

  return (
    <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Creado por</label>
          <div className="text-sm text-gray-900 flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {displayName ?? '-'}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
          <div className="text-sm text-gray-900 flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {creationDate}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorInfo;
import React from 'react';

interface Props {
  creatorMail: string;
  creationDate: string;
}

const formatUserName = (email?: string | null) => {
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
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Creado por</label>
        <div className="mt-1 text-sm text-gray-700">{formatUserName(creatorMail)}</div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha</label>
        <div className="mt-1 text-sm text-gray-700">{creationDate}</div>
      </div>
    </div>
  );
};

export default CreatorInfo;

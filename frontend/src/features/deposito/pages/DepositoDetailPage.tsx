import React from 'react';
import { useParams } from 'react-router-dom';

const DepositoDetailPage: React.FC = () => {
  const { id } = useParams();
  return (
    <div>
      <h1 className="text-2xl font-bold">Depósito {id}</h1>
      <p className="text-sm text-gray-600">Detalle del depósito (placeholder).</p>
    </div>
  );
};

export default DepositoDetailPage;

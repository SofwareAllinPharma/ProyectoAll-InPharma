import { CheckCircle as CheckCircleIcon, AlertTriangle as AlertTriangleIcon, XCircle as XCircleIcon } from 'lucide-react';

type EstadoInv = 'CRITICO' | 'BAJO' | 'NORMAL' | 'DEFAULT';

export function EstadoBadge({ estado }: { estado: EstadoInv }) {
  switch (estado) {
    case 'NORMAL':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon size={12} className="mr-1" />
          Normal
        </span>
      );
    case 'BAJO':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangleIcon size={12} className="mr-1" />
          Bajo
        </span>
      );
    case 'CRITICO':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon size={12} className="mr-1" />
          Crítico
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <AlertTriangleIcon size={12} className="mr-1" />
          Sin umbral
        </span>
      );
  }
}

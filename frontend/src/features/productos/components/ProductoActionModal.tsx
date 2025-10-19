import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Producto } from '../types/producto.types';

interface Props {
  isOpen: boolean;
  producto: Producto | null;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const ProductoActionModal: React.FC<Props> = ({
  isOpen,
  producto,
  onEdit,
  onDelete,
  onClose,
}) => {
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !producto) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/30 z-[10000] flex items-center justify-center p-4"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {producto.nombreComercial}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fórmula: {producto.formula?.nombre || 'No disponible'}
              </p>
              <p className="text-sm text-gray-500">
                Peso: {producto.pesoNeto.toFixed(2)}g | Porciones: {producto.cantPorcionesAportadas.toFixed(2)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3">
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-3 text-[#7c6a55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div>
              <div className="font-medium">Editar Producto</div>
              <div className="text-sm text-gray-500">Modificar información del producto</div>
            </div>
          </button>

          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <div>
              <div className="font-medium text-red-600">Eliminar Producto</div>
              <div className="text-sm text-gray-500">Dar de baja el producto (baja lógica)</div>
            </div>
          </button>
        </div>

        {/* Info adicional */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600">
              <p><strong>Estado:</strong> {producto.estaActivo ? 'Activo' : 'Inactivo'}</p>
              {producto.formula && (
                <p><strong>Peso por porción:</strong> {producto.formula.porcion || producto.formula.porcionMinima || 0}g</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
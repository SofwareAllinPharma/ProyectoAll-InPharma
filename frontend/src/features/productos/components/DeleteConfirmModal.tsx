import React from 'react';
import { createPortal } from 'react-dom';
import type { Producto } from '../types/producto.types';

interface Props {
  isOpen: boolean;
  producto: Producto | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<Props> = ({
  isOpen,
  producto,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen || !producto) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/30 z-[10000] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Confirmar Eliminación
              </h2>
              <p className="text-sm text-gray-500">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            ¿Estás seguro de que deseas eliminar el producto{' '}
            <strong className="text-gray-900">"{producto.nombreComercial}"</strong>?
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <svg className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="text-amber-800 font-medium mb-1">Información importante:</p>
                <ul className="text-amber-700 space-y-1">
                  <li>• El producto será marcado como inactivo (baja lógica)</li>
                  <li>• No aparecerá en las búsquedas por defecto</li>
                  <li>• Se conservará el historial para auditoría</li>
                  <li>• La acción se puede revertir desde la administración</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Detalles del producto */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Nombre:</strong> {producto.nombreComercial}</p>
              <p><strong>Fórmula:</strong> {producto.formula?.nombre || 'No disponible'}</p>
              <p><strong>Peso neto:</strong> {producto.pesoNeto.toFixed(2)}g</p>
              <p><strong>Porciones:</strong> {producto.cantPorcionesAportadas.toFixed(2)}</p>
              <p><strong>Estado actual:</strong> {producto.estaActivo ? 'Activo' : 'Inactivo'}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col space-y-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Eliminando...' : 'Sí, Eliminar Producto'}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md 
                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
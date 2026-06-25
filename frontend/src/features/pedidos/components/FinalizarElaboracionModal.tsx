import { useState, useEffect } from 'react';

interface FinalizarElaboracionModalProps {
  isOpen: boolean;
  cantEstimadaPaquetes: number;
  onConfirm: (cantidadRealPaquetes: number) => void;
  onCancel: () => void;
}

export default function FinalizarElaboracionModal({
  isOpen,
  cantEstimadaPaquetes,
  onConfirm,
  onCancel,
}: FinalizarElaboracionModalProps) {
  const [valor, setValor] = useState<string>(String(cantEstimadaPaquetes));
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setValor(String(cantEstimadaPaquetes));
      setError('');
    }
  }, [isOpen, cantEstimadaPaquetes]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const num = Math.round(Number(valor));
    if (!valor.trim() || isNaN(num) || num <= 0) {
      setError('Ingrese una cantidad válida mayor a 0.');
      return;
    }
    onConfirm(num);
  };

  const diferencia = Number(valor) - cantEstimadaPaquetes;
  const hayDiferencia = !isNaN(diferencia) && diferencia !== 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Finalizar elaboración</h2>
        <p className="text-sm text-gray-500 mb-5">
          Confirme la cantidad real de paquetes elaborados. Esta es la cantidad que se
          registrará en el stock del depósito Fábrica.
        </p>

        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
          <span className="text-gray-500">Cantidad estimada: </span>
          <span className="font-semibold text-gray-800">{cantEstimadaPaquetes} paquetes</span>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cantidad real elaborada (paquetes)
        </label>
        <input
          type="number"
          min="1"
          step="1"
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setError('');
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9D977B] focus:border-transparent"
          autoFocus
        />

        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}

        {hayDiferencia && !error && Number(valor) > 0 && (
          <p className={`mt-1 text-xs ${diferencia > 0 ? 'text-green-600' : 'text-amber-600'}`}>
            {diferencia > 0 ? '+' : ''}{diferencia.toFixed(2)} paquetes respecto a lo estimado
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#5d5448] rounded-lg hover:bg-[#4a433e] transition-colors"
          >
            Confirmar y finalizar
          </button>
        </div>
      </div>
    </div>
  );
}

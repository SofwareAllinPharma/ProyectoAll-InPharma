import React from 'react';
import type { Producto } from "../../../productos/types/producto.types";

interface Props {
  mode: 'gramos' | 'paquetes' | 'porciones';
  value: number | string;
  setValue: (v: number | string) => void;
  selected?: Producto | null;
  disabled?: boolean;
  className?: string;
}

const QuantityControl: React.FC<Props> = ({ mode, value, setValue, selected, disabled = false, className }) => {
  const pesoPaquete = Number(selected?.pesoNeto) || 0;
  const porcionVal = Number(selected?.formula?.porcion ?? 0) || 0;
  const porcionesPorPaquete = porcionVal > 0 ? Math.round(pesoPaquete / porcionVal) : 0;

  const getStep = () => {
    if (mode === 'paquetes') return 1;
    if (mode === 'porciones') return porcionesPorPaquete > 0 ? porcionesPorPaquete : 1;
    if (mode === 'gramos') return pesoPaquete > 0 ? pesoPaquete : 1;
    return 1;
  };

  const handleIncrement = () => {
    const step = getStep();
    let n = (typeof value === 'number') ? value : Number(value || 0);
    n = Number((n + step));
    setValue(mode === 'paquetes' || mode === 'porciones' ? Math.round(n) : Number(Number(n).toFixed(4)));
  };

  const handleDecrement = () => {
    const step = getStep();
    let n = (typeof value === 'number') ? value : Number(value || 0);
    n = Number(Math.max(0, n - step));
    setValue(mode === 'paquetes' || mode === 'porciones' ? Math.round(n) : Number(Number(n).toFixed(4)));
  };

  const displayValue = typeof value === 'number'
    ? (mode === 'paquetes' || mode === 'porciones' ? String(Math.round(value)) : String(Number(value.toFixed(4))))
    : String(value);

  return (
    <div className={className}>
      <div className="mt-2 flex items-center">
        <input
          className="flex-1 px-4 py-3 border rounded-md text-lg text-center"
          type="text"
          inputMode="numeric"
          readOnly
          value={displayValue}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              handleIncrement();
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              handleDecrement();
            } else if (e.key === '+' || e.key === '=') {
              e.preventDefault(); handleIncrement();
            } else if (e.key === '-' || e.key === '_') {
              e.preventDefault(); handleDecrement();
            }
          }}
        />
        <div className="ml-2 flex flex-col space-y-1">
          <button type="button" onClick={handleIncrement} disabled={disabled} className={`px-2 py-1 rounded ${!disabled ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 opacity-50 cursor-not-allowed'}`}>▲</button>
          <button type="button" onClick={handleDecrement} disabled={disabled} className={`px-2 py-1 rounded ${!disabled ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 opacity-50 cursor-not-allowed'}`}>▼</button>
        </div>
      </div>
    </div>
  );
};

export default QuantityControl;
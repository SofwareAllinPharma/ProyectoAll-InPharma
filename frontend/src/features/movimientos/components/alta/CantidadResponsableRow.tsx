import NumberField from '../../../../components/form/NumberField';

type Props = {
  stock: number;
  cantidad: number | '';
  onCantidadChange: (v: number | '') => void;
  responsable: string;
  onResponsableChange: (s: string) => void;
  errorCantidad?: string | null;
  errorResponsable?: string | null;
  onBlurCantidad?: () => void;
  onBlurResponsable?: () => void;
};

export default function CantidadResponsableRow({ stock, cantidad, onCantidadChange, responsable, onResponsableChange, errorCantidad, errorResponsable, onBlurCantidad, onBlurResponsable }: Props) {
  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-1">
      <div className="flex items-center whitespace-nowrap">
        <span className="text-sm font-medium text-gray-700 mr-2">Stock actual:</span>
        <span className="text-sm text-gray-700 mr-14">{stock ?? 0}</span>
      </div>

      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-700 mr-3">Cantidad</span>
        <div className="w-20 mr-10 flex flex-col">
          <NumberField
            value={cantidad}
            onChange={(v) => onCantidadChange(v)}
            onBlur={() => onBlurCantidad?.()}
            placeholder="0"
            step={1}
          />
          {errorCantidad ? <p className="text-red-600 text-sm mt-1">{errorCantidad}</p> : null}
        </div>
      </div>

      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-700 mr-3">Responsable</span>
        <div className="flex flex-col">
          <input
            type="text"
            value={responsable}
            onChange={(e) => onResponsableChange(e.target.value)}
            onBlur={() => onBlurResponsable?.()}
            placeholder="Nombre del responsable"
            className="w-45 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] text-sm"
          />
          {errorResponsable ? <p className="text-red-600 text-sm mt-1">{errorResponsable}</p> : null}
        </div>
      </div>
    </div>
  );
}

interface Props {
  onAdd: () => void;
  disabled?: boolean;
}

export default function FormulaInsumoHeader({ onAdd, disabled = false }: Props) {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
        Insumos de la Fórmula
      </h3>

      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="text-sm bg-[#7c6a55] text-white px-3 py-1 rounded-md hover:bg-[#6b5847] disabled:opacity-50 disabled:cursor-not-allowed font-roboto transition-colors"
      >
        + Agregar Insumo
      </button>
    </div>
  );
}
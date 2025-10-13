export default function InsumosHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Insumos</h1>
        <p className="text-sm text-gray-600 mt-1">Gestiona el inventario de insumos de la fábrica</p>
      </div>
      <button
        onClick={onCreate}
        className="px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 focus:ring-2 focus:ring-[#5d5448]/50 focus:outline-none transition-all duration-200 flex items-center gap-2"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Agregar Insumo
      </button>
    </div>
  );
}

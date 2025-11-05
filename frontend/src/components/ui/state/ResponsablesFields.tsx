type Props = {
  requireEntregaRecepcion: boolean;
  responsable: string;
  setResponsable: (v: string) => void;
  responsableEntrega: string;
  setResponsableEntrega: (v: string) => void;
  responsableRecepcion: string;
  setResponsableRecepcion: (v: string) => void;
};

export default function ResponsablesFields({
  requireEntregaRecepcion,
  responsable,
  setResponsable,
  responsableEntrega,
  setResponsableEntrega,
  responsableRecepcion,
  setResponsableRecepcion,
}: Props) {
  if (requireEntregaRecepcion) {
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsable de Entrega (requerido)</label>
          <input
            value={responsableEntrega}
            onChange={(e) => setResponsableEntrega(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55]"
            placeholder="Nombre de quien entrega"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsable de Recepción (requerido)</label>
          <input
            value={responsableRecepcion}
            onChange={(e) => setResponsableRecepcion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55]"
            placeholder="Nombre de quien recibe"
          />
        </div>
      </>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Responsable (requerido)</label>
      <input
        value={responsable}
        onChange={(e) => setResponsable(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55]"
        placeholder="Nombre del responsable"
      />
    </div>
  );
}

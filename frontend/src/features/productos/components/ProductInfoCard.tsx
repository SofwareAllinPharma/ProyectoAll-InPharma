import type { Producto } from '../types/producto.types';

export default function ProductInfoCard({ producto, pesoPorPorcion }: { producto: Producto; pesoPorPorcion: number }) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 mt-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">Información del Producto</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium text-blue-800">Peso neto total:</span>
          <p className="text-blue-700">{producto.pesoNeto.toFixed(2)}g</p>
        </div>
        <div>
          <span className="font-medium text-blue-800">Porciones:</span>
          <p className="text-blue-700">{producto.cantPorcionesAportadas.toFixed(2)}</p>
        </div>
        <div>
          <span className="font-medium text-blue-800">Peso por porción:</span>
          <p className="text-blue-700">{pesoPorPorcion}g</p>
        </div>
      </div>
    </div>
  );
}

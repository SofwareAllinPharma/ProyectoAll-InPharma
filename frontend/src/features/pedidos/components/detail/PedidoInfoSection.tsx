import { formatUserName } from '../../utils/pedido.utils';

interface PedidoInfoSectionProps {
  productoNombre: string;
  formulaNombre?: string;
  formulaVersion?: number;
  cantidadPaquetes: number;
  pesoGramos: number | string;
  cantElaboradaPaquetes?: number | null;
  cantElaboradaGramos?: number | null;
  tecnicoEmail?: string | null;
  createdAt: string | Date;
  observacion?: string | null;
}

const formatQty = (v: number | string | undefined | null) => {
  if (v === undefined || v === null || v === '') return '-';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  if (Number.isInteger(n)) return String(n);
  return Number(n.toFixed(4)).toString();
};

export default function PedidoInfoSection({
  productoNombre,
  formulaNombre,
  formulaVersion,
  cantidadPaquetes,
  pesoGramos,
  cantElaboradaPaquetes,
  cantElaboradaGramos,
  tecnicoEmail,
  createdAt,
  observacion,
}: PedidoInfoSectionProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Información de la Orden</h3>
      <div className="space-y-6">
        {/* Producto */}
        <div className="flex items-start gap-3">
          <div className="text-gray-500 mt-1">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Producto</div>
            <div className="text-base font-medium text-gray-900 mt-1">
              {productoNombre}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Fecha de Creación</div>
            <div className="text-base text-gray-900 mt-1">
              {new Date(createdAt).toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>

        {/* Fórmula */}
        <div className="flex items-start gap-3">
          <div className="text-gray-500 mt-1">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Fórmula</div>
            <div className="text-base text-gray-900 mt-1">
              {formulaNombre || `${productoNombre} Pura`}
            </div>
            {formulaVersion && (
              <div className="text-xs text-gray-500 mt-1">
                Versión {formulaVersion}
              </div>
            )}
          </div>
        </div>

        {/* Cantidad */}
        <div className="flex items-start gap-3">
          <div className="text-gray-500 mt-1">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Cantidad</div>
            <div className="text-base font-medium text-gray-900 mt-1">
              {cantidadPaquetes} paquetes
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Técnico Asignado</div>
            <div className="text-base text-gray-900 mt-1 flex items-center justify-end gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {formatUserName(tecnicoEmail)}
            </div>
          </div>
        </div>

        {/* Cantidad real elaborada */}
        {cantElaboradaPaquetes != null && (
          <div className="flex items-start gap-3">
            <div className="text-gray-500 mt-1">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">Cantidad real elaborada</div>
              <div className="text-base font-medium text-gray-900 mt-1">
                {cantElaboradaPaquetes} paquetes
                {cantElaboradaGramos != null && <span className="text-sm text-gray-500 ml-2">({formatQty(cantElaboradaGramos)} g)</span>}
              </div>
              {(() => {
                const diff = cantElaboradaPaquetes - cantidadPaquetes;
                if (diff === 0) return null;
                return (
                  <div className={`text-xs mt-1 ${diff > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(2)} paquetes respecto a lo estimado
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Peso Total */}
        <div className="flex items-start gap-3">
          <div className="text-gray-500 mt-1">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Peso Total</div>
            <div className="text-base text-gray-900 mt-1">
              {formatQty(pesoGramos)} g
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="flex items-start gap-3">
          <div className="text-gray-500 mt-1">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Observaciones</div>
            <div className="text-base text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">
              {observacion?.trim() || 'Sin observaciones'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

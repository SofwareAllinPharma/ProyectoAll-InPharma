import ActionMenu from '../../../components/ui/ActionMenu';
import CapacityBar from './CapacityBar';

type Props = {
  dep: any;
  capacidadUsada: number;
  onEdit: () => void;
  onShowUmbrales: () => void;
  onShowDelete: () => void;
};

export default function DepositoDetailHeader({ dep, capacidadUsada, onEdit, onShowUmbrales, onShowDelete }: Props) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F3EFE6]">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#7C6A55]" fill="none" stroke="currentColor">
              <path d="M3 10.5L12 5l9 5.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8.5z" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 12h8M8 15h8M8 18h8" strokeWidth={1.7} strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <h3 className="text-xl font-semibold text-[#3E3529]">{dep.nombre}</h3>
            <p className="text-gray-600">{dep.direccion}</p>
          </div>
        </div>
        <div className="flex items-center">
          <ActionMenu
            menuWidth={220}
            items={[
              { key: 'edit', label: 'Modificar depósito', icon: <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>, onClick: onEdit },
              { key: 'umbrales', label: 'Configurar umbrales', icon: <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, onClick: onShowUmbrales },
              { key: 'delete', label: 'Eliminar depósito', icon: <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>, onClick: onShowDelete },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-6 flex flex-col justify-center min-h-[110px]">
          <p className="text-sm text-gray-500 mb-1">Capacidad Total</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#3E3529]">{capacidadUsada}</span>
            <span className="text-lg text-gray-700 font-normal">/ {dep.capacidadTotal}</span>
            <span className="text-sm text-gray-500 ml-1">unidades</span>
          </div>
          <div className="mt-2">
            <CapacityBar used={capacidadUsada} total={dep.capacidadTotal} showHeader={false} height={8} />
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 p-6 flex flex-col justify-center min-h-[110px]">
          <p className="text-sm text-gray-500 mb-1">Responsable</p>
          <div className="text-xl font-semibold text-[#3E3529]">{dep.responsable}</div>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import type { Deposito } from "../types/deposito.types";
import { default as DepositIcon } from "./depositIcon";
import CapacityBar from "./CapacityBar";

export default function DepositCard({
  d,
  onOpenDetail,
}: {
  d: Deposito;
  onOpenDetail?: (id: number) => void;
}) {
  const navigate = useNavigate();

  const goDetail = () => {
    if (onOpenDetail) return onOpenDetail(d.id);
    navigate(`/adminsis/depositos/${d.id}`);
  };

  const used = d.capacidadUsada;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#F3EFE6]">
            <DepositIcon className="h-5 w-5 text-[#7C6A55]" />
          </div>
          <div>
            <h3 className="text-[17px] font-semibold text-gray-800">{d.nombre}</h3>
            <p className="text-sm text-gray-500">{d.direccion}</p>
          </div>
        </div>

        <button
          onClick={goDetail}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Ver
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Capacidad:</span>
          <span className="font-semibold text-gray-800">
            {used} / {d.capacidadTotal}
          </span>
        </div>

        <CapacityBar
          used={used}
          total={d.capacidadTotal}
          showHeader={false}
          height={10}
          trackClassName="bg-gray-200"
          barClassName="bg-[#9D977B]"
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Responsable:</span>
          <span className="font-semibold text-gray-900">{d.responsable}</span>
        </div>
      </div>
    </div>
  );
}

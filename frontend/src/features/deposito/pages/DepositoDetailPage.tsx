import { useEffect, useState } from "react";
import {
  InventarioService,
  type InventarioProducto,
} from "../../inventario/services/inventario.service";
import InventarioTable from "../../inventario/components/InventarioTable";
import { useNavigate, useParams, Link } from "react-router-dom";
import type { Deposito } from "../types/deposito.types";
import { DepositoService } from "../services/deposito.service";
import DepositoFormModal from "../components/DepositoFormModal";
import type { DepositoFormValues } from "../components/DepositoFormModal";
import PageShell from "../../../components/PageShell";
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/modales/Modal';
import DepositoActionModal from "../components/DepositoActionModal";
import DepositIcon from "../components/DepositIcon";
import CapacityBar from "../components/CapacityBar";
import ResumenCard from "../../../components/Card";
import {
  FaBox,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaTruck,
  FaPlus,
} from "react-icons/fa";

type ResumenEstados = {
  total: number;
  normal: number;
  bajo: number;
  critico: number;
  default?: number;
};

export default function DepositoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dep, setDep] = useState<Deposito | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openActions, setOpenActions] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showTrasladoModal, setShowTrasladoModal] = useState(false);
  const [showPedidoModal, setShowPedidoModal] = useState(false);

  const [inventario, setInventario] = useState<InventarioProducto[]>([]);
  const [loadingInventario, setLoadingInventario] = useState(false);

  const [resumen, setResumen] = useState<ResumenEstados>({
    total: 0,
    normal: 0,
    bajo: 0,
    critico: 0,
  });
  const [loadingResumen, setLoadingResumen] = useState(false);

  // Traer inventario para la tabla
  useEffect(() => {
    if (!dep?.id) return;
    setLoadingInventario(true);
    InventarioService.getInventarioByDeposito(dep.id)
      .then((data) => setInventario(data))
      .catch(() => setInventario([]))
      .finally(() => setLoadingInventario(false));
  }, [dep?.id]);

  // Traer resumen de estados (para las cards)
  useEffect(() => {
    if (!dep?.id) return;
    setLoadingResumen(true);
    InventarioService.getResumenEstados(dep.id)
      .then((data) => setResumen(data))
      .catch(() => setResumen({ total: 0, normal: 0, bajo: 0, critico: 0 }))
      .finally(() => setLoadingResumen(false));
  }, [dep?.id]);

  // Traer datos del depósito
  useEffect(() => {
    const load = async () => {
      setError(null);
      const numId = Number(id);
      if (!id || Number.isNaN(numId)) {
        setError("ID inválido");
        setDep(null);
        return;
      }
      try {
        const data = await DepositoService.getById(numId);
        setDep(data);
      } catch (e: any) {
        setError(e?.message || "No se pudo obtener el depósito.");
        setDep(null);
      }
    };
    load();
  }, [id]);

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-red-600">{error}</p>
        <Link
          to="/adminsis/depositos"
          className="text-[#7C6A55] hover:underline text-sm"
        >
          ← Volver a todos los depósitos
        </Link>
      </div>
    );
  }

  if (!dep) {
    return (
      <div className="space-y-2">
        <p className="text-gray-700">Cargando depósito…</p>
        <Link
          to="/adminsis/depositos"
          className="text-[#7C6A55] hover:underline text-sm"
        >
          ← Volver a todos los depósitos
        </Link>
      </div>
    );
  }

  const handleUpdate = async (v: DepositoFormValues) => {
    try {
      // Backend solo permite { responsable, capacidadTotal }
      const updated = await DepositoService.update(dep.id, {
        responsable: v.responsable,
        capacidadTotal: Number(v.capacidadTotal),
      });
      setDep(updated);
      setSuccessMsg("El depósito fue modificado con éxito");
      setTimeout(() => setSuccessMsg(null), 6000);
      setOpenForm(false);
    } catch (e) {
      alert((e as any)?.message || "No se pudo actualizar el depósito.");
      setOpenForm(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await DepositoService.deactivate(dep.id); // baja lógica
      navigate("/adminsis/depositos", { replace: true });
    } catch (e) {
      alert((e as any)?.message || "No se pudo desactivar el depósito.");
    }
  };

  const totalProductos = resumen.total;
  // Calcular la suma de cantidadProducto de todos los productos del inventario
  const capacidadUsada = inventario.reduce(
    (acc, prod) =>
      acc +
      (typeof prod.cantidadProducto === "number" ? prod.cantidadProducto : 0),
    0
  );

  return (
    <div className="space-y-4">
      <PageShell
        title="Depósito"
        subtitle="Consulta y gestión del depósito seleccionado"
        noContainer={true}
        preTitle={<div><Link to="/adminsis/depositos" className="text-[#7C6A55] hover:underline text-sm">← Volver a todos los depósitos</Link></div>}
              searchNode={
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      {successMsg && (
                        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded transition-opacity duration-500 mt-2">
                          {successMsg}
                        </div>
                      )}
                    </div>
                    <div className="ml-4" />
                  </div>
                </>
              }
              extraActions={
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    title="Registrar Traslado"
                    icon={<FaTruck size={16} className="text-[#7C6A55]" />}
                    onClick={() => setShowTrasladoModal(true)}
                  >
                    Registrar Traslado
                  </Button>
                  <Button
                    variant="solid"
                    title="Registrar Pedido"
                    icon={<FaPlus size={16} />}
                    onClick={() => setShowPedidoModal(true)}
                  >
                    Registrar Pedido
                  </Button>
                </div>
              }
        modals={
          <>
            <DepositoActionModal
              open={openActions}
              deposito={dep}
              onEdit={() => {
                setOpenActions(false);
                setOpenForm(true);
              }}
              onDeactivate={() => {
                setOpenActions(false);
                handleDeactivate();
              }}
              onCancel={() => setOpenActions(false)}
              onUmbralesSuccess={() => {
                setOpenActions(false);
                setSuccessMsg(
                  "Los umbrales mínimos fueron guardados con éxito"
                );
                setTimeout(() => setSuccessMsg(null), 6000);
                // Refrescar cards y tabla después de guardar umbrales
                if (dep?.id) {
                  setLoadingInventario(true);
                  InventarioService.getInventarioByDeposito(dep.id)
                    .then((data) => setInventario(data))
                    .finally(() => setLoadingInventario(false));
                  setLoadingResumen(true);
                  InventarioService.getResumenEstados(dep.id)
                    .then((data) => setResumen(data))
                    .finally(() => setLoadingResumen(false));
                }
              }}
            />

            <DepositoFormModal
              open={openForm}
              deposito={dep}
              onCancel={() => setOpenForm(false)}
              onSave={handleUpdate}
              capacidadUsadaActual={dep.capacidadUsada ?? 0}
            />

            <Modal
              open={showTrasladoModal}
              onClose={() => setShowTrasladoModal(false)}
              containerClass="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-[#3E3529]">Funcionalidad no implementada</h3>
              <p className="text-sm text-gray-600 mt-2">La funcionalidad de "Registrar Traslado" aún no está implementada.</p>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowTrasladoModal(false)} className="px-4 py-2 rounded-md bg-[#5d5448] text-white">Cerrar</button>
              </div>
            </Modal>

            <Modal
              open={showPedidoModal}
              onClose={() => setShowPedidoModal(false)}
              containerClass="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-[#3E3529]">Funcionalidad no implementada</h3>
              <p className="text-sm text-gray-600 mt-2">La funcionalidad de "Registrar Pedido" aún no está implementada.</p>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowPedidoModal(false)} className="px-4 py-2 rounded-md bg-[#5d5448] text-white">Cerrar</button>
              </div>
            </Modal>
          </>
        }
      >
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F3EFE6]">
                <DepositIcon className="h-6 w-6 text-[#7C6A55]" />
              </span>
              <div>
                <h3 className="text-xl font-semibold text-[#3E3529]">
                  {dep.nombre}
                </h3>
                <p className="text-gray-600">{dep.direccion}</p>
              </div>
            </div>
            <button
              onClick={() => setOpenActions(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              title="Ver opciones"
            >
              <svg
                className="h-6 w-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>

          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-6 flex flex-col justify-center min-h-[110px]">
              <p className="text-sm text-gray-500 mb-1">Capacidad Total</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#3E3529]">
                  {capacidadUsada}
                </span>
                <span className="text-lg text-gray-700 font-normal">
                  / {dep.capacidadTotal}
                </span>
                <span className="text-sm text-gray-500 ml-1">unidades</span>
              </div>
              <div className="mt-2">
                <CapacityBar
                  used={capacidadUsada}
                  total={dep.capacidadTotal}
                  showHeader={false}
                  height={8}
                />
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 p-6 flex flex-col justify-center min-h-[110px]">
              <p className="text-sm text-gray-500 mb-1">Responsable</p>
              <div className="text-xl font-semibold text-[#3E3529]">
                {dep.responsable}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ResumenCard
            title="Total Productos"
            value={loadingResumen ? "—" : totalProductos}
            icon={<FaBox className="text-[#9D977B]" size={18} />}
            borderColor="#9D977B"
            bgIcon="#F5F3EB"
          />
          <ResumenCard
            title="Stock Normal"
            value={loadingResumen ? "—" : resumen.normal}
            icon={<FaCheckCircle className="text-green-600" size={18} />}
            borderColor="#22c55e"
            bgIcon="#DCFCE7"
          />
          <ResumenCard
            title="Stock Bajo"
            value={loadingResumen ? "—" : resumen.bajo}
            icon={
              <FaExclamationTriangle className="text-yellow-500" size={18} />
            }
            borderColor="#eab308"
            bgIcon="#FEF9C3"
          />
          <ResumenCard
            title="Stock Crítico"
            value={loadingResumen ? "—" : resumen.critico}
            icon={<FaTimesCircle className="text-red-500" size={18} />}
            borderColor="#ef4444"
            bgIcon="#FEE2E2"
          />
        </div>

        {/* Tabla de inventario del depósito */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <h4 className="text-lg font-semibold text-[#3E3529] mb-4">
            Inventario de productos
          </h4>
          <InventarioTable
            data={inventario}
            loading={loadingInventario}
            onCrearPedido={() => setShowPedidoModal(true)}
            onMovimientoStock={() => setShowTrasladoModal(true)}
          />
        </div>
      </PageShell>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../../components/PageShell";
import DepositGridWithCapacidad from "../components/DepositoGridWithCapacidad";
import { FaTruck, FaPlus } from "react-icons/fa";
import Button from "../../../components/ui/Button";
import type { Deposito } from "../types/deposito.types";
import { DepositoService } from "../services/deposito.service";
import DepositoFormModal from "../components/DepositoFormModal";
import type { DepositoFormValues } from "../components/DepositoFormModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import StockGlobalTable from "../../inventario/components/StockGlobalTable";
import Modal from "../../../components/ui/modales/Modal";
import { InventarioGlobalService } from "../../inventario/services/inventario.service";
import type { StockGlobalRow } from "../../inventario/services/inventario.service";
import InventarioCardsGlobal from "../../inventario/components/InventarioCardsGlobal";

export default function DepositosPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Deposito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Deposito | null>(null);

  const [stockGlobal, setStockGlobal] = useState<StockGlobalRow[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [showZeroModal, setShowZeroModal] = useState(false);
  const [showTrasladoModal, setShowTrasladoModal] = useState(false);
  const [showPedidoModal, setShowPedidoModal] = useState(false);

  const [resumenGlobal, setResumenGlobal] = useState({
    total: 0,
    normal: 0,
    bajo: 0,
    critico: 0,
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await DepositoService.getAll();
      setItems(data.filter((d) => d.estado !== false));
    } catch (e: any) {
      setError(e?.message || "Error al obtener depósitos");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStockGlobal = async () => {
    setLoadingGlobal(true);
    try {
      const data = await InventarioGlobalService.getStockGlobal();
      setStockGlobal(data);
    } catch (e: any) {
      setStockGlobal([]);
    } finally {
      setLoadingGlobal(false);
    }
  };

  const loadResumenGlobal = async () => {
    try {
      const data = await InventarioGlobalService.getResumenEstadosGlobal();
      setResumenGlobal({
        total: data.totalProductos ?? 0,
        normal: data.normal ?? 0,
        bajo: data.bajo ?? 0,
        critico: data.critico ?? 0,
      });
    } catch {
      setResumenGlobal({ total: 0, normal: 0, bajo: 0, critico: 0 });
    }
  };

  useEffect(() => {
    void load();
    void loadStockGlobal();
    void loadResumenGlobal();
  }, []);

  const handleCreate = async (values: DepositoFormValues) => {
    try {
      const created = await DepositoService.create({
        nombre: values.nombre,
        direccion: values.direccion,
        responsable: values.responsable,
        capacidadTotal: Number(values.capacidadTotal),
      });
      setItems((prev) => [...prev, created]);
      setSuccessMsg("El depósito fue creado con éxito");
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (e: any) {
      setError(e?.message || "Error al crear depósito");
    } finally {
      setOpenCreate(false);
    }
  };

  const handleDelete = async (deposito: Deposito) => {
    try {
      await DepositoService.deactivate(deposito.id);
      setItems((prev) => prev.filter((item) => item.id !== deposito.id));
      setDeleteSuccessMsg("El depósito fue eliminado correctamente");
      setTimeout(() => setDeleteSuccessMsg(null), 6000);
    } catch (e: any) {
      setError(e?.message || "Error al eliminar depósito");
    } finally {
      setDeleteTarget(null);
    }
  };

  const zeroStockItems = stockGlobal.filter((r) => r.stockTotal === 0);

  return (
    <div className="space-y-6">
      <PageShell
        title="Depósitos"
        subtitle="Gestión de depósitos y su inventario"
        loading={loading}
        noContainer={true}
        onCreate={() => setOpenCreate(true)}
        createLabel="Registrar Depósito"
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
        searchNode={
          <>
            {successMsg && (
              <div className="mb-4">
                <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded transition-opacity duration-500">
                  {successMsg}
                </div>
              </div>
            )}

            {deleteSuccessMsg && (
              <div className="mb-4">
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded transition-opacity duration-500">
                  {deleteSuccessMsg}
                </div>
              </div>
            )}
          </>
        }
        modals={
          <>
            <Modal
              open={showTrasladoModal}
              onClose={() => setShowTrasladoModal(false)}
              containerClass="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-[#3E3529]">
                Funcionalidad no implementada
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                La funcionalidad de "Registrar Traslado" aún no está
                implementada.
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTrasladoModal(false)}
                  className="px-4 py-2 rounded-md bg-[#5d5448] text-white"
                >
                  Cerrar
                </button>
              </div>
            </Modal>

            <Modal
              open={showPedidoModal}
              onClose={() => setShowPedidoModal(false)}
              containerClass="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-[#3E3529]">
                Funcionalidad no implementada
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                La funcionalidad de "Registrar Pedido" aún no está implementada.
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPedidoModal(false)}
                  className="px-4 py-2 rounded-md bg-[#5d5448] text-white"
                >
                  Cerrar
                </button>
              </div>
            </Modal>
            <Modal
              open={showZeroModal}
              onClose={() => setShowZeroModal(false)}
              containerClass="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 overflow-hidden"
            >
                <div className="bg-[#5d5448] px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">
                    Productos sin stock en ningún depósito
                  </h2>
                </div>
                <div className="px-6 py-4">
                  {zeroStockItems.length === 0 ? (
                    <p className="text-gray-600">No hay productos sin stock.</p>
                  ) : (
                    <ul className="space-y-2 max-h-96 overflow-auto">
                      {zeroStockItems.map((r) => (
                        <li
                          key={r.idProducto}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                        >
                          <span
                            className="text-sm font-medium text-[#3E3529] cursor-pointer"
                            onClick={() => {
                              setShowZeroModal(false);
                              navigate(`/adminsis/productos/${r.idProducto}`);
                            }}
                          >
                            {r.producto}
                          </span>
                          <span className="text-sm text-gray-600">
                            {r.stockTotal} u.
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setShowZeroModal(false)}
                      className="px-6 py-2 rounded-md border border-gray-300 bg-white text-gray-800 font-medium"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
            </Modal>

            <DepositoFormModal
              open={openCreate}
              onCancel={() => setOpenCreate(false)}
              onSave={handleCreate}
              existingNames={items.map((i) => i.nombre)}
            />

            <DeleteConfirmModal
              open={!!deleteTarget}
              deposito={deleteTarget}
              onConfirm={handleDelete}
              onCancel={() => setDeleteTarget(null)}
            />
          </>
        }
      >
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
            Cargando…
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <>
            <DepositGridWithCapacidad
              items={items}
              onOpenDetail={(id) => navigate(`/adminsis/depositos/${id}`)}
              onDelete={(deposito) => setDeleteTarget(deposito)}
            />

            <InventarioCardsGlobal
              resumen={resumenGlobal}
              loading={loadingGlobal}
            />

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#3E3529] mb-0">
                  Stock Global de Productos
                </h3>
                <div>
                  <button
                    onClick={() => setShowZeroModal(true)}
                    className="ml-4 px-3 py-2 rounded-md border border-[#7C6A55] text-[#7C6A55] hover:bg-[#7C6A55]/10 text-sm"
                  >
                    Mostrar productos sin stock
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <StockGlobalTable
                  data={stockGlobal}
                  loading={loadingGlobal}
                  onCrearPedido={(row) => {
                    // abrir modal de pedido (placeholder)
                    setShowPedidoModal(true);
                  }}
                  onMovimientoStock={(row) => {
                    // abrir modal de traslado (placeholder)
                    setShowTrasladoModal(true);
                  }}
                />
              </div>
            </div>
          </>
        )}
      </PageShell>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DepositHeader from "../components/DepositHeader";
import DepositGridWithCapacidad from "../components/DepositGridWithCapacidad";
import type { Deposito } from "../types/deposito.types";
import { DepositoService } from "../services/deposito.service";
import DepositoFormModal from "../components/DepositoFormModal";
import type { DepositoFormValues } from "../components/DepositoFormModal";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
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
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [showZeroModal, setShowZeroModal] = useState(false);

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
    setErrorGlobal(null);
    try {
      const data = await InventarioGlobalService.getStockGlobal();
      setStockGlobal(data);
    } catch (e: any) {
      setErrorGlobal(e?.message || "Error al obtener stock global");
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
    } catch (e) {
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

  return (
    <div className="space-y-6">
      <DepositHeader
        title="Depósitos"
        subtitle="Gestión de depósitos y su inventario"
        onCreate={() => setOpenCreate(true)}
      />

      {successMsg && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded transition-opacity duration-500">
          {successMsg}
        </div>
      )}
      {deleteSuccessMsg && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded transition-opacity duration-500">
          {deleteSuccessMsg}
        </div>
      )}

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
              <button
                onClick={() => setShowZeroModal(true)}
                className="ml-4 px-3 py-2 rounded-md border border-[#7C6A55] text-[#7C6A55] hover:bg-[#7C6A55]/10 text-sm"
              >
                Mostrar productos sin stock
              </button>
            </div>
            <div className="mt-4">
              {errorGlobal ? (
                <div className="text-sm text-red-600">{errorGlobal}</div>
              ) : (
                <StockGlobalTable
                  data={stockGlobal}
                  loading={loadingGlobal}
                  onCrearPedido={(row) =>
                    navigate(
                      `/adminsis/pedidos/crear?producto=${row.idProducto}`
                    )
                  }
                  onMovimientoStock={(row) =>
                    navigate(
                      `/adminsis/movimientos/crear?producto=${row.idProducto}`
                    )
                  }
                />
              )}
            </div>
          </div>

          <Modal
            open={showZeroModal}
            onClose={() => setShowZeroModal(false)}
            containerClass="max-w-2xl"
          >
            <div className="rounded-lg overflow-hidden shadow-lg">
              <div className="bg-[#5d5448] px-6 py-4">
                <h2 className="text-xl font-semibold text-white">
                  Productos sin stock en ningún depósito
                </h2>
              </div>
              <div className="bg-white px-6 py-4">
                {(stockGlobal || []).filter((r) => r.stockTotal === 0)
                  .length === 0 ? (
                  <p className="text-gray-600">No hay productos sin stock.</p>
                ) : (
                  <ul className="space-y-2 max-h-96 overflow-auto">
                    {stockGlobal
                      .filter((r) => r.stockTotal === 0)
                      .map((r) => (
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
            </div>
          </Modal>
        </>
      )}

      <DepositoFormModal
        open={openCreate}
        onCancel={() => setOpenCreate(false)}
        onSave={handleCreate}
        existingNames={items.map((i) => i.nombre)}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        name={deleteTarget?.nombre || ""}
        title="Eliminar depósito"
        message="¿Estás seguro que deseas eliminar este depósito? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  );
}
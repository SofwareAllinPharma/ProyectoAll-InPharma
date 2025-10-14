import React from "react";
import DataTable from "../../../components/DataTable";
import MiniActionButton from "../../../components/botonesMini";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTruck } from "react-icons/fa";
import DistributionBar from "./DistributionBar";

// INTERFACES COMBINADAS
export interface DistribucionDeposito {
  idDeposito: number;
  nombre: string;
  cantidad: number;
  porcentaje: number;
  // TU CAMBIO: Nuevos campos para la lógica de stock
  estado?: "CRITICO" | "BAJO" | "NORMAL" | "DEFAULT";
  umbralMin?: number;
}

export interface StockGlobalRow {
  idProducto: number;
  producto: string;
  stockTotal: number;
  distribucion: DistribucionDeposito[];
  updatedAt?: string;
}

interface Props {
  data: StockGlobalRow[];
  loading?: boolean;
  onCrearPedido?: (row: StockGlobalRow) => void;
  onMovimientoStock?: (row: StockGlobalRow) => void;
}

const StockGlobalTable: React.FC<Props> = ({
  data,
  loading,
  onCrearPedido,
  onMovimientoStock,
}) => {
  const navigate = useNavigate();

  // CAMBIO DE ELLA: Filtra los datos para que solo muestre productos con stock > 0.
  const visible = (data || []).filter((r) => r.stockTotal !== 0);

  return (
    <DataTable
      // Se usa la data filtrada
      data={visible}
      columns={[
        {
          id: "producto",
          header: "Producto",
          accessor: (r) => r.producto,
          sortable: true,
          cell: (r) => (
            <span
              className="font-semibold text-[#3E3529] hover:underline cursor-pointer"
              onClick={() => navigate(`/adminsis/productos/${r.idProducto}`)}
            >
              {r.producto}
            </span>
          ),
          widthClass: "min-w-[220px]",
        },
        {
          id: "stockTotal",
          header: "Stock Total",
          accessor: (r) => r.stockTotal,
          sortable: true,
          align: "center",
          cell: (r) => (
            <span className="font-bold text-lg text-gray-800">
              {r.stockTotal}
            </span>
          ),
          widthClass: "w-24",
        },
        {
          id: "actualizacion",
          header: "Actualización",
          accessor: (r) => r.updatedAt ?? "",
          sortable: true,
          align: "center",
          cell: (r) =>
            r.updatedAt
              ? new Date(r.updatedAt).toLocaleDateString("es-AR")
              : "-",
          widthClass: "w-32",
        },
        {
          id: "distribucion",
          header: "Distribución por Depósito",
          accessor: () => "",
          align: "center",
          cell: (r) => {
            // TU CAMBIO: Uso del componente DistributionBar
            const segments = r.distribucion
              .filter((d) => d.cantidad > 0)
              .map((d) => ({
                id: d.idDeposito,
                label: d.nombre,
                percentage: d.porcentaje,
              }));

            return (
              <div className="w-full flex justify-center">
                <DistributionBar
                  segments={segments}
                  height={12}
                  className="w-[160px]"
                />
              </div>
            );
          },
          widthClass: "min-w-[220px] px-4",
        },
      ]}
      loading={loading}
      // TU CAMBIO: Lógica de acciones de fila condicional
      renderRowActions={(row) => {
        const mostrarPedido = row.distribucion.some((d) => {
          const est =
            typeof d.estado === "string" ? d.estado.trim().toUpperCase() : "";
          if (est === "CRITICO" || est === "BAJO") return true;
          if (est === "NORMAL" || est === "DEFAULT") return false;
          if (
            typeof d.umbralMin === "number" &&
            typeof d.cantidad === "number"
          ) {
            if (d.cantidad < d.umbralMin) return true;
            if (d.cantidad <= d.umbralMin + 5) return true;
            return false;
          }
          return typeof d.cantidad === "number" && d.cantidad < 5;
        });

        return (
          <div className="flex gap-2 justify-center">
            <MiniActionButton
              variant="traslado"
              title="Realizar Movimiento"
              icon={<FaTruck size={16} />}
              onClick={() => onMovimientoStock?.(row)}
            />
            {mostrarPedido && (
              <MiniActionButton
                variant="pedido"
                title="Crear Pedido de Elaboración"
                icon={<FaPlus size={16} />}
                onClick={() => onCrearPedido?.(row)}
              />
            )}
          </div>
        );
      }}
      initialSort={{ columnId: "producto", direction: "asc" }}
      pageSizeOptions={[5, 10, 20]}
    />
  );
};

export default StockGlobalTable;
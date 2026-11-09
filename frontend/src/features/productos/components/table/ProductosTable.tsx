import React from "react";
import type { Producto, ProductoModalAction } from "../../types/producto.types";
import DataTable from "../../../../components/ui/DataTable";
import type { Column } from "../../../../components/ui/DataTable";
import ProductoNombreCell from "./ProductoNombreCell";
import ProductoFormulaCell from "./ProductoFormulaCell";
import ProductoAccionesCell from "./ProductoAccionesCell";
import CostoProductoCell from "./CostoProductoCell";

interface Props {
  productos: Producto[];
  onProductoAction: (action: ProductoModalAction) => void;
  isLoading?: boolean;
}

export const ProductosTable: React.FC<Props> = ({
  productos,
  onProductoAction,
  isLoading = false,
}) => {
  const formatNumber = (value: number): string => {
    return value.toFixed(4);
  };

  const formatPorciones = (producto: Producto): string => {
    // Calculamos el valor real en el momento: Peso Neto / Porción de la fórmula
    if (producto.formula && producto.formula.porcion > 0) {
      const valorCalculado = producto.pesoNeto / producto.formula.porcion;
      return `${valorCalculado.toFixed(2)} porciones`;
    }
    return "N/A";
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c6a55]"></div>
          <span className="ml-2 text-gray-600">Cargando productos...</span>
        </div>
      </div>
    );
  }

  const columns: Column<Producto>[] = [
    {
      key: "nombreComercial",
      title: "Producto",
      width: "18%",
      align: "center",
      render: (r) => (
        <ProductoNombreCell producto={r} onAction={onProductoAction} />
      ),
    },
    {
      key: "sku",
      title: "SKU",
      width: "12%",
      align: "center",
      render: (r) =>
        r.sku ? (
          <span className="font-mono text-xs">{r.sku}</span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      key: "formula",
      title: "Fórmula",
      width: "16%",
      align: "center",
      render: (r) => <ProductoFormulaCell producto={r} />,
    },
    {
      key: "pesoNeto",
      title: "Peso Neto",
      width: "12%",
      align: "center",
      render: (r) => `${formatNumber(r.pesoNeto)}g`,
    },
    {
      key: "cantPorcionesAportadas",
      title: "Porciones",
      width: "20%",
      align: "center",
      render: (r) => formatPorciones(r),
    },
    {
      key: "pesoPorPorcion",
      title: "Peso por Porción",
      width: "14%",
      align: "center",
      render: (r) =>
        r.formula ? `${formatNumber(r.formula.porcion || 0)}g` : "N/A",
    },
    {
      key: "costo",
      title: "Costo/paquete",
      width: "12%",
      align: "center",
      render: (r) => <CostoProductoCell idProducto={r.idProducto} />,
    },
    {
      key: "acciones",
      title: "Acciones",
      width: "12%",
      align: "center",
      render: (r) => (
        <ProductoAccionesCell producto={r} onAction={onProductoAction} />
      ),
    },
  ];

  const emptyState = (
    <div className="text-center text-gray-500 py-4">
      <p className="text-lg mb-2">No se encontraron productos</p>
      <p className="text-sm">
        Ajusta los filtros de búsqueda o crea un nuevo producto
      </p>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={productos}
      rowKey={(r) => r.idProducto}
      expandable={undefined}
      emptyState={emptyState}
      pagination
      defaultPageSize={10}
      pageSizeOptions={[5, 10, 20]}
    />
  );
};

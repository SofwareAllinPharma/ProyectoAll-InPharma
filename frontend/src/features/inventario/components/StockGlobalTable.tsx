import React from 'react';
import DataTable from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { useNavigate } from 'react-router-dom';
import type { StockGlobalRow } from '../types/stock';
import { getStockGlobalColumns } from '../columns/stockGlobalColumns';
import InventarioEmptyState from './InventarioEmptyState';

interface Props {
  data: StockGlobalRow[];
  loading?: boolean;
  onCrearPedido?: (row: StockGlobalRow) => void;
  onMovimientoStock?: (row: StockGlobalRow) => void;
  onCrearMovimientoPrefill?: (args: { producto: { idProducto: number; nombreComercial?: string }; depositoOrigen?: { id: number; nombre?: string } }) => void;
}

const StockGlobalTable: React.FC<Props> = ({ data, loading, onCrearPedido, onMovimientoStock, onCrearMovimientoPrefill }) => {
  const navigate = useNavigate();
  const visible = (data || []).filter((r) => r.stockTotal !== 0);
  const columns: Column<StockGlobalRow>[] = getStockGlobalColumns((p) => navigate(p), onCrearPedido, onMovimientoStock, onCrearMovimientoPrefill);

  if (loading) return <div className="p-6 text-center text-gray-600">Cargando stock global...</div>;

  return (
    <DataTable
      data={visible}
      columns={columns}
      rowKey={(r: StockGlobalRow) => r.idProducto}
      expandable={() => null}
      pagination
      defaultPageSize={10}
      pageSizeOptions={[5, 10, 20]}
      emptyState={<InventarioEmptyState estadoFilter={''} />}
      // Remove the table's own border/rounding and stretch it to the card edges
      // keep outer rounded container but remove inner border/shadow and stretch to card edges
      tableClassName="border-0 shadow-none -mx-6 -my-6"
      noDividers
    />
  );
};

export default StockGlobalTable;

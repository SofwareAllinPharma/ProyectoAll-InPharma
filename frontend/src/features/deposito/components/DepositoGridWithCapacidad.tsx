import { useEffect, useState } from "react";
import { LoteStockService } from "../../inventario/services/lote.service";
import type { Deposito } from "../types/deposito.types";
import DepositCard from "./DepositoCard";

interface Props {
  items: Deposito[];
  refreshKey?: number;
  onOpenDetail?: (id: number) => void;
  onDelete?: (deposito: Deposito) => void;
}

export default function DepositGridWithCapacidad({ items, onOpenDetail, onDelete, refreshKey = 0 }: Props) {
  // Estado para mapear idDeposito -> suma de productos
  const [capacidadPorDeposito, setCapacidadPorDeposito] = useState<Record<number, number | null>>({});

  useEffect(() => {
    let isMounted = true;
    async function fetchAll() {
      const result: Record<number, number | null> = {};
      await Promise.all(
        items.map(async (d) => {
          try {
            const inventario = await LoteStockService.stockPorDeposito(d.id);
            result[d.id] = inventario.reduce(
              (acc, prod) => acc + prod.totalUnidades,
              0
            );
          } catch {
            result[d.id] = null;
          }
        })
      );
      if (isMounted) setCapacidadPorDeposito(result);
    }
    if (items.length > 0) fetchAll();
    return () => {
      isMounted = false;
    };
  }, [items, refreshKey]);

  

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {items.map((d) => (
        <DepositCard
          key={d.id}
          d={d}
          onOpenDetail={onOpenDetail}
          onDelete={onDelete}
          productosEnDeposito={capacidadPorDeposito[d.id] ?? null}
        />
      ))}
    </div>
  );
}

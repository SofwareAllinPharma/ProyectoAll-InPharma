import { useEffect, useState } from "react";
import { InventarioService, type InventarioProducto } from "../../inventario/services/inventario.service";
import type { Deposito } from "../types/deposito.types";
import DepositCard from "./DepositoCard";

interface Props {
  items: Deposito[];
  onOpenDetail?: (id: number) => void;
  onDelete?: (deposito: Deposito) => void;
}

export default function DepositGridWithCapacidad({ items, onOpenDetail, onDelete }: Props) {
  // Estado para mapear idDeposito -> suma de productos
  const [capacidadPorDeposito, setCapacidadPorDeposito] = useState<Record<number, number>>({});

  useEffect(() => {
    let isMounted = true;
    async function fetchAll() {
      const result: Record<number, number> = {};
      await Promise.all(
        items.map(async (d) => {
          try {
            const inventario: InventarioProducto[] = await InventarioService.getInventarioByDeposito(d.id);
            result[d.id] = inventario.reduce(
              (acc, prod) => acc + (typeof prod.cantidadProducto === "number" ? prod.cantidadProducto : 0),
              0
            );
          } catch {
            result[d.id] = 0;
          }
        })
      );
      if (isMounted) setCapacidadPorDeposito(result);
    }
    if (items.length > 0) fetchAll();
    return () => {
      isMounted = false;
    };
  }, [items]);

  

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {items.map((d) => (
        <DepositCard
          key={d.id}
          d={d}
          onOpenDetail={onOpenDetail}
          onDelete={onDelete}
          productosEnDeposito={capacidadPorDeposito[d.id]}
        />
      ))}
    </div>
  );
}

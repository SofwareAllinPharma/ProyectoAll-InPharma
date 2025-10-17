import type { Deposito } from "../types/deposito.types";
import DepositCard from "./DepositoCard";


type Props = {
  items: Deposito[];
  onOpenDetail?: (id: number) => void;
  onDelete?: (deposito: Deposito) => void;
};

export default function DepositGrid({ items, onOpenDetail, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {items.map(d => (
        <DepositCard key={d.id} d={d} onOpenDetail={onOpenDetail} onDelete={onDelete} />
      ))}
    </div>
  );
}

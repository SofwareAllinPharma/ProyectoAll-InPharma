import type { Deposito } from "../types/deposito.types";
import DepositCard from "./DepositCard";

type Props = {
  items: Deposito[];
  onOpenDetail?: (id: number) => void;
};

export default function DepositGrid({ items, onOpenDetail }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {items.map(d => (
        <DepositCard key={d.id} d={d} onOpenDetail={onOpenDetail} />
      ))}
    </div>
  );
}

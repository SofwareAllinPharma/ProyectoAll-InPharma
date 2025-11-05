
interface Props {
  nombreProducto?: string;
}

export default function MovimientosProductoCell({ nombreProducto }: Props) {
  return (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900 text-sm">
        {nombreProducto || 'Producto no encontrado'}
      </span>
    </div>
  );
}
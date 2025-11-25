import { PDFDownloadLink } from '@react-pdf/renderer';
import { ProductLabelPdf } from './ProductLabelPdf';
import type { Producto } from '../../types/producto.types';
import Button from '../../../../components/ui/Button';
import { Printer } from 'lucide-react';

interface PrintLabelButtonProps {
  producto: Producto;
}

export const PrintLabelButton = ({ producto }: PrintLabelButtonProps) => {
  return (
    <PDFDownloadLink
      document={<ProductLabelPdf producto={producto} />}
      fileName={`etiqueta-${producto.nombreComercial.replace(/\s+/g, '-').toLowerCase()}.pdf`}
    >
      {({ loading }) => (
        <Button 
            variant="outline" 
            disabled={loading}
            icon={<Printer size={16} />}
        >
          {loading ? 'Generando...' : 'Imprimir Etiqueta'}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

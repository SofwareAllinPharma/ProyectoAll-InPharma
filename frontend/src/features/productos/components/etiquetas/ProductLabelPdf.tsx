import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import type { Producto } from '../../types/producto.types';
import { computeNutrition } from '../../hooks/useNutrition';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  labelContainer: {
    border: '2px solid #000',
    padding: 10,
    width: '100%',
    maxWidth: 280,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 20,
    marginBottom: 2,
    borderBottom: '1px solid #000',
    fontFamily: 'Helvetica-Bold',
  },
  subHeader: {
    fontSize: 10,
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
  },
  section: {
    borderBottom: '1px solid #000',
    paddingVertical: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    alignItems: 'center'
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  thickBorder: {
    borderBottom: '4px solid #000',
  },
  mediumBorder: {
    borderBottom: '2px solid #000',
  },
  description: {
    fontSize: 8,
    marginTop: 5,
    fontStyle: 'italic',
  },
  servingSize: {
      fontSize: 10,
      fontFamily: 'Helvetica-Bold',
      paddingVertical: 3,
      borderBottom: '4px solid #000'
  }
});

interface ProductLabelPdfProps {
  producto: Producto;
}

interface LabelContentProps {
  productName: string;
  servingText: string;
  rows: { label: string; value: string | number }[];
}

const LabelContent = ({ productName, servingText, rows }: LabelContentProps) => (
    <View style={styles.labelContainer}>
        <Text style={styles.header}>Información Nutricional</Text>
        <Text style={styles.subHeader}>{productName}</Text>
        
        <View style={styles.servingSize}>
            <Text>{servingText}</Text>
        </View>

        {rows.map((row, index) => (
            <View key={index} style={styles.section}>
                <Text style={styles.bold}>{row.label}</Text>
                <Text>{row.value}</Text>
            </View>
        ))}
    </View>
);

export const ProductLabelPdf = ({ producto }: ProductLabelPdfProps) => {
    const { pesoPorPorcion, rowsPerPortion, rowsPer100g, rowsTotal } = computeNutrition(producto);

    return (
        <Document>
            {/* 1. Por Porción */}
            <Page size="A4" style={styles.page}>
                <LabelContent 
                    productName={producto.nombreComercial}
                    servingText={`Porción: ${pesoPorPorcion}g`}
                    rows={rowsPerPortion}
                />
            </Page>

            {/* 2. Por 100g */}
            <Page size="A4" style={styles.page}>
                <LabelContent 
                    productName={producto.nombreComercial}
                    servingText="Base: 100g"
                    rows={rowsPer100g}
                />
            </Page>

            {/* 3. Total Producto */}
            <Page size="A4" style={styles.page}>
                <LabelContent 
                    productName={producto.nombreComercial}
                    servingText={`Total Producto: ${producto.pesoNeto}g`}
                    rows={rowsTotal}
                />
            </Page>
        </Document>
    );
};

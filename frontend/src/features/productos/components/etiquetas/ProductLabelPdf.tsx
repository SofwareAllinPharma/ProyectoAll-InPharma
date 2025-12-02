import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import type { Producto } from "../../types/producto.types";
import { computeNutrition } from "../../hooks/useNutrition";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  labelContainer: {
    border: "2px solid #000",
    padding: 10,
    width: "100%",
    maxWidth: 280,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 20,
    marginBottom: 2,
    borderBottom: "1px solid #000",
    fontFamily: "Helvetica-Bold",
  },
  subHeader: {
    fontSize: 10,
    marginBottom: 5,
    fontFamily: "Helvetica-Bold",
  },
  servingSize: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 3,
    borderBottom: "4px solid #000",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "2px solid #000",
    paddingVertical: 3,
    backgroundColor: "#f0f0f0",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ccc",
    paddingVertical: 3,
    fontSize: 9,
  },
  colLabel: {
    width: "40%",
    paddingLeft: 5,
    fontFamily: "Helvetica-Bold",
  },
  colValue: {
    width: "30%",
    textAlign: "center",
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  description: {
    fontSize: 8,
    marginTop: 5,
    fontStyle: "italic",
  },
});

interface ProductLabelPdfProps {
  producto: Producto;
}

export const ProductLabelPdf = ({ producto }: ProductLabelPdfProps) => {
  const { pesoPorPorcion, rowsPerPortion, rowsPer100g } =
    computeNutrition(producto);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.labelContainer}>
          <Text style={styles.header}>Información Nutricional</Text>
          <Text style={styles.subHeader}>{producto.nombreComercial}</Text>

          <View style={styles.servingSize}>
            <Text>Porción: {pesoPorPorcion}g | Base: 100g</Text>
          </View>

          {/* Encabezado de tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colLabel, styles.bold]}>Composición</Text>
            <Text style={[styles.colValue, styles.bold]}>Por Porción</Text>
            <Text style={[styles.colValue, styles.bold]}>Por 100g</Text>
          </View>

          {/* Filas de datos */}
          {rowsPerPortion.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colLabel}>{row.label}</Text>
              <Text style={styles.colValue}>{row.value}</Text>
              <Text style={styles.colValue}>{rowsPer100g[index]?.value}</Text>
            </View>
          ))}

          <Text style={styles.description}>
            * % Valores Diarios con base a una dieta de 2.000 kcal u 8.400 kJ.
            Sus valores diarios pueden ser mayores o menores dependiendo de sus
            necesidades energéticas.
          </Text>
          <Text style={styles.description}>
            Peso Neto: {producto.pesoNeto}g
          </Text>
        </View>
      </Page>
    </Document>
  );
};

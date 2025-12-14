import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import type { Producto } from "../../types/producto.types";
import { computeNutrition } from "../../hooks/useNutrition";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
  },
  labelContainer: {
    borderWidth: 2,
    borderColor: "#000",
    borderStyle: "solid",
    padding: 10,
    width: 280,
  },
  header: {
    fontSize: 20,
    marginBottom: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    fontFamily: "Helvetica-Bold",
  },
  subHeader: {
    fontSize: 10,
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
  },
  servingSize: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 4,
    borderBottomWidth: 3,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    marginBottom: 5,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    paddingVertical: 4,
    backgroundColor: "#f0f0f0",
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderBottomStyle: "solid",
    paddingVertical: 4,
  },
  tableRowText: {
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
  description: {
    fontSize: 8,
    marginTop: 8,
    fontStyle: "italic",
  },
  ingredientsTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },
  ingredientsText: {
    fontSize: 8,
    marginTop: 2,
    marginBottom: 12, // ✅ NUEVO: pequeño espacio antes de la tabla
  },
});

interface ProductLabelPdfProps {
  producto: Producto;
}

export const ProductLabelPdf = ({ producto }: ProductLabelPdfProps) => {
  const { pesoPorPorcion, rowsPerPortion, rowsPer100g } =
    computeNutrition(producto);

  // ✅ NUEVO (mínimo): ingredientes desde la fórmula vinculada
  const formulaInsumos = (producto as any)?.formula?.formulaInsumos;
  const ingredientes = Array.isArray(formulaInsumos)
    ? formulaInsumos
        .map((fi: any) => fi?.insumo?.nombre)
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.labelContainer}>
          <Text style={styles.header}>Información Nutricional</Text>
          <Text style={styles.subHeader}>{producto.nombreComercial}</Text>

          <Text style={styles.servingSize}>
            Porción: {pesoPorPorcion}g | Base: 100g
          </Text>

          {/* ✅ NUEVO (mínimo): mostrar ingredientes ANTES de la tabla */}
          {ingredientes ? (
            <>
              <Text style={styles.description}>
                Ingredientes: {ingredientes}.
              </Text>
              <View style={{ height: 6 }} /> {/* ✅ NUEVO: interlineado */}
            </>
          ) : null}

          <View style={styles.tableHeader}>
            <Text style={[styles.colLabel, styles.tableHeaderText]}>
              Composición
            </Text>
            <Text style={[styles.colValue, styles.tableHeaderText]}>
              Por Porción
            </Text>
            <Text style={[styles.colValue, styles.tableHeaderText]}>
              Por 100g
            </Text>
          </View>

          {rowsPerPortion.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.colLabel, styles.tableRowText]}>
                {row.label}
              </Text>
              <Text style={[styles.colValue, styles.tableRowText]}>
                {row.value}
              </Text>
              <Text style={[styles.colValue, styles.tableRowText]}>
                {rowsPer100g[index]?.value || "-"}
              </Text>
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

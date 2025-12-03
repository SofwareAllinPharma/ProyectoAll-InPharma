// @ts-ignore: external module without types in this project
import {
  Document,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
  AlignmentType,
  BorderStyle,
  TextRun,
  Packer,
} from "docx";
// @ts-ignore: external module without types in this project
import { saveAs } from "file-saver";
import type { Producto } from "../../types/producto.types";
import { computeNutrition } from "../../hooks/useNutrition";

export const generateWordLabel = async (producto: Producto) => {
  const { pesoPorPorcion, rowsPerPortion, rowsPer100g } =
    computeNutrition(producto);

  // Borde exterior grueso negro
  const outerBorder = {
    style: BorderStyle.SINGLE,
    size: 20, // Más grueso
    color: "000000",
  };

  const borderStyle = {
    style: BorderStyle.SINGLE,
    size: 6,
    color: "000000",
  };

  const thinBorder = {
    style: BorderStyle.SINGLE,
    size: 3,
    color: "CCCCCC",
  };

  const thickBorder = {
    style: BorderStyle.SINGLE,
    size: 12,
    color: "000000",
  };

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 567,
              right: 567,
              bottom: 567,
              left: 567,
            },
          },
        },
        children: [
          // Tabla contenedora principal con borde negro grueso visible
          new Table({
            width: {
              size: 5600,
              type: WidthType.DXA,
            },
            columnWidths: [5600],
            rows: [
              // Fila única que contiene todo el contenido
              new TableRow({
                children: [
                  new TableCell({
                    borders: {
                      top: outerBorder,
                      bottom: outerBorder,
                      left: outerBorder,
                      right: outerBorder,
                    },
                    margins: {
                      top: 200,
                      bottom: 200,
                      left: 200,
                      right: 200,
                    },
                    children: [
                      // Título
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Información Nutricional",
                            bold: true,
                            size: 40,
                            font: "Helvetica",
                            color: "000000",
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 60, before: 0 },
                        border: {
                          bottom: {
                            style: BorderStyle.SINGLE,
                            size: 3,
                            color: "000000",
                          },
                        },
                      }),

                      // Nombre del producto
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: producto.nombreComercial,
                            bold: true,
                            size: 20,
                            font: "Helvetica",
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 160 },
                      }),

                      // Porción
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Porción: ${pesoPorPorcion}g | Base: 100g`,
                            bold: true,
                            size: 20,
                            font: "Helvetica",
                          }),
                        ],
                        spacing: { after: 100, before: 0 },
                        border: {
                          bottom: thickBorder,
                        },
                      }),

                      // Tabla nutricional
                      new Table({
                        width: {
                          size: 100,
                          type: WidthType.PERCENTAGE,
                        },
                        borders: {
                          top: borderStyle,
                          bottom: borderStyle,
                          left: borderStyle,
                          right: borderStyle,
                          insideHorizontal: thinBorder,
                          insideVertical: thinBorder,
                        },
                        rows: [
                          // Encabezado tabla nutricional
                          new TableRow({
                            children: [
                              new TableCell({
                                children: [
                                  new Paragraph({
                                    children: [
                                      new TextRun({
                                        text: "Composición",
                                        bold: true,
                                        size: 16,
                                        font: "Helvetica",
                                      }),
                                    ],
                                    spacing: { before: 60, after: 60 },
                                  }),
                                ],
                                width: { size: 40, type: WidthType.PERCENTAGE },
                                shading: { fill: "F0F0F0" },
                                margins: { left: 100 },
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph({
                                    children: [
                                      new TextRun({
                                        text: "Por Porción",
                                        bold: true,
                                        size: 16,
                                        font: "Helvetica",
                                      }),
                                    ],
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 60, after: 60 },
                                  }),
                                ],
                                width: { size: 30, type: WidthType.PERCENTAGE },
                                shading: { fill: "F0F0F0" },
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph({
                                    children: [
                                      new TextRun({
                                        text: "Por 100g",
                                        bold: true,
                                        size: 16,
                                        font: "Helvetica",
                                      }),
                                    ],
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 60, after: 60 },
                                  }),
                                ],
                                width: { size: 30, type: WidthType.PERCENTAGE },
                                shading: { fill: "F0F0F0" },
                              }),
                            ],
                            tableHeader: true,
                          }),
                          // Filas de datos
                          ...rowsPerPortion.map(
                            (row, index) =>
                              new TableRow({
                                children: [
                                  new TableCell({
                                    children: [
                                      new Paragraph({
                                        children: [
                                          new TextRun({
                                            text: row.label,
                                            bold: true,
                                            size: 18,
                                            font: "Helvetica",
                                          }),
                                        ],
                                        spacing: { before: 60, after: 60 },
                                      }),
                                    ],
                                    margins: { left: 100 },
                                  }),
                                  new TableCell({
                                    children: [
                                      new Paragraph({
                                        children: [
                                          new TextRun({
                                            text: row.value,
                                            size: 18,
                                            font: "Helvetica",
                                          }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                        spacing: { before: 60, after: 60 },
                                      }),
                                    ],
                                  }),
                                  new TableCell({
                                    children: [
                                      new Paragraph({
                                        children: [
                                          new TextRun({
                                            text:
                                              rowsPer100g[index]?.value || "-",
                                            size: 18,
                                            font: "Helvetica",
                                          }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                        spacing: { before: 60, after: 60 },
                                      }),
                                    ],
                                  }),
                                ],
                              })
                          ),
                        ],
                      }),

                      // Nota al pie
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "* % Valores Diarios con base a una dieta de 2.000 kcal u 8.400 kJ. Sus valores diarios pueden ser mayores o menores dependiendo de sus necesidades energéticas.",
                            italics: true,
                            size: 16,
                            font: "Helvetica",
                          }),
                        ],
                        spacing: { before: 160, after: 0 },
                      }),

                      // Peso neto
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Peso Neto: ${producto.pesoNeto}g`,
                            italics: true,
                            size: 16,
                            font: "Helvetica",
                          }),
                        ],
                        spacing: { before: 160, after: 0 },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(
    blob,
    `etiqueta-${producto.nombreComercial
      .replace(/\s+/g, "-")
      .toLowerCase()}.docx`
  );
};

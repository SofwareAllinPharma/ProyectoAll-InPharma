// @ts-ignore: external module without types in this project
import { Document, Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle, TextRun, Packer } from 'docx';
// @ts-ignore: external module without types in this project
import { saveAs } from 'file-saver';
import type { MovimientoDetalle } from '../../types/movimiento.detalle.types';

const TIPO_LABELS: Record<string, string> = {
  TRASLADO: 'Traslado',
  EGRESO: 'Egreso',
  INGRESO: 'Ingreso',
};

const ESTADO_LABELS: Record<string, string> = {
  CREADO: 'Creado',
  EN_CAMINO: 'En Camino',
  ENTREGADO: 'Entregado',
  VENDIDO: 'Vendido',
  CANCELADO: 'Cancelado',
};

const thinBorder = { style: BorderStyle.SINGLE, size: 3, color: 'CCCCCC' };
const accentBorder = { style: BorderStyle.SINGLE, size: 8, color: '9D977B' };

const infoRow = (label: string, value: string) =>
  new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18, font: 'Helvetica' })], spacing: { before: 40, after: 40 }, margins: { left: 80 } })],
        width: { size: 40, type: WidthType.PERCENTAGE },
        shading: { fill: 'F5F3EB' },
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: value, size: 18, font: 'Helvetica' })], spacing: { before: 40, after: 40 }, margins: { left: 80 } })],
        width: { size: 60, type: WidthType.PERCENTAGE },
      }),
    ],
  });

const sectionTitle = (text: string) =>
  new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, font: 'Helvetica', color: '374151' })],
    spacing: { before: 240, after: 80 },
    border: { bottom: accentBorder },
  });

export const generateMovimientoWord = async (detalle: MovimientoDetalle) => {
  const tipoLabel = TIPO_LABELS[detalle.tipo] ?? detalle.tipo;
  const estadoLabel = ESTADO_LABELS[detalle.estado] ?? detalle.estado;
  const isTraslado = detalle.tipo === 'TRASLADO';
  const isEgreso = detalle.tipo === 'EGRESO';
  const flujo = isTraslado
    ? `${detalle.depositoOrigenNombre ?? '-'} → ${detalle.depositoDestinoNombre ?? '-'}`
    : isEgreso
    ? `${detalle.depositoOrigenNombre ?? '-'} → Venta`
    : `Externo → ${detalle.depositoDestinoNombre ?? '-'}`;

  const now = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const infoRows = [
    infoRow('Tipo', tipoLabel),
    infoRow('Producto', detalle.productoNombre),
    infoRow('Cantidad', `${detalle.cantidad} unidad${detalle.cantidad === 1 ? '' : 'es'}`),
    infoRow('Flujo', flujo),
    ...(detalle.referencia ? [infoRow('Referencia', detalle.referencia)] : []),
    ...(detalle.responsable ? [infoRow('Responsable', detalle.responsable)] : []),
    infoRow('Observaciones', detalle.observaciones?.trim() || 'No Aplica'),
  ];

  const children: any[] = [
    new Paragraph({
      children: [new TextRun({ text: `Movimiento MOV-${detalle.id}`, bold: true, size: 40, font: 'Helvetica' })],
      spacing: { after: 60 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: '000000' } },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Emitido: ${now}   ·   Creado: ${detalle.fechaCreacion}`, size: 16, font: 'Helvetica', color: '6b7280' })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Estado: ', bold: true, size: 18, font: 'Helvetica' }),
        new TextRun({ text: estadoLabel, size: 18, font: 'Helvetica', color: '5d5448' }),
      ],
      spacing: { after: 160 },
    }),

    sectionTitle('Información del Movimiento'),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: accentBorder, bottom: accentBorder, left: accentBorder, right: accentBorder, insideHorizontal: thinBorder, insideVertical: thinBorder },
      rows: infoRows,
    }),
  ];

  if (detalle.historial.length > 0) {
    children.push(sectionTitle('Historial de Estados'));
    [...detalle.historial].reverse().forEach((ev) => {
      let lineText = ev.fechaInicio ?? '-';
      if (ev.responsable) lineText += `  ·  ${ev.responsable}`;
      if (ev.responsableEntrega) lineText += `  ·  Entrega: ${ev.responsableEntrega}`;
      if (ev.responsableRecepcion) lineText += `  ·  Recepción: ${ev.responsableRecepcion}`;

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: ESTADO_LABELS[ev.estado] ?? ev.estado, bold: true, size: 18, font: 'Helvetica' }),
            new TextRun({ text: '  ', size: 18 }),
            new TextRun({ text: lineText, size: 16, font: 'Helvetica', color: '6b7280' }),
          ],
          spacing: { before: 80, after: 40 },
          indent: { left: 200 },
          border: { left: { style: BorderStyle.SINGLE, size: 8, color: '9D977B' } },
        })
      );
    });
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `movimiento-MOV-${detalle.id}.docx`);
};

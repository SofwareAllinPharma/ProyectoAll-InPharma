import { Document, Paragraph, Table, TableCell, TableRow, WidthType, TextRun, Packer, Header, Footer, PageNumber } from 'docx';
import type { Pedido } from '../../types/pedido.types';
import type { Producto } from '../../../productos/types/producto.types';
import { buildOrdenExport, COMPOSICION_ACTUAL, ESTADO_LABELS, formatOrdenDate, formatOrdenNumber as fmt } from '../../utils/ordenExport';

const paragraph = (text: string, bold = false) => new Paragraph({ children: [new TextRun({ text, bold, size: 20 })], spacing: { after: 80 } });
const title = (text: string) => new Paragraph({ children: [new TextRun({ text, bold: true, size: 26 })], spacing: { before: 220, after: 100 }, keepNext: true });
const table = (rows: string[][], header = false) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: rows.map((cells, i) => new TableRow({ cantSplit: true, tableHeader: header && i === 0, children: cells.map(text => new TableCell({ children: [paragraph(text, header && i === 0)] })) })),
});

export function buildPedidoWord(pedido: Pedido, producto?: Producto | null) {
  const data = buildOrdenExport(pedido, producto);
  const children = [
    title(`Orden de producción PED-${pedido.numPedido}`),
    paragraph(`Emitido: ${formatOrdenDate(new Date())} | Creado: ${formatOrdenDate(pedido.createdAt)} | Hora Argentina`),
    table([
      ['Producto', pedido.producto?.nombreComercial ?? `#${pedido.idProducto}`], ['Estado', data.estado],
      ['Fórmula actual', data.formula ? `${data.formula.nombre} (#${data.formula.id})` : 'No disponible'],
      ['Porción de fórmula', data.formula ? `${fmt(data.formula.porcion)} g` : 'No disponible'],
      ['Porciones por envase', fmt(producto?.cantPorcionesAportadas)],
    ]), paragraph(COMPOSICION_ACTUAL),
    ...(data.advertencia ? [paragraph(data.advertencia, true)] : []),
    title('Cantidades de la orden'),
    table([
      ['Planificado: paquetes / porciones', `${fmt(pedido.cantAProducir_paquetes)} / ${fmt(pedido.cantAProducir_porciones)}`],
      ['Planificado: gramos', `${fmt(pedido.cantAProducir_gramos)} g`],
      ['Elaborado: paquetes / porciones', `${fmt(pedido.cantElaborada_paquetes)} / ${fmt(pedido.cantElaborada_porciones)}`],
      ['Elaborado: gramos', pedido.cantElaborada_gramos != null ? `${fmt(pedido.cantElaborada_gramos)} g` : 'No registrado'],
      ...(pedido.observacion ? [['Observación', pedido.observacion]] : []),
    ]),
    title(`Nutrición de la fórmula por porción${data.formula ? ` (${fmt(data.formula.porcion)} g)` : ''}`),
    ...(data.nutrientes.length ? [table(data.nutrientes.map(n => [n.label, n.value]))] : [paragraph('No disponible.')]),
    paragraph('Datos registrados en la ficha actual. Sodio conserva la unidad del sistema; no se convirtió a mg.'),
    title('Insumos requeridos (estimado)'),
    ...(data.insumos.length ? [table([
      ['Insumo / identificación', 'g por porción', 'g para la orden'],
      ...data.insumos.map(ins => [`#${ins.idInsumo} - ${ins.nombre}`, fmt(ins.gramosPorPorcion), fmt(ins.cantidad)]),
    ], true)] : [paragraph('Composición incompleta o no disponible; verificar la fórmula antes de elaborar.')]),
    title('Responsables'),
    table([
      ['Creador', pedido.mailUsuarioCreador], ['Técnico asignado', pedido.mailUsuarioCocinero ?? 'No registrado'],
      ['Elaborador registrado al finalizar', data.elaborador ?? 'No registrado'], ['Depositador registrado al finalizar', data.depositador ?? 'No registrado'],
    ]),
    paragraph('Lote, vencimiento y ubicación: consultar los lotes asociados en Inventario. Este informe no genera lotes ni acredita firmas digitales.'),
    title('Historial de estados'),
    ...(pedido.cambios ?? []).map(c => paragraph(`${ESTADO_LABELS[c.estado?.nombre ?? ''] ?? c.estado?.nombre ?? 'Estado sin detalle'} | ${formatOrdenDate(c.fechaHoraInicio)}${c.responsable ? ` | Responsable: ${c.responsable}` : ''}${c.depositador ? ` | Depositador: ${c.depositador}` : ''}`)),
  ];
  return new Document({ sections: [{
    properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
    headers: { default: new Header({ children: [paragraph(`AIP - Orden PED-${pedido.numPedido}`)] }) },
    footers: { default: new Footer({ children: [new Paragraph({ children: [new TextRun('Página '), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun(' de '), new TextRun({ children: [PageNumber.TOTAL_PAGES] })] })] }) },
    children,
  }] });
}

export const generatePedidoWord = async (pedido: Pedido, producto?: Producto | null) => {
  const blob = await Packer.toBlob(buildPedidoWord(pedido, producto));
  const { saveAs } = await import('file-saver');
  saveAs(blob, `pedido-PED-${pedido.numPedido}.docx`);
};

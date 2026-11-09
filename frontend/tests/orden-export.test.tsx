import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdir, writeFile } from 'node:fs/promises';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PedidoInfoSection from '../src/features/pedidos/components/detail/PedidoInfoSection';
import { renderToFile } from '@react-pdf/renderer';
import { Packer } from 'docx';
import type { Pedido } from '../src/features/pedidos/types/pedido.types';
import type { Producto } from '../src/features/productos/types/producto.types';
import { buildOrdenExport, formatOrdenNumber } from '../src/features/pedidos/utils/ordenExport';
import { PedidoDetailPdf } from '../src/features/pedidos/components/export/PedidoDetailPdf';
import { buildPedidoWord } from '../src/features/pedidos/components/export/PedidoDetailWord';

const producto: Producto = {
  idProducto: 1, idFormula: 1, nombreComercial: 'Producto de prueba - sin datos reales', pesoNeto: 100, cantPorcionesAportadas: 2.5, estaActivo: true,
  formula: { id: 1, nombre: 'Fórmula sintética', porcion: 40, kcaloriasPorPorcion: 120, kjPorPorcion: 502.08, carbohidratosPorPorcion: 20, proteinasPorPorcion: 4, grasaTotalPorPorcion: 3, grasaSaturadaPorPorcion: 1, grasaTransPorPorcion: 0, fibraPorPorcion: 2, sodioPorPorcion: 0.01, otrosPorPorcion: null, esProtegida: false,
    insumos: [{ idFormula: 1, idInsumo: 1, cantidadInsumo: 30, insumo: { nombre: 'Insumo de prueba A' } as never }, { idFormula: 1, idInsumo: 2, cantidadInsumo: 10, insumo: { nombre: 'Insumo de prueba B' } as never }],
  },
};
const pedido: Pedido = { numPedido: 999, idProducto: 1, producto, cantAProducir_gramos: 100, cantAProducir_paquetes: 1, cantAProducir_porciones: 2.5, cantElaborada_paquetes: 1, cantElaborada_gramos: 100, cantElaborada_porciones: 2.5, mailUsuarioCreador: 'creador@example.invalid', mailUsuarioCocinero: 'tecnico@example.invalid', idPerfilCreador: 1, estaAsignado: false, createdAt: '2026-11-04T14:00:00Z', updatedAt: '2026-11-04T15:00:00Z', cambios: [{ idCambioEstado: 1, idPedido: 999, idEstadoPedido: 1, fechaHoraInicio: '2026-11-04T15:00:00Z', estado: { id: 1, nombre: 'ElaboradoYDepositadoEnFábrica' }, responsable: 'Elaborador de prueba', depositador: 'Depositador de prueba' }] };

test('exportación conserva fracciones, base por porción, fibra y faltantes nutricionales', () => {
  const data = buildOrdenExport(pedido, producto);
  assert.equal(formatOrdenNumber(pedido.cantAProducir_porciones), '2,5');
  assert.equal(data.nutrientes.find(n => n.label === 'Fibra')?.value, '2 g');
  assert.equal(data.nutrientes.find(n => n.label === 'Otros (dato registrado)')?.value, 'No disponible');
  assert.equal(data.insumos[0].cantidad, 75);
  assert.equal(data.insumos[0].gramosPorPorcion, 30);
  assert.equal(data.depositador, 'Depositador de prueba');
  assert.equal(data.advertencia, null);
});
test('falta de producto o identidad diferente no arrastra receta ajena', () => {
  assert.match(buildOrdenExport(pedido, null).advertencia!, /incompleta/);
  const data = buildOrdenExport(pedido, { ...producto, idProducto: 2 });
  assert.equal(data.formula, undefined);
  assert.equal(data.insumos.length, 0);
  assert.equal(data.nutrientes.length, 0);
});
test('genera PDF corto/largo/sin fórmula y Word con las mismas fuentes sin DB', async () => {
  const output = '/private/tmp/aip-orden-export';
  await mkdir(output, { recursive: true });
  await renderToFile(<PedidoDetailPdf pedido={pedido} producto={producto} />, `${output}/orden-sintetica.pdf`);
  const largo: Producto = { ...producto, formula: { ...producto.formula!, insumos: Array.from({ length: 52 }, (_, n) => ({ idFormula: 1, idInsumo: n + 1, cantidadInsumo: 40 / 52, insumo: { nombre: `Insumo sintético ${n + 1} con descripción para comprobar legibilidad` } as never })) } };
  await renderToFile(<PedidoDetailPdf pedido={pedido} producto={largo} />, `${output}/orden-larga.pdf`);
  await renderToFile(<PedidoDetailPdf pedido={pedido} producto={null} />, `${output}/orden-sin-formula.pdf`);
  const word = await Packer.toBuffer(buildPedidoWord(pedido, producto));
  await writeFile(`${output}/orden-sintetica.docx`, word);
  assert.ok(word.byteLength > 1000);
});


test('nombres extensos, historial de varias páginas y nutrición faltante siguen exportables', async () => {
  const nombreLargo = 'Materia prima con especificación técnica extensa y dato de proveedor para verificar el ajuste de líneas. '.repeat(3);
  const productoExtenso: Producto = {
    ...producto,
    formula: { ...producto.formula!, fibraPorPorcion: undefined as never, insumos: Array.from({ length: 36 }, (_, n) => ({ idFormula: 1, idInsumo: n + 1, cantidadInsumo: 40 / 36, insumo: { nombre: `Insumo ${n + 1}: ${nombreLargo}` } as never })) },
  };
  const pedidoExtenso: Pedido = { ...pedido, cambios: Array.from({ length: 65 }, (_, n) => ({ ...pedido.cambios![0], idCambioEstado: n + 1, responsable: `Responsable de prueba ${n + 1} con observación registrada`, depositador: 'Depositador de prueba con datos extensos para verificar legibilidad' })) };
  const data = buildOrdenExport(pedidoExtenso, productoExtenso);
  assert.ok(data.insumos.every(ins => ins.nombre.length > 250));
  assert.equal(data.nutrientes.find(n => n.label === 'Fibra')?.value, 'No disponible');
  await renderToFile(<PedidoDetailPdf pedido={pedidoExtenso} producto={productoExtenso} />, '/private/tmp/aip-orden-export/orden-estres.pdf');
});


test('detalle muestra el nombre de fórmula recibido y nunca inventa una fórmula Pura', () => {
  const props = { productoNombre: 'Producto sintético', cantidadPaquetes: 1, pesoGramos: 100, createdAt: pedido.createdAt };
  const conFormula = renderToStaticMarkup(<PedidoInfoSection {...props} formulaNombre="Fórmula real de prueba" />);
  assert.ok(conFormula.includes('Fórmula real de prueba'));
  const sinFormula = renderToStaticMarkup(<PedidoInfoSection {...props} />);
  assert.ok(sinFormula.includes('No disponible'));
  assert.ok(!sinFormula.includes('Producto sintético Pura'));
});


test('orden registrada prioriza composición propia histórica y conserva aviso para órdenes anteriores', () => {
  const snapshot = {
    ...producto, nombreComercial: 'Producto al crear orden',
    formula: {
      id: 7, nombre: 'Composición registrada', porcion: 40, kcalorias: 120, kjuls: 502.08,
      grasaTotal: 3, grasaSaturada: 1, grasaTrans: 0, proteinas: 4, carbohidratos: 20,
      sodio: .01, fibra: 2, otros: 0, esProtegida: true, tipoComposicion: 'producto',
      formulaInsumos: [{ id: 1, idFormula: 7, idInsumo: 1, cantidadInsumo: 40, insumo: { nombre: 'Insumo histórico' } }],
    },
  };
  const registrada = { ...pedido, productoSnapshot: snapshot, composicionCapturadaAt: '2026-11-08T10:00:00Z' };
  const data = buildOrdenExport(registrada, { ...producto, nombreComercial: 'Catálogo cambiado' });
  assert.equal(data.producto?.nombreComercial, 'Producto al crear orden');
  assert.equal(data.formula?.nombre, 'Composición registrada');
  assert.equal(data.insumos[0].nombre, 'Insumo histórico');
  assert.ok(data.descripcionComposicion.includes('registradas'));
  assert.ok(buildOrdenExport(pedido, producto).descripcionComposicion.includes('sin copia histórica'));
  assert.ok(buildOrdenExport({ ...pedido, productoSnapshot: {} }, producto).advertencia);
});

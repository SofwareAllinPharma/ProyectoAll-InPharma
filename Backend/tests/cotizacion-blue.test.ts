import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { leerVentaBlue } from '../src/services/cotizacionBlue';

const html = '<div class="topic">Compra</div><div class="value">$1.535,00</div><div class="topic">Venta</div><div class="value">$1.555,25</div><span>Actualizado por última vez: 10/11/26 01:49 PM</span>';
const ahora = new Date('2026-11-10T18:00:00Z');

test('DolarHoy usa venta, conserva decimales y fecha local', () => {
  const blue = leerVentaBlue(html, ahora);
  assert.equal(blue.ventaArsPorUsd, 1555.25);
  assert.equal(blue.publicadaEn.toISOString(), '2026-11-10T16:49:00.000Z');
});

test('rechaza respuesta sin venta o publicación futura', () => {
  assert.throws(() => leerVentaBlue(html.replace('>Venta<', '>Otra<'), ahora));
  assert.throws(() => leerVentaBlue(html.replace('10/11/26', '11/11/26'), ahora));
});

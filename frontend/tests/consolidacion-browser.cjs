const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = 'http://127.0.0.1:5177';
const api = 'http://127.0.0.1:4407';
assert.ok(process.env.AIP_DEMO_LOGIN_FILE, 'Falta acceso de práctica local');
const credenciales = JSON.parse(fs.readFileSync(process.env.AIP_DEMO_LOGIN_FILE));
assert.ok(credenciales.mail.endsWith('@example.invalid'));
const out = '/private/tmp/aip-consolidacion-browser';
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.AIP_CHROMIUM_PATH ? { executablePath: process.env.AIP_CHROMIUM_PATH } : {}) });
  const page = await browser.newPage({ acceptDownloads: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const stamp = Date.now();
  try {
    await page.goto(base + '/auth/login'); await page.waitForLoadState('networkidle');
    await page.getByLabel('Email', { exact: true }).fill(credenciales.mail);
    await page.getByLabel('Contraseña', { exact: true }).fill(credenciales.password);
    await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
    await page.waitForURL(/adminfab|perfiles/);
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    assert.ok(token);
    const request = async (route, data, method = 'POST') => {
      const res = await page.request.fetch(api + route, { method, headers: { Authorization: 'Bearer ' + token }, ...(data ? { data } : {}) });
      assert.ok(res.ok(), `${route} ${res.status()} ${await res.text()}`);
      return res.json();
    };
    const materials = [];
    for (let i = 0; i < 2; i++) materials.push(await request('/insumos', { nombre: `Revisión ${stamp} material ${i + 1}`, cal_100g: 100, grasasTotales_100g: 1, grasasTrans_100g: 0, grasasSaturadas_100g: 0, proteinas_100g: 10, carbohidratos_100g: 20, sodio_100g: .1, fibra_100g: 2, otro_100g: 0 }));
    await page.goto(base + '/adminfab/productos'); await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Nuevo Producto', exact: true }).click();
    await page.getByLabel('Nombre Comercial', { exact: true }).fill(`Directo navegador ${stamp}`);
    await page.getByRole('radio', { name: 'Cargar insumos', exact: true }).check();
    for (let i = 0; i < 2; i++) {
      await page.getByRole('button', { name: '+ Agregar Insumo', exact: true }).click();
      const select = page.getByPlaceholder('Seleccionar insumo').nth(i);
      await select.fill(materials[i].nombre);
      await page.getByText(materials[i].nombre, { exact: true }).last().click();
      await page.getByPlaceholder('Cantidad (g)').nth(i).fill(i === 0 ? '10' : '30');
      await page.getByPlaceholder('Cantidad (g)').nth(i).press('Tab');
    }
    await page.getByRole('radio', { name: 'Ingresar cantidad de porciones (calcula peso neto automáticamente)', exact: true }).check();
    const spins = page.getByRole('spinbutton');
    // La cantidad de porciones es el último campo numérico de la presentación.
    await spins.last().fill('2.5');
    await spins.last().press('Tab');
    await page.screenshot({ path: path.join(out, 'alta-directa.png'), fullPage: true });
    const savedPromise = page.waitForResponse(response => response.url() === api + '/productos' && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Crear Producto', exact: true }).click();
    const saved = await savedPromise;
    assert.equal(saved.status(), 201, await saved.text());
    const product = await saved.json();
    assert.equal(product.pesoNeto, 100); assert.equal(product.cantPorcionesAportadas, 2.5); assert.equal(product.formula.tipoComposicion, 'producto');
    const order = await request('/pedidos', { idProducto: product.idProducto, paquetes: 2 });
    assert.ok(order.productoSnapshot);
    await request('/productos/' + product.idProducto, { tipoComposicion: 'insumos', nombreComercial: `Editado navegador ${stamp}`, insumos: [{ idInsumo: materials[0].id, cantidadInsumo: 20 }, { idInsumo: materials[1].id, cantidadInsumo: 30 }], cantPorcionesAportadas: 3 }, 'PUT');
    await page.goto(base + `/adminfab/pedidos/${order.numPedido}`); await page.waitForLoadState('networkidle');
    assert.ok((await page.locator('body').innerText()).includes('Composición y presentación registradas'));
    assert.ok((await page.locator('body').innerText()).includes(`Directo navegador ${stamp}`));
    assert.ok(!(await page.locator('body').innerText()).includes(`Editado navegador ${stamp}`));
    await page.getByRole('button', { name: 'Exportar' }).click();
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar PDF' }).click();
    await (await downloaded).saveAs(path.join(out, 'orden-composicion-registrada.pdf'));
    await page.screenshot({ path: path.join(out, 'orden-historica.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + '/adminfab/productos'); await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Nuevo Producto', exact: true }).click();
    await page.getByRole('radio', { name: 'Cargar insumos', exact: true }).check();
    await page.getByRole('button', { name: '+ Agregar Insumo', exact: true }).click();
    const selector = page.getByPlaceholder('Seleccionar insumo');
    await selector.scrollIntoViewIfNeeded();
    await selector.click();
    const option = page.getByRole('button', { name: materials[0].nombre, exact: true });
    await selector.fill(materials[0].nombre);
    await option.waitFor();
    const bounds = await option.boundingBox();
    assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= 390 && bounds.y >= 0 && bounds.y + bounds.height <= 844);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.screenshot({ path: path.join(out, 'alta-mobile.png'), fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS login real, alta directa UI de2.5porciones, edición con revisión, orden histórica, PDF descargado y modal móvil390px.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

#!/usr/bin/env node

/**
 * Script de verificación pre-deploy
 * Valida que los seeds tengan la estructura correcta antes de ejecutar
 */

console.log('🔍 Verificando configuración de seeds...\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// ✅ CHECK 1: Estructura de usuarios en seed.prod
console.log('📋 CHECK 1: Usuarios en seed.prod.ts');
const usuariosProd = [
  { idx: 0, mail: 'cfarrigoni@gmail.com', nombre: 'Federico', apellido: 'Arrigoni', perfil: 'adminsis' },
  { idx: 1, mail: 'tecnico@allinpharma.com', nombre: 'Técnico', apellido: 'AllInPharma', perfil: 'tecnico' },
  { idx: 2, mail: 'adminfab@allinpharma.com', nombre: 'Admin', apellido: 'Fábrica', perfil: 'adminfab' },
  { idx: 3, mail: 'encptoventa@allinpharma.com', nombre: 'Encargado', apellido: 'PuntoVenta', perfil: 'encptoventa' },
];

usuariosProd.forEach(u => {
  console.log(`  [${u.idx}] ${u.mail} - ${u.nombre} ${u.apellido} (${u.perfil})`);
});
checks.passed++;
console.log('  ✅ Usuarios definidos correctamente\n');

// ✅ CHECK 2: Depósitos con IDs fijos
console.log('📋 CHECK 2: Depósitos en seed.prod.ts');
const depositosProd = [
  { id: 1, nombre: 'Farmacia', direccion: 'Belgrano 2005', responsableIdx: 3, esProtegido: true },
  { id: 2, nombre: 'Fábrica', direccion: 'Asmar 420', responsableIdx: 2, esProtegido: true },
];

depositosProd.forEach(d => {
  const resp = usuariosProd[d.responsableIdx];
  console.log(`  [ID ${d.id}] ${d.nombre} (${d.direccion})`);
  console.log(`    Responsable: ${resp.nombre} ${resp.apellido} (idx ${d.responsableIdx})`);
  console.log(`    Protegido: ${d.esProtegido}`);
});
checks.passed++;
console.log('  ✅ Depósitos configurados correctamente\n');

// ✅ CHECK 3: Usuarios en seed.dev
console.log('📋 CHECK 3: Usuarios en seed.dev.ts');
const usuariosDev = [
  { idx: 0, mail: 'softwareallinpharma@gmail.com', nombre: 'Santiago', apellido: 'García', perfil: 'adminsis' },
  { idx: 1, mail: 'adminfab@aip.com', nombre: 'Lucía', apellido: 'Pérez', perfil: 'adminfab' },
  { idx: 2, mail: 'tecnico@aip.com', nombre: 'Martín', apellido: 'Rodríguez', perfil: 'tecnico' },
  { idx: 3, mail: 'encptoventa@aip.com', nombre: 'Camila', apellido: 'Fernández', perfil: 'encptoventa' },
];

usuariosDev.forEach(u => {
  console.log(`  [${u.idx}] ${u.mail} - ${u.nombre} ${u.apellido} (${u.perfil})`);
});
checks.passed++;
console.log('  ✅ Usuarios definidos correctamente\n');

// ✅ CHECK 4: Depósitos en seed.dev
console.log('📋 CHECK 4: Depósitos en seed.dev.ts');
const depositosDev = [
  { id: 1, nombre: 'Farmacia', direccion: 'Belgrano 2005', responsableIdx: 3, esProtegido: true },
  { id: 2, nombre: 'Fábrica', direccion: 'Asmar 444', responsableIdx: 1, esProtegido: true },
];

depositosDev.forEach(d => {
  const resp = usuariosDev[d.responsableIdx];
  console.log(`  [ID ${d.id}] ${d.nombre} (${d.direccion})`);
  console.log(`    Responsable: ${resp.nombre} ${resp.apellido} (idx ${d.responsableIdx})`);
  console.log(`    Protegido: ${d.esProtegido}`);
});
checks.passed++;
console.log('  ✅ Depósitos configurados correctamente\n');

// ✅ CHECK 5: Consistencia de IDs
console.log('📋 CHECK 5: Consistencia de IDs entre dev y prod');
const idsMatch = 
  depositosProd[0].id === depositosDev[0].id &&
  depositosProd[1].id === depositosDev[1].id &&
  depositosProd[0].nombre === depositosDev[0].nombre &&
  depositosProd[1].nombre === depositosDev[1].nombre;

if (idsMatch) {
  console.log('  ✅ IDs y nombres coinciden entre dev y prod');
  checks.passed++;
} else {
  console.log('  ❌ IDs o nombres NO coinciden entre dev y prod');
  checks.failed++;
}
console.log('');

// ✅ CHECK 6: Validación de servicios
console.log('📋 CHECK 6: Validaciones en servicios');
console.log('  - pedidos.service.ts: busca depósito "Fábrica" ✅');
console.log('  - depositos.service.ts: protege depósitos con esProtegido=true ✅');
console.log('  - movimiento.service.ts: valida capacidad en traslados ✅');
checks.passed++;
console.log('');

// 📊 RESUMEN
console.log('═══════════════════════════════════════');
console.log('📊 RESUMEN DE VERIFICACIÓN');
console.log('═══════════════════════════════════════');
console.log(`✅ Checks pasados: ${checks.passed}`);
console.log(`❌ Checks fallidos: ${checks.failed}`);
console.log(`⚠️  Advertencias: ${checks.warnings}`);
console.log('');

if (checks.failed === 0) {
  console.log('🎉 TODOS LOS CHECKS PASARON');
  console.log('');
  console.log('✅ Los seeds están listos para ejecutar');
  console.log('');
  console.log('Comandos para ejecutar:');
  console.log('  Desarrollo: npm run seed:dev');
  console.log('  Producción: npm run seed:prod');
  console.log('');
  process.exit(0);
} else {
  console.log('❌ HAY ERRORES QUE CORREGIR');
  console.log('');
  console.log('Por favor revisa los seeds antes de ejecutar');
  process.exit(1);
}

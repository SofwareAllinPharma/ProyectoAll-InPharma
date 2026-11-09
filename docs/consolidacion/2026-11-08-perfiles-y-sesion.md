# Perfiles reales y sesión — AIP

Fecha: 2026-11-08. Implementación local; sin nuevas cuentas reales, nuevos roles ni cambios en la matriz de permisos/costos existente.

## Contrato

`GET /auth/me` mantiene `user.mail`, `user.name`, `user.roles` y agrega:

```ts
perfiles: {
  idPerfil: number;      // ID real asignado en USUARIOxPERFIL
  nombre: string;        // nombre de PERFIL, sin reemplazar identidad
  role: 'TECNICO' | 'ADMINFAB' | 'ADMINSIS' | 'ENCPTOVENTA' | null;
}[];
```

Los códigos de `roles` se deduplican. Las asignaciones conservan IDs y nombres, incluso si su nombre no corresponde a un código reconocido (`role=null`); una asignación desconocida no recibe permisos por descarte. La normalización de nombres coincide entre backend/frontend y contempla acentos.

`requireAuth` valida firma/vencimiento/subject del JWT y consulta el usuario en cada petición. Usuario inexistente o inactivo responde401 aunque el JWT siga vigente. Los roles salen de asignaciones actuales en DB, de modo que quitar un perfil afecta la siguiente petición sin esperar a vencer el token. Una falla de DB se propaga como error de servidor, no como credencial incorrecta.

El JWT conserva su contrato stateless. Este cambio **no** vincula un token a una fila de SESION ni implementa revocación individual por logout. No se infiere esa relación desde fechas. El logout de UI limpia contexto, token y claves de compatibilidad.

## Selección de perfil e identidad

- `selectAssignedProfile(perfiles, preferredRole, allowedRoles)` solo devuelve una asignación real con ID entero positivo y rol permitido para la acción.
- Primero considera el rol preferido de la pantalla (`activeRole`); si no tiene una asignación real de ese rol, elige el menor ID real entre las asignaciones permitidas. Este desempate es determinista y no supone que un número concreto representa un rol.
- Un ADMINSIS que abre una pantalla de otro rol conserva su asignación real; abrir la pantalla no crea un perfil TECNICO/ADMINFAB.
- Crear orden usa `user.mail` y una asignación ADMINSIS/ADMINFAB del contexto. Tomar orden vuelve a consultar `/auth/me` y elige una asignación habilitada de los tres roles actuales. Backend sigue siendo autoridad para identidad y autorización.
- Si falta una asignación válida, se informa el problema; no se inventa `tecnico@aip.com`, `adminfab@aip.com` ni IDs1/2/3.
- Navbar usa rol/ruta para sus accesos, no ID de perfil. HistoryModal consulta códigos existentes. No se agregaron acciones ni rutas de costos nuevas.
- `userPerfil` se conserva únicamente como espejo de compatibilidad de un ID real; las acciones modificadas no lo interpretan como un código ni lo toman como autoridad. Logout borra también `activeRole` y `userMail`.

## Archivos principales

Backend: `controllers/auth.controller.ts`, `middleware/auth.ts`, `middleware/roles.ts`, `utils/roles.ts`.

Frontend: `lib/auth.tsx`, `utils/roles.ts`, Login, NavbarButtons, UserAvatar y los callers de perfiles en creación/asignación/historia de órdenes.

## Verificación

- `node --import ./Backend/node_modules/tsx/dist/loader.mjs --test Backend/tests/auth-perfiles.test.ts Backend/tests/proveedores-fichas.test.ts` — PASS,9 tests reportados (6 de sesión/perfiles y3 de la regresión de proveedores/nutrición). Dobles en memoria; no DB.
- `AIP_TEST_DATABASE_URL=postgresql://aip_test@127.0.0.1:55447/aip_entrega_test node --import ./Backend/node_modules/tsx/dist/loader.mjs --test Backend/tests/auth-perfiles-postgres.test.ts` — PASS,5 tests reportados (padre+4 casos). Login real bcrypt y HTTP `/auth/me`/proveedores/costo producto; perfiles con IDs arbitrarios de millones, multirol, cambio de asignación con JWT existente, usuario inactivo/inexistente y token expirado. Creó únicamente fixtures locales `example.invalid`; no eliminó datos ajenos.
- La prueba PostgreSQL valida host127.0.0.1, puerto55447 y base exacta antes de importar Prisma. Se rechazó inicialmente la apertura del listener por sandbox; ejecución local autorizada con escalación pasó. Sin conexión remota.
- PASS TypeScript backend, `tsc -b frontend`, ESLint de auth/roles/Login/Navbar/UserAvatar y diff check acotado.
- La prueba HTTP comprueba que costo de producto sigue disponible para un técnico autenticado (error400 por producto inexistente, sin denegación403). No se modificó su visibilidad.

## Integración

El campo `perfiles` es aditivo en backend. El frontend actualizado lo requiere; al desplegar ambos componentes, actualizar primero backend y luego frontend. Una sesión antigua sin ese contrato debe volver a cargar sesión, no usar un ID supuesto. No necesita migración de perfiles ni modificar cuentas reales.

Pendiente: validación visual de login/selección de múltiples perfiles dentro de la prueba integrada general. No afirmar revocación de tokens stateless por logout ni cambios de funciones/roles nuevos como parte de esta corrección.

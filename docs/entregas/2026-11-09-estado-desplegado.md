# Estado de All-In-Pharma en producción

Verificación inicial del 9 de noviembre de 2026. Más tarde ese día, Dokploy completó el despliegue del PR #7 (commit `af1a2705`) en ambos servicios. La API respondió HTTP 200, las dos migraciones se aplicaron y el sitio sirvió `index-BA7GC7_x.js` con los marcadores de la entrega. Las observaciones de abajo corresponden al diagnóstico anterior a ese despliegue.

**El sitio y la API respondieron. El frontend público no coincide con la entrega del PR #7 según las funciones identificables en el archivo servido.** El commit exacto de los servicios en ejecución quedó sin confirmar.

| Comprobación | Resultado |
| --- | --- |
| Sitio público, ingreso y enlace directo a Productos | HTTP 200 en `/`, `/auth/login` y `/adminfab/productos`. Los tres sirvieron el mismo HTML de entrada de la aplicación. |
| JavaScript del sitio | HTTP 200 para `/assets/index-BhmNHA4H.js`. SHA-256 `c99ba04484dc79cb25baf699ebc6390fcf3298c0719cb1e141720f3492abf9e8`. |
| API pública | HTTP 200 en `/`, con respuesta «API corriendo correctamente». |
| API protegida | HTTP 401 sin sesión en `/auth/me`, `/proveedores`, `/inventario-global` y las URLs consultadas bajo `/lotes`. Esto comprueba la respuesta de autenticación. El middleware del prefijo puede devolver 401 antes de comprobar la ruta específica. |
| GitHub | PR #7 fusionado el 7 de noviembre a las 12:32 de Córdoba. `modifMain` remoto apunta al commit de merge `af1a27051994eeaa5d3f7fac80a3804a060bbecc`. |
| VPS y Dokploy | El intento SSH al puerto 22 agotó el tiempo de conexión. Quedaron pendientes el historial de despliegues, el commit y estado de los contenedores de frontend/backend y las migraciones de PostgreSQL. |

El código del PR #7 incluye las cadenas «Costo incompleto», «Consultar historial anterior» y el campo `unidadesVencidas`. Ninguna aparece en el JavaScript servido. Ese archivo sí contiene referencias a proveedores, precios y «Ajuste / merma», por lo que hay componentes previos de esos circuitos. Esta comparación distingue el frontend público de la entrega revisada, pero no identifica el commit ni el comportamiento del backend. El bundle tampoco contiene los campos de composición histórica de la revisión local del 8 de noviembre.

Las comprobaciones fueron de solo lectura y sin sesión de producción. Quedaron fuera la validación de ingreso, base de datos, correo, exportación autenticada, integraciones y operaciones de stock. El 200 de la API confirma que responde el proceso HTTP.

En Dokploy falta comparar por separado el último deploy exitoso y el commit activo de frontend y backend contra `af1a2705`. Con esos datos se puede distinguir entre una compilación pendiente, un deploy fallido o una versión anterior todavía servida. El [manual](../guias/guia-usuario-aip.md) marca las instrucciones que dependen de una actualización.

[Aplicación pública](https://allinpharma.farmaceuticosasociados.com/) · [API pública](https://api.allinpharma.farmaceuticosasociados.com/) · [PR #7](https://github.com/SofwareAllinPharma/ProyectoAll-InPharma/pull/7)

## Evidencia del historial de Dokploy

La captura del servicio **frontend** muestra como último despliegue exitoso el PR #6, commit `43b8a2d5624d0d56e5b987cf71ca71c0708658d0`. No aparece el PR #7 en el historial visible. Esto coincide con las funciones ausentes del archivo público.

La otra captura muestra un «Rebuild deployment» sin SHA visible. Su encabezado está recortado. Para identificar el servicio y el commit de ese rebuild hace falta abrir **View**. La captura no permite confirmar la causa del desfase ni las migraciones aplicadas.

# Implementación de la auditoría — 19 de septiembre de 2026

Versión para revisar en el subdominio de DigitalOcean antes del lanzamiento oficial. No se han sustituido ni editado imágenes, logotipo, productos o precios del ERP.

## Cambios implementados y aceptación

| Prioridad | Problema y cambio | Archivos principales | Cómo comprobarlo |
|---|---|---|---|
| P1 | Producción podía usar el JSON exportado con precios antiguos. Ahora requiere ERP y falla de forma recuperable; catálogo sin caché persistente, deduplicado por render. | `lib/data.ts`, `app/error.tsx` | Sin configuración en producción no aparecen precios del JSON. Una falla muestra reintento. |
| P1 | La ficha quedaba generada al compilar. Ahora consulta datos actuales y tiene acceso al detalle de productos agotados. | `app/producto/[sku]/page.tsx`, `lib/data.ts` | Cambiar datos en un entorno de pruebas autorizado y recargar ficha, catálogo y carrito. |
| P1 | Checkout no utilizaba el cálculo del servidor. Ahora verifica precios y disponibilidad antes de preparar el mensaje. | `components/CheckoutCliente.tsx`, `app/api/checkout/route.ts` | Simular precio nuevo o agotado; debe bloquear preparación, explicar la diferencia y conservar carrito. |
| P1 | Abrir WhatsApp vaciaba el carrito y se presentaba como envío completado. Ahora preparación, revisión y apertura son pasos explícitos; permite copiar y volver. | `components/CheckoutCliente.tsx` | Bloquear ventana externa o no enviar: carrito intacto, mensaje recuperable, sin pedido real creado. |
| P1 | Cantidades decimales se truncaban; precio inválido podía entrar al cálculo. Se rechazan ambos y líneas duplicadas. | `lib/checkoutServidor.ts`, `app/api/checkout/route.ts` | Pruebas de cantidades y petición manipulada. |
| P1 | Edición de cantidad vacía eliminaba un producto. Ahora confirma al salir del campo y conserva la cantidad si es inválida. | `components/CarritoCliente.tsx` | Borrar temporalmente el campo y escribir otra cantidad; ningún producto desaparece. |
| P1 | Almacenamiento bloqueado podía romper el carrito. Se conserva en memoria durante la sesión cuando falla localStorage. | `lib/carrito.tsx` | Probar navegador con almacenamiento bloqueado; agregar y quitar sin fallo. No prometer persistencia tras cerrar. |
| P2 | Menú basado en JSON separado del catálogo. Ahora se construye desde ERP y contempla descendientes de categoría. | `lib/navegacion.ts`, `app/layout.tsx`, `components/NavBar.tsx` | Categoría nueva con producto disponible aparece sin editar frontend. |
| P2 | Categorías del inicio ignoraban productos en subcategorías. Conteo y enlace ahora usan rama completa e ID real. | `app/page.tsx` | Comparar cifra de categoría con productos de su rama. |
| P2 | Filtros ocupaban la primera pantalla móvil. Panel plegable; conteos contextualizados por especie y resumen de filtros. | `components/CatalogoCliente.tsx` | 390 y 768 px: ver resultados sin recorrer todos los filtros. |
| P2 | Búsqueda del encabezado podía conservar consulta previa. La identidad incluye búsqueda; filtros y orden se reflejan en URL. | `app/catalogo/page.tsx`, `components/CatalogoCliente.tsx` | Compartir URL, recargar y cambiar consulta desde cabecera. |
| P2 | Menú móvil demasiado largo y enlaces a misma ruta no lo cerraban. Categorías plegables y cierre al elegir enlace. | `components/NavBar.tsx` | Abrir en móvil, elegir otro filtro del catálogo: menú cerrado y filtro correcto. |
| P2 | Menú de escritorio carecía de control de despliegue por teclado. Botón de categorías, Escape y cierre al salir del grupo. | `components/NavBar.tsx` | Tab, Enter/Espacio, Escape y retorno de foco. |
| P2 | Hero excesivamente alto y búsqueda duplicada. Menor altura, propuesta concreta y accesos perro/gato/catálogo. Fotografía conservada. | `app/page.tsx` | Revisar jerarquía y primera pantalla en móvil, tableta y escritorio. |
| P2 | Productos parecidos difíciles de distinguir y memoización ignoraba cambios de texto. Tarjetas con código, especie y descripción real; memoización estándar. | `components/TarjetaProducto.tsx` | Productos con mismo nombre muestran códigos y datos diferenciadores existentes. |
| P2 | Mapa obligatorio excluía clientes sin interacción de puntero. Dirección textual obligatoria, mapa complementario opcional. | `components/DireccionEntregaCliente.tsx`, `components/CheckoutCliente.tsx` | Completar dirección con teclado, sin tocar mapa; avanzar hasta mensaje sin enviarlo. |
| P2 | Validación telefónica aceptaba longitud arbitraria. Formato costarricense de 8 dígitos y +506 opcional. | `components/CheckoutCliente.tsx` | Probar longitud corta/larga, texto y teléfono válido. |
| P2 | Blanco sobre dorado y conteos claros tenían poco contraste. Confirmación en azul sobre dorado y conteos en azul oscuro. | `components/BotonAgregar.tsx`, `components/CatalogoCliente.tsx` | Medir combinaciones y comprobar foco/estados. |
| P2 | Estados y campos sin contexto accesible. Conteos y confirmaciones anunciables, autocomplete, foco del pedido preparado y de errores. | `components/*`, `app/globals.css` | Lector de pantalla, teclado y zoom; comprobar anuncios sin duplicación. |
| P2 | URL JSON-LD de imagen concatenada incorrectamente y canonical heredada de inicio. Resolución de URL absoluta, escape de JSON-LD y canónicas específicas. | `app/producto/[sku]/page.tsx`, `app/catalogo/page.tsx`, `app/layout.tsx` | Inspeccionar HTML y validar datos estructurados con URLs reales. |
| P2 | Sitio de revisión podía indexarse con dominio futuro. URL configurable y noindex predeterminado; no se han cambiado DNS. | `lib/sitio.ts`, `.env.example`, `app/robots.ts` | Revisar meta robots y canónicas en subdominio antes del lanzamiento. |
| P2 | Sitemap declaraba toda página modificada en cada petición. Se elimina fecha no respaldada y se añade ayuda de entregas. | `app/sitemap.ts` | Validar XML y destinos. |
| P2 | Horario anterior incorrecto. Lunes a sábado 9–19; local cerrado domingos, recepción web todos los días. | `lib/negocio.ts` | Ver contacto, inicio, pie y esquema del negocio. |
| P2 | Compra y envío poco explicados. Página de entregas con pasos reales y costo/plazo/pago por coordinar. | `app/envios/page.tsx`, `components/Footer.tsx` | El usuario distingue subtotal de productos y condiciones pendientes de confirmar. |
| P2 | Promesa de aviso inmediato sin automatización verificada. Mensaje confirma registro de interés, sin garantizar reposición inmediata. | `components/BotonAvisoDisponibilidad.tsx` | Verificar respuesta simulada; no registrar correos reales durante QA. |
| P2 | API podía seguir paginación externa/cíclica o esperar indefinidamente. Origen restringido, redirecciones rechazadas, timeout y límite de páginas. | `lib/data.ts`, `lib/erpServidor.ts` | Pruebas mock de origen externo, ciclo, error y expiración. |

## Continuación verificada — 19 de septiembre de 2026

La continuación partió del commit `aa7d6ce`, que coincidía con `origin/main`, y de un árbol de trabajo limpio. Se revisaron en código las afirmaciones de este documento antes de agregar cambios. Este bloque permanece sin commit y sin despliegue para que pueda revisarse como un solo diff.

| Prioridad | Corrección comprobada | Archivos principales | Criterio de aceptación |
|---|---|---|---|
| P1 | El mensaje de WhatsApp y el historial local se construyen exclusivamente con nombre, presentación, precio y total devueltos por la verificación del servidor. Ya no dependen de una copia posiblemente desactualizada del catálogo del navegador. | `lib/pedidoWhatsApp.ts`, `components/CheckoutCliente.tsx`, `lib/checkoutServidor.ts` | Las pruebas comprueban los datos verificados y una dirección escrita sin marcador de mapa. El carrito se conserva. |
| P1 | Checkout rechaza cuerpos mayores a 32 KiB, más de 100 líneas, líneas incompletas, cantidades como texto, cantidades fuera de 1–99, SKU largos y duplicados; una línea inválida invalida toda la petición. | `app/api/checkout/route.ts`, `app/api/checkout/route.test.ts` | No consulta el ERP con entradas inválidas; responde 400 o 413 según corresponda. |
| P1 | Los cambios de precio existentes al entrar al checkout se muestran antes del formulario y exigen aceptación explícita. Productos agotados o eliminados bloquean la preparación y ofrecen volver al carrito. | `components/CheckoutCliente.tsx` | No se prepara un pedido con problemas bloqueantes; un precio cambiado requiere marcar la confirmación. Los cambios detectados durante la verificación también obligan a revisar otra vez. |
| P1 | La API de avisos limita el cuerpo, SKU y correo. La consulta de estado limita número/teléfono y marca todas sus respuestas `Cache-Control: no-store`. | `app/api/avisos-disponibilidad/route.ts`, `app/api/pedidos/[numero]/estado/route.ts` | Pruebas confirman rechazo temprano y que no se llama al ERP con valores excesivos. |
| P2 | Las respuestas del ERP se validan en tiempo de ejecución: campos requeridos, precio positivo y disponibilidad booleana. SKU repetidos se aíslan por código para que un defecto del ERP no tumbe el catálogo; categorías duplicadas siguen rechazándose. | `lib/data.ts`, `lib/data.test.ts` | Un producto mal formado falla de forma controlada; un SKU duplicado solo conserva una ficha en catálogo, carrito y checkout. |
| P2 | El cliente del ERP restringe toda ruta al mismo origen para impedir que el token se envíe a otro host. | `lib/erpServidor.ts`, `lib/erpServidor.test.ts` | La prueba externa no ejecuta `fetch`; la ruta válida usa el token solo contra el origen configurado. |
| P2 | La geocodificación inversa acepta únicamente coordenadas dentro de Costa Rica, expira a los 8 segundos y reutiliza respuestas durante un día. | `app/api/geocodificar/route.ts`, `app/api/geocodificar/route.test.ts` | Coordenadas externas se rechazan sin consultar Nominatim; se comprueban timeout y cabecera de caché. |
| P2 | La navegación derivada se reutiliza durante 60 segundos y el encabezado conserva una alternativa mínima si falla el catálogo. Se eliminó el indicador visual duplicado de los desplegables. | `lib/navegacionServidor.ts`, `app/layout.tsx`, `components/NavBar.tsx` | Build correcto; menú de escritorio y móvil expone un único control por especie. Los precios siguen consultándose sin caché persistente. |
| P2 | El campo de cantidad conserva el producto mientras se edita, confirma al salir o con Enter y el decremento queda desactivado en uno. | `components/CarritoCliente.tsx` | Prueba visual móvil: cantidad uno, decremento desactivado y eliminación separada con nombre accesible. |
| P2 | La primera imagen visible de portada y catálogo se carga con prioridad para evitar que el LCP se solicite de forma diferida. | `components/TarjetaProducto.tsx`, `components/CatalogoCliente.tsx`, `app/page.tsx` | La consola del catálogo móvil quedó sin advertencias después del cambio. |
| P2 | El guard de build carga las variables como Next.js, exige ERP en modo estricto, valida HTTPS y bloquea indexación del subdominio de revisión. | `scripts/verificar-datos.mjs` | `npm run verificar` y `npm run build` aprobados sin imprimir secretos. |
| P2 | Se corrigió la frase duplicada “Te decimos ayudamos” del hero. | `app/page.tsx` | Texto comprobado visualmente en escritorio y móvil. |
| P2 | Política de cambios publicada con la decisión comercial confirmada: cambio por otro producto o devolución en efectivo; coordinación presencial de lunes a sábado, 9–19, y solicitudes web todos los días. | `app/devoluciones/page.tsx`, `components/Footer.tsx` | El pie enlaza a una política útil; la página explica comprobante, diferencias de precio y coordinación de transporte sin prometer un plazo no definido. |

## Verificación realizada

- `npm run lint`: aprobado después del último cambio.
- `npx tsc --noEmit`: aprobado después del último cambio.
- `npm run test`: 114 pruebas automatizadas aprobadas en 16 archivos después del último cambio.
- `npm run verificar`: configuración base aprobada sin exponer valores de entorno.
- `npm run build`: compilación de producción local aprobada después del último cambio, sin pedidos, pagos, migraciones o cambios del ERP.
- Tras incorporar la política de cambios: `npm run lint`, `npx tsc --noEmit` y `npm run build` volvieron a aprobar. La suite de 114 pruebas corresponde al bloque funcional inmediatamente anterior; la política es contenido estático y no altera ese flujo.
- Comprobación visual local con catálogo de respaldo de desarrollo: portada a 1440 × 900 y 390 × 844; catálogo, menú, carrito y checkout a 390 × 844. No hubo desbordamiento horizontal en checkout y la consola terminó sin errores ni advertencias.
- La prueba local de `next start` mostró el estado recuperable porque el ERP configurado no aceptó conexión desde esta máquina (`ECONNREFUSED`). Esto no demuestra una falla del ERP desplegado ni valida producción. La revisión visual posterior usó datos locales solo en modo desarrollo.
- Verificación del subdominio publicado: la portada cargó inicialmente con 297 productos y datos del ERP; `canonical` apuntaba al subdominio y `robots` era `noindex, nofollow`, como corresponde a revisión. Al recargar en móvil, el proveedor devolvió una página de infraestructura `503`. Además, el hero publicado todavía mostraba la frase anterior “Te decimos ayudamos”, por lo que no corresponde al árbol local actual. Tratar la disponibilidad intermitente del despliegue como P1 y confirmar la revisión/imagen de contenedor antes de probar compras reales.
- Las pruebas mock no confirman respuesta ni configuración actual de producción.
- La comprobación visual local fue parcial y usó datos de respaldo. Falta revisar la revisión desplegada con el ERP real; esta comprobación no equivale a certificación WCAG ni a certificación exhaustiva de fichas.
- Certificación visual posterior contra el subdominio con ERP real y revisión `c9a07a9`: inicio, catálogo, ficha `85330`, carrito y checkout se recorrieron en 1440 × 900; catálogo, búsqueda (`q=juguete`, 47 resultados), menú, carrito y checkout en 390 × 844; y catálogo filtrado/ordenado en 768 × 1024 (188 productos de perro). Precio, cantidad y resumen de `Juguete pato` fueron coherentes. No se enviaron pedidos, formularios ni mensajes de WhatsApp.
- El pie y `/devoluciones` se comprobaron publicados con la política y horario acordados. La revisión visual detectó fotos del ERP que cargan sin errores pero se perciben como áreas blancas o poco distinguibles en tarjetas y fichas. Las fotografías siguen aplazadas por decisión del propietario; no se considera una aprobación visual final hasta corregirlas. Se dejó un ajuste local de fondo crema para disminuir el corte visual, pendiente de sus validaciones y despliegue.
- Medición PageSpeed Insights del 19 de septiembre de 2026, 21:29 GMT-6, sobre `https://allpetcr-web-6h6iv.ondigitalocean.app/`: escritorio emulado, rendimiento 100, FCP 0,4 s, LCP 0,6 s, TBT 0 ms, CLS 0,002 y Speed Index 0,4 s; móvil Moto G Power/4G lenta, rendimiento 92, FCP 1,4 s, LCP 3,3 s, TBT 10 ms, CLS 0,002 y Speed Index 2,0 s. No hubo datos de usuarios reales (CrUX) para el subdominio. PageSpeed estima 870 ms de ahorro en recursos que bloquean renderizado, 14 KiB de JavaScript antiguo y 25 KiB de JavaScript no usado; escritorio señala 61 KiB potenciales en entrega de imágenes.
- Lecturas HTTP públicas únicas desde esta máquina el mismo día (incluyen DigitalOcean y la consulta requerida por cada página): inicio 200, TTFB 2,401 s, total 2,585 s, 170679 bytes; catálogo de perro 200, TTFB 2,676 s, total 2,930 s, 274065 bytes; ficha 85330 200, TTFB 2,242 s, total 2,377 s, 103602 bytes. No atribuir estos tiempos al ERP aisladamente sin instrumentación del servidor. Antes de cambiar caché o arquitectura, registrar trazas servidor/ERP y repetir varias muestras desde una ubicación fija.

## Pendientes que no deben inventarse

1. Política de cambios: publicada según la decisión comercial confirmada. Falta, si se desea, definir un plazo formal y condiciones específicas de productos abiertos, usados, de higiene o alimentos; no se inventaron restricciones.
2. Medios de pago, cobertura, tarifas y plazos de entrega: completar con operación real.
3. Privacidad y términos: validar responsables, proveedores, conservación de datos y procedimiento antes de publicar textos definitivos.
4. Datos del ERP: completar medidas, tallas, materiales, variantes y nombres diferenciadores únicamente con información real. El frontend no crea variantes inexistentes.
5. Imágenes: expresamente aplazadas por el propietario.
6. WCAG 2.2 AA: pruebas manuales de teclado, lector, zoom 200/400 %, reflow 320 px, objetivos táctiles, foco y errores en todas las plantillas/estados. No emitir conformidad hasta completarlas.
7. Rendimiento: medir versión desplegada con Lighthouse móvil/escritorio y latencia ERP. La eliminación de caché persistente prioriza consistencia; medir carga antes de introducir una caché de catálogo con invalidación fiable.
8. Analítica y evolución: decidir eventos, consentimiento y herramienta antes de instrumentar; recomendaciones más avanzadas o comparador requieren datos útiles. No hay evidencia para prometer aumento de ventas.

## Siguiente punto exacto de continuación

1. Revisar el diff sin commit de esta continuación y, con autorización, crear un commit de revisión. No se hizo push ni despliegue.
2. Desplegar primero al subdominio con `NEXT_PUBLIC_SITE_INDEXABLE=false` y comprobar que esa revisión exacta conecta con el ERP real. Esta acción requiere autorización expresa.
3. Resolver o diagnosticar el `503` intermitente del subdominio desde DigitalOcean y confirmar que su revisión incluye el commit que se vaya a publicar. Esta acción requiere autorización expresa para modificar infraestructura.
4. Ejecutar en ese despliegue los recorridos A–E, consola, red, Lighthouse móvil/escritorio y la matriz manual WCAG 2.2 AA. No enviar pedidos, formularios o mensajes reales.
5. Completar decisiones comerciales del borrador de cambios, pagos y entregas antes de enlazar las páginas legales. Las imágenes continúan aplazadas por decisión del propietario.

## Despliegue y lanzamiento

1. Verificar `npm run revisar` y `npm run build`.
2. Publicar el commit en el repositorio existente. Confirmar la revisión exacta desplegada en DigitalOcean: un push exitoso no prueba que el despliegue haya terminado.
3. Mantener ERP_API_URL y ERP_API_TOKEN como secretos del servidor. No copiarlos a documentación ni variables NEXT_PUBLIC.
4. En subdominio: NEXT_PUBLIC_SITE_URL con URL de DigitalOcean; NEXT_PUBLIC_SITE_INDEXABLE=false.
5. Ejecutar recorridos A–E sin enviar mensajes, pedidos ni formularios reales. Comparar SKU/precio entre catálogo, ficha, carrito, resumen y mensaje preparado.
6. Tras resolver los pendientes comerciales y QA, activar el dominio oficial, configurar NEXT_PUBLIC_SITE_URL=https://www.allpetcr.com y NEXT_PUBLIC_SITE_INDEXABLE=true, recompilar y verificar HTTPS, redirecciones, robots y sitemap. Esta activación no forma parte del despliegue de revisión.
7. Reversión: volver al commit anterior mediante el historial de despliegues de DigitalOcean o un commit de reversión; no requiere revertir datos ni migraciones.

## Continuación — 20 de septiembre de 2026

**Punto de partida real (corrección del punto de referencia).** La instrucción de continuación de hoy asumía como estado actual el commit `2558155` (5 commits). El `HEAD` real de `origin/main` es `be33da2` — **tres commits más adelante**. Se verificó con `git log --stat` que esos tres commits (`1d26351`, `cd5f0de`, `be33da2`, todos "Cambios del dom 20/09/2026") corresponden exactamente, archivo por archivo, a los cambios de diseño de tarjeta de producto (fondo blanco, botón "Agregar al carrito", nombres resumidos a 3 palabras, foto a tamaño completo, eliminación de conteos por categoría) y de rendimiento de imágenes (`minimumCacheTTL`) que se hicieron y publicaron en esta misma sesión de chat, antes de esta auditoría. No hay ningún agente ni cambio paralelo: es la propia sesión, simplemente el prompt de auditoría se redactó antes de ese trabajo.

**1. Verificación del despliegue en DigitalOcean — confirmado visualmente.** Se navegó con el navegador integrado a `https://allpetcr-web-6h6iv.ondigitalocean.app/` (inicio y catálogo) y se confirmó que la revisión pública corresponde a `be33da2`:
- Botón "Agregar al carrito" (texto completo, no solo "Agregar").
- Fondo blanco en cabecera y tarjetas; banda `crema-100` solo en la sección "La vitrina" (uso decorativo de sección, no de fondo general — sin cambios).
- Categoría del catálogo sin números de conteo junto al nombre; igual en la lista de categorías del pie de inicio.
- Nombres de producto cortos ("Juguete pato", "Arnes", "Alfombra para arena") y foto de producto a tamaño completo de su recuadro, sin relleno visible.
- Conteo global "296 productos" (dato del ERP en vivo, no el JSON estático de 184) y "Para perro 188 productos" / "Para gato 107 productos" (conteo por especie, deliberadamente sin tocar — distinto del conteo por categoría que sí se pidió quitar).
- No se observó el `503` intermitente que se había registrado el 19/09; la página respondió con normalidad en ambas cargas.

No se realizaron pedidos, mensajes de WhatsApp ni formularios.

**2. Validaciones ejecutadas contra `be33da2`** (clon completo fresco de `origin/main`, `npm ci`):
- `npx tsc --noEmit`: aprobado, sin errores.
- `npm run lint`: aprobado, sin advertencias.
- `npm run test`: 114 pruebas aprobadas en 16 archivos.
- `npm run build`: falla en `prebuild` (`scripts/verificar-datos.mjs --estricto`) con "Producción requiere ERP_API_URL y ERP_API_TOKEN" — **esperado y documentado**: esta máquina de auditoría no tiene ni puede tener acceso al ERP real ni al de desarrollo de Oscar. No es una regresión; el guard está funcionando como debe (falla explícita, no sirve datos viejos).

**3. Hallazgo de seguridad (nuevo, no estaba en el documento anterior) — corregido.** `npm audit` sobre `be33da2` reportó 7 vulnerabilidades. Dos eran de severidad alta/crítica y **afectan directamente a este sitio**:
- **Crítica**: Next.js (rango vulnerable incluye la versión instalada, `16.2.12`) — ejecución remota de código no autenticada en servidores Windows-hosted, y ejecución remota de código no autenticada en la API de optimización de imágenes **cuando se usan archivos AVIF**. Este sitio sirve AVIF explícitamente (`next.config.ts`, `images.formats`).
- **Alta**: `sharp` (`<0.35.4`, instalado `0.35.3`) — vulnerabilidades en `libheif` usadas para decodificar imágenes.

Corrección aplicada y verificada: `npm audit fix` (sin `--force`, sin cambios incompatibles) subió `next` a `16.3.5` y `sharp` a `0.35.4` **solo mediante `package-lock.json`** — `package.json` no cambió (los rangos `^16.2.12` y `^0.35.3` ya permitían estas versiones). Se repitieron `tsc`, `lint` y `test` después del cambio: los tres aprobaron igual que antes. El nuevo `package-lock.json` ya se escribió en la copia de Oscar y queda pendiente de que se publique con `SUBIR_CAMBIOS.bat` — DigitalOcean lo tomará automáticamente en el próximo `npm ci` del build. Localmente, si Oscar corre `npm run dev`, conviene que ejecute `npm install` una vez para sincronizar `node_modules` con el lockfile nuevo (no es obligatorio para que el sitio funcione, solo para que coincidan).

Vulnerabilidades restantes (`vitest`, `vite`, `esbuild` — 3 moderadas, 1 crítica según el resumen de `npm audit`, pero **todas en `devDependencies`**, herramienta de pruebas que nunca se despliega a producción): requieren `vitest@5` (`npm audit fix --force`), que es un cambio con posibles roturas de API de pruebas. No se aplicó sin antes migrar y volver a validar la suite completa; queda como pendiente de menor urgencia porque no afecta el sitio publicado.

### Pendientes priorizados de las 8 categorías solicitadas

Requieren una decisión de Oscar (no son solo técnicas):
- Certificación manual WCAG 2.2 AA con lector de pantalla real — se puede avanzar en teclado/zoom/reflow/contraste sin él, pero la lectura de pantalla necesita confirmar con qué lector o herramienta validar.
- Corte a dominio oficial y SEO de producción (activar indexación, `NEXT_PUBLIC_SITE_URL=https://www.allpetcr.com`) — cambio de infraestructura, requiere autorización expresa antes de tocarlo.
- Legal/comercial: privacidad, términos, medios de pago y plazos de entrega definitivos, y las 8 preguntas abiertas de `docs/BORRADOR-CAMBIOS.md` sobre la política de cambios — son decisiones de negocio, no técnicas.

Puedo continuar sin más consulta (decisión técnica):
- Profundizar el análisis de rendimiento (separar ERP/render/servidor, repetir mediciones en las plantillas restantes).
- Certificación de fichas de producto (nombres, precios, disponibilidad, datos suficientes para comprar).
- Mejoras visuales sin tocar fotos (jerarquía del catálogo, comparabilidad de tarjetas, estados de carga/vacíos, microcopy comercial, señales de confianza en checkout).
- El resto de la matriz WCAG que no depende de un lector de pantalla específico.


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

## Verificación realizada

- `npm run revisar`: lint, TypeScript y 102 pruebas automatizadas aprobadas (14 archivos, 19/09/2026).
- `npm run build`: compilación de producción local aprobada, sin pedidos, pagos, migraciones o cambios del ERP.
- Las pruebas mock no confirman respuesta ni configuración actual de producción.
- La revisión visual anterior pertenece a la versión anterior. Estos cambios requieren revisión visual nueva; no equivalen a certificación WCAG ni a certificación exhaustiva de fichas.

## Pendientes que no deben inventarse

1. Política de cambios: propietario quiere cambio por otro producto o devolución del dinero. Faltan plazo, estado admisible del producto, comprobantes, diferencias de precio, medio de reembolso y transporte. Borrador interno separado; no publicar promesa incondicional.
2. Medios de pago, cobertura, tarifas y plazos de entrega: completar con operación real.
3. Privacidad y términos: validar responsables, proveedores, conservación de datos y procedimiento antes de publicar textos definitivos.
4. Datos del ERP: completar medidas, tallas, materiales, variantes y nombres diferenciadores únicamente con información real. El frontend no crea variantes inexistentes.
5. Imágenes: expresamente aplazadas por el propietario.
6. WCAG 2.2 AA: pruebas manuales de teclado, lector, zoom 200/400 %, reflow 320 px, objetivos táctiles, foco y errores en todas las plantillas/estados. No emitir conformidad hasta completarlas.
7. Rendimiento: medir versión desplegada con Lighthouse móvil/escritorio y latencia ERP. La eliminación de caché persistente prioriza consistencia; medir carga antes de introducir una caché de catálogo con invalidación fiable.
8. Analítica y evolución: decidir eventos, consentimiento y herramienta antes de instrumentar; recomendaciones más avanzadas o comparador requieren datos útiles. No hay evidencia para prometer aumento de ventas.

## Despliegue y lanzamiento

1. Verificar `npm run revisar` y `npm run build`.
2. Publicar el commit en el repositorio existente. Confirmar la revisión exacta desplegada en DigitalOcean: un push exitoso no prueba que el despliegue haya terminado.
3. Mantener ERP_API_URL y ERP_API_TOKEN como secretos del servidor. No copiarlos a documentación ni variables NEXT_PUBLIC.
4. En subdominio: NEXT_PUBLIC_SITE_URL con URL de DigitalOcean; NEXT_PUBLIC_SITE_INDEXABLE=false.
5. Ejecutar recorridos A–E sin enviar mensajes, pedidos ni formularios reales. Comparar SKU/precio entre catálogo, ficha, carrito, resumen y mensaje preparado.
6. Tras resolver los pendientes comerciales y QA, activar el dominio oficial, configurar NEXT_PUBLIC_SITE_URL=https://www.allpetcr.com y NEXT_PUBLIC_SITE_INDEXABLE=true, recompilar y verificar HTTPS, redirecciones, robots y sitemap. Esta activación no forma parte del despliegue de revisión.
7. Reversión: volver al commit anterior mediante el historial de despliegues de DigitalOcean o un commit de reversión; no requiere revertir datos ni migraciones.

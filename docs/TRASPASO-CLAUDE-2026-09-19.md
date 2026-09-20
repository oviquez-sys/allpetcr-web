# Traspaso para Claude — AllPetCR, 19 de septiembre de 2026

## Estado entregado

La rama `main` publicada en GitHub contiene `c9a07a9` (`Evita caída de catálogo por SKU duplicados`) sobre `d2f2089` (`Mejora checkout, catalogo y seguridad de auditoria`). DigitalOcean sirve esa revisión en `https://allpetcr-web-6h6iv.ondigitalocean.app/`. No se ha cambiado el dominio oficial, DNS, secretos, ERP, pagos ni imágenes.

La revisión publicada consulta el ERP en ejecución, protege el checkout mediante verificación del servidor, conserva el carrito antes de abrir WhatsApp y bloquea pedidos con precio o disponibilidad diferentes. También incluye navegación derivada del catálogo, filtros plegables en móvil, URLs compartibles, política de cambios, horarios correctos y límites/validaciones en las APIs.

## Validación visual realizada contra datos reales

No se enviaron pedidos, mensajes de WhatsApp ni formularios. Solo se añadió el SKU `85330` al carrito de la sesión de pruebas.

| Vista | URL o recorrido | Resultado comprobado |
|---|---|---|
| Escritorio 1440 × 900 | Inicio, catálogo, ficha `producto/85330`, carrito y checkout | Hero corregido, 296 productos, filtros y orden activos; ficha, precio, carrito y resumen coherentes. |
| Móvil 390 × 844 | Catálogo y búsqueda `q=juguete`, menú, carrito y checkout | Búsqueda devuelve 47 productos; menú abre/cierra; decremento queda inactivo en cantidad uno; checkout muestra datos, entrega y total antes de preparar. |
| Intermedio 768 × 1024 | `catalogo?para=perro&orden=precio-asc` | Filtros, conteo de 188 productos y orden de menor precio correctos. |
| Escritorio | `devoluciones` | Política visible desde el pie: cambio por otro artículo o devolución en efectivo, horario de tienda y coordinación de transporte. |

## Cambio local pendiente de publicar

Se cambió el fondo de los contenedores de foto existentes de blanco puro a `bg-crema-100` en `components/TarjetaProducto.tsx` y `app/producto/[sku]/page.tsx`. Esto conserva todas las fotos y reduce el aspecto de bloque vacío cuando una imagen del ERP tiene fondo blanco. Requiere validación, commit, push y despliegue antes de considerarlo publicado.

## Problemas que siguen pendientes

1. **Fotos del catálogo (P1 visual):** varias imágenes se cargan correctamente y no generan errores de consola, pero su contenido aparece blanco o poco distinguible en tarjeta/ficha. No es una falla de URL; debe revisarse cada archivo origen y reemplazarse o recortarse con fotografía real. El propietario decidió aplazar esta tarea. No inventar imágenes ni cambiar productos.
2. **Fichas del ERP (P2):** hay nombres genéricos y campos incompletos; faltan medidas, materiales, tallas, variantes y descripciones diferenciadoras en muchos SKU. Completar únicamente con datos comerciales verificados.
3. **Certificación WCAG 2.2 AA (P1 de QA):** falta matriz manual completa: teclado, foco, lector de pantalla, zoom 200/400 %, reflow a 320 px, objetivos táctiles y estados de error en todas las plantillas. No afirmar conformidad todavía.
4. **Rendimiento (P2 de QA):** ejecutar Lighthouse/PageSpeed móvil y escritorio en el despliegue estable; registrar fecha, URL, dispositivo y métricas. No usar métricas estimadas.
5. **Operación comercial/legal (P1 antes del dominio oficial):** confirmar medios de pago, cobertura, tarifas, plazos, privacidad y términos. La política de cambios no inventa plazo ni condiciones para artículos usados, higiene o alimentos.
6. **Lanzamiento (P1):** cuando el QA esté aprobado, configurar `NEXT_PUBLIC_SITE_URL=https://www.allpetcr.com`, activar indexación, redirigir/validar HTTPS y revisar `robots.txt`, sitemap y canónicas. Mantener el token ERP solo en secretos del servidor.

## Cómo continuar sin regresiones

1. Revisar `git status` y el diff local antes de editar; no sobrescribir los dos cambios de fondo de imagen.
2. Ejecutar `npm run lint`, `npx tsc --noEmit`, `npm run test` y `npm run build` antes de publicar.
3. Crear un commit solo después de que esas comprobaciones pasen; luego push a `main` y confirmar desde DigitalOcean que el despliegue exacto terminó.
4. Repetir el recorrido de catálogo, ficha, carrito y checkout sin enviar operaciones reales.
5. Mantener actualizado `docs/IMPLEMENTACION-AUDITORIA-2026-09-19.md` con pruebas reales, pendientes y el commit desplegado.

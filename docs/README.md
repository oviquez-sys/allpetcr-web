# Documentación de AllPetcr.com

Documentos de trabajo del sitio. No son código: son las decisiones y los
criterios detrás del código, que es lo que se pierde primero cuando pasa el
tiempo o cambia quien mantiene el proyecto.

| Archivo | Qué es | Cuándo abrirlo |
|---|---|---|
| **ANALISIS-Y-DECISIONES.md** | Auditoría del sitio, análisis de Chewy como referencia, y el porqué de cada cambio. Incluye lo que **no** se copió y por qué. | Antes de modificar cualquier componente. Es el documento principal. |
| **DIRECCION-DE-ARTE.md** | Criterio para elegir y normalizar fotografía. Tabla de licencias, filtros de descarte, especificación técnica. | Antes de elegir una sola foto. La tabla de licencias evita problemas legales. |
| **CASTING-fotografico.html** | 10 candidatas de Unsplash preseleccionadas para las tarjetas de categoría. | Al buscar fotos. Abrir en el navegador. |
| **COMPARAR-paletas.html** | Comparación visual de paletas de color. Histórico: la decisión ya está tomada. | Solo si se replantea la paleta. |
| **PREVIEW-diseno.html** | Maqueta estática de una versión anterior del diseño. Histórico. | Referencia. **No refleja el sitio actual.** |

---

## Lo mínimo que hay que saber

**Paleta.** Los colores salen del logo oficial, muestreados del SVG:
navy `#092E5E` y dorado `#CC9539`. Están en `tailwind.config.ts` con una nota
de contraste que conviene no ignorar: **el dorado 500 no sirve para texto**
(2.50:1 sobre crema, por debajo del 4.5:1 de WCAG AA). Para texto va
`dorado-700`.

**Navegación.** Sale toda de `lib/navegacion.ts` — encabezado, pie y portada
comparten la misma fuente. Se filtra por **id** de categoría, nunca por
nombre. Si alguien vuelve a enlazar por nombre, `lib/enlaces.test.ts` falla.

**El logo.** `components/Marca.tsx`, tres variantes (horizontal, vertical,
isotipo). Va en línea en el HTML, no como archivo externo: cero peticiones en
la ruta crítica y cero salto de diseño. Los originales están en
`public/marca/`.

**Fotografía.** Pendiente. El sistema está listo: guardar el archivo en
`public/categorias/` y descomentar una línea en `lib/navegacion.ts`. Leer
`DIRECCION-DE-ARTE.md` antes de elegir.

---

## Pendientes, por orden de impacto

1. **Cédula jurídica falsa** en `lib/negocio.ts` (`3-102-999999`). Tiene
   consecuencias legales en Costa Rica y es lo más rápido de resolver.
2. **Fotografía** — 184 productos y 4 categorías sin imagen.
3. **Campo `especie` en el ERP** — desbloquea la navegación Perros/Gatos, que
   es mejor que la actual.
4. **Coordenadas del local** (`lat`/`lng` en `null`) — sin eso el JSON-LD no
   emite `geo` y se pierde posicionamiento local.
5. **Ficha de Google Business** — mayor impacto comercial de la lista; la
   verificación tarda una o dos semanas.
6. **Analítica** — sin datos, las decisiones de conversión son opinión.

El detalle de cada uno está en `ANALISIS-Y-DECISIONES.md`.

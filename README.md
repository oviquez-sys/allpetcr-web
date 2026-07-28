# AllPet — sitio web

Stack: Next.js 15 (App Router) + TypeScript + Tailwind CSS. Sin carrito ni
cuentas de usuario. Sin conexión al ERP todavía.

## Cómo correr

```
npm install
npm run dev
```

## Decisiones de arquitectura (leer antes de tocar el catálogo)

**El ERP (`allpetcr-erp`, Django 5.2) hoy NO expone ninguna API.** Se
verificó directamente en el código: no está instalado Django REST Framework,
no hay `serializers.py` ni `api.py` en ninguna app. El propio README del ERP
lista "API / integraciones" como algo pendiente, no existente. Cualquier
mención de "conectar al ERP" en este proyecto es aspiracional hasta que esa
API se construya (dueño de esa tarea: aún no decidido).

**Por eso todo el acceso a datos pasa por `lib/data.ts`.** Ninguna página
debe importar los JSON de `data/` directamente — todas llaman a
`getProductos()` / `getCategorias()` en `lib/data.ts`. El día que exista una
API real, ese archivo es el único que cambia (JSON → `fetch`). Los tipos en
`lib/types.ts` son un espejo 1:1 de `catalogo/models.py` del ERP
(`Producto`, `Categoria`) para que ese cambio no implique remodelar
componentes.

**Los datos en `data/productos.json` son un placeholder de un solo item**,
marcado explícitamente como tal. No se inventaron productos, precios ni
nombres reales — eso habría generado datos falsos indistinguibles de datos
reales. Reemplazar con una exportación real del inventario del ERP (o con
las llamadas a la futura API) antes de publicar.

**Copy de Inicio, Sobre nosotros y Contacto es borrador**, escrito a partir
del contexto de marca (honesto, sin humo, tienda física en CR), no de texto
real de AllPetcr. Está marcado con comentarios `NOTA:` en cada archivo.
Reemplazar antes de publicar.

## Estructura

```
app/
  page.tsx              → Inicio
  catalogo/page.tsx      → Catálogo (lee de lib/data.ts)
  sobre-nosotros/page.tsx
  contacto/page.tsx
components/
  NavBar.tsx
  Footer.tsx
lib/
  types.ts              → tipos espejo del modelo Django real
  data.ts                → única puerta de acceso a datos del catálogo
data/
  productos.json         → placeholder, 1 item
  categorias.json         → categorías de ejemplo
```

## Marca

- Dorado `#CD963A`, Navy `#0B3161` — configurados en `tailwind.config.ts`
  como escalas `dorado-*` / `navy-*`, no como valores sueltos. Usar las
  clases (`text-dorado-500`, `bg-navy-500`, etc.), no hex hardcodeado.
- Tipografía: pila de system fonts (sin Google Fonts), configurada en
  `tailwind.config.ts` (`fontFamily.sans`). Decisión deliberada por
  velocidad: cero requests externas en cada visita. Si se quiere una
  tipografía de marca específica más adelante, usar `next/font/local`
  con el archivo `.woff2` autohospedado en `public/fonts/` — no
  `next/font/google`, que además de la llamada en runtime también
  requiere acceso de red al hacer `npm run build`.

## Pendiente (decisiones tuyas, no técnicas)

1. Blog — quedó fuera de este scaffold inicial (era opcional en el brief).
   Se agrega como `app/blog/` cuando se decida.
2. Quién construye la API del ERP y cuándo — no bloquea este sitio hoy,
   pero sí bloquea reemplazar `data/*.json` por datos reales.
3. Datos de contacto reales (teléfono, correo, dirección, horario) —
   hoy están como "(por definir)" en `app/contacto/page.tsx` y en el footer.
4. Repo en GitHub — este proyecto está listo para `git init` + push; aún no
   se ha hecho.

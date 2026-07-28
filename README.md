# AllPet — sitio web

Next.js 16 (App Router) + TypeScript + Tailwind. Catálogo con carrito y
pedido por WhatsApp.

## Antes de publicar — 3 pasos obligatorios

El sitio **no compila en producción** hasta completarlos. Es deliberado: antes
se publicaba una cédula jurídica inventada y ocho productos ficticios.

### 1. Datos del negocio

Abrí `lib/negocio.ts` y reemplazá todo lo que diga `PENDIENTE`:

| Campo | Qué poner |
|---|---|
| `cedulaJuridica` | La cédula real (está en el ERP, en Empresa.identificacion) |
| `whatsapp` | Solo dígitos con código de país: `50688887777` |
| `telefonoVisible` | Como se muestra: `8888-7777` |
| `correo` | Correo de contacto |
| `direccion.linea` | Dirección exacta del local |
| `direccion.canton` / `provincia` | Para el posicionamiento local |
| `direccion.lat` / `lng` | Clic derecho en Google Maps sobre el local → copiar coordenadas |
| `horario` y `horarioTexto` | Horario de atención |
| `sitioUrl` | El dominio final, sin barra al final |

### 2. Catálogo real

En la carpeta del ERP:

```
python manage.py exportar_catalogo_web
```

Eso reemplaza los productos DEMO por los reales. **Antes de correrlo**, revisá
que los nombres estén presentables: el README del ERP menciona 152 productos
pendientes de depuración, y saldrían a internet tal como estén.

### 3. Verificar

```
npm run verificar    # avisa qué falta
npm run revisar      # lint + tipos + pruebas
npm run build        # falla si quedan datos de relleno
```

## Comandos

```
npm run dev        # desarrollo en localhost:3000
npm run build      # compilar para producción (verifica datos antes)
npm run start      # servir lo compilado
npm run test       # pruebas
npm run revisar    # lint + tipos + pruebas, todo junto
```

## Cómo funciona la compra

No hay pasarela de pago, y es una decisión, no una omisión. Cobrar en línea
exige cuenta de comercio, resolver la facturación electrónica (el régimen
simplificado no la emite) y manejar datos de tarjeta. Nada de eso está
resuelto, y simularlo sería peor que no ofrecerlo.

El recorrido actual: el cliente arma el carrito → `/checkout` pide nombre,
teléfono y modo de entrega → se abre WhatsApp con el pedido ya escrito. El
comercio confirma existencias y total antes de comprometerse. Es además el
canal donde el cliente costarricense ya está.

**El carrito nunca cobra por productos agotados** y **siempre usa el precio
vigente del catálogo**, no el que estaba cuando el cliente lo agregó. Si algo
cambió, se le avisa de forma explícita en vez de ajustarlo en silencio.

## Estructura

```
app/
  page.tsx                 → Inicio
  catalogo/page.tsx        → Catálogo con filtros
  producto/[sku]/page.tsx  → Ficha (estática por producto, con JSON-LD)
  carrito/page.tsx         → Carrito
  checkout/page.tsx        → Confirmar pedido
  contacto/, sobre-nosotros/
  sitemap.ts, robots.ts    → SEO, generados desde el catálogo
  not-found.tsx            → 404 propia
components/
  NavBar, Footer, TarjetaProducto, TarjetaCategoria,
  CatalogoCliente, CarritoCliente, CheckoutCliente,
  BotonAgregar, AvisoConfiguracion
lib/
  negocio.ts    → ⚠ DATOS DEL NEGOCIO — editar antes de publicar
  carrito.tsx   → estado del carrito (persistente, entre pestañas)
  data.ts       → única puerta a los datos del catálogo
  types.ts, formato.ts, categorias.ts
scripts/
  verificar-datos.mjs  → impide publicar con datos de relleno
```

## Decisiones de arquitectura

**El acceso a datos pasa solo por `lib/data.ts`.** Ninguna página importa los
JSON de `data/` directamente. El día que el ERP exponga una API, ese archivo
es el único que cambia.

**El ERP no tiene API todavía.** Verificado: no está instalado Django REST
Framework, no hay `serializers.py` ni `api.py`. El puente actual es el comando
`exportar_catalogo_web`, que hay que correr a mano cuando cambien precios.

**Costos y márgenes nunca salen al sitio.** El exportador los omite a
propósito, y `stock_actual` se reduce a un booleano `disponible`: publicar
"quedan 3" le revela a la competencia el volumen que se maneja.

## Pendientes conocidos

- Fotos de producto: la exportación las tiene desactivadas (`INCLUIR_IMAGENES`
  en el comando del ERP). Antes de activarlas, migrar a `next/image`.
- Copy de Inicio y Sobre nosotros: sigue siendo borrador.
- Analítica: sin instalar. Recomendado Plausible o Umami (no requieren banner
  de cookies).
- Ficha de Google Business: sin crear. Es la acción de mayor impacto comercial
  y la verificación tarda una o dos semanas.

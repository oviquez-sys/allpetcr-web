# Implementación de la auditoría de prelanzamiento — 16 de octubre de 2026

Informe de origen: `auditoria/Informe-final-prelanzamiento.md` (carpeta AllPet). Lanzamiento previsto: lunes 19/10/2026.

Decisiones de los dueños tomadas el 16/10/2026 y aplicadas aquí:

- **10 % de La manada:** vale en la tienda física, por WhatsApp y en la web; solo en la primera compra; **no vence** (en el ERP, Regalía → «días para usarlo» = 0).
- **Teléfono principal:** 8856-2992 (el del sitio). El de Google se cambia en el Perfil de Empresa.
- **Envíos:** todavía sin tarifas fijas; se explica cómo se cotiza, sin inventar montos ni plazos.

## Hecho en el código

| ID | Qué se hizo | Archivos | Cómo comprobarlo |
|---|---|---|---|
| F4-01 | Antipulgas/antiparasitarios sin información de la etiqueta: se muestran, pero sin «Agregar al carrito». Botón «Consultar por WhatsApp» y aviso de asesoría. Se habilitan solos cuando la descripción del ERP incluye principio activo, modo de uso y advertencias. | `lib/publicacion.ts`, `app/producto/[sku]/page.tsx`, `components/BotonAgregar.tsx` | Abrir 87258, 87255 y 87256: sin botón de compra. |
| F4-07, F8-03 (juguete) | Fichas con notas internas («revisar en tienda», «antes de publicar», «FOTO PENDIENTE») y el SKU 147295 no se publican: 404, fuera del catálogo, del sitemap y del checkout. | `lib/publicacion.ts`, `lib/data.ts` | `/producto/147295` responde 404. |
| F4-05 | Prendas sin una talla única elegible (19 en producción): «Consultar talla disponible» en vez de compra directa. Se habilitan con «talla X» en el nombre o la presentación. | `lib/publicacion.ts` | Abrir 85325, 00004, 85910. |
| — | Defensa en profundidad: el carrito no suma ni deja pedir esos productos y el servidor del checkout los rechaza aunque vengan de un carrito viejo. | `lib/carrito.tsx`, `lib/checkoutServidor.ts`, `components/CarritoCliente.tsx`, `components/CheckoutCliente.tsx`, `components/RecompraCliente.tsx` | Pruebas en `lib/publicacion.test.ts`. |
| F4-02 | «También te puede servir» ya no recomienda productos de la otra especie, ni en salud productos de especie sin identificar. | `lib/publicacion.ts` (`recomendable`), `app/producto/[sku]/page.tsx` | Desde 87256 no aparece 87255 ni al revés. |
| F1-01, F12-01, F13-04 | Portada: debajo de la descripción, «Armá tu pedido y confirmalo por WhatsApp…» y un enlace «Consultar por WhatsApp» visible sin abrir el menú. | `app/page.tsx` | Inicio a 390 px sin desplazarse. |
| F7-01, F6-02, F12-03 | Condiciones del 10 % junto al beneficio (dónde, cuántas veces, vigencia) en /manada, la franja de la portada, la bienvenida, el correo del ERP y los términos §4. Campo opcional «¿Tenés un código de La manada?» en el checkout, que viaja en el mensaje de WhatsApp para validarlo antes del pago. | `app/manada/page.tsx`, `components/manada/*`, `app/manada/bienvenida/page.tsx`, `components/CheckoutCliente.tsx`, `lib/pedidoWhatsApp.ts`, `app/terminos/page.tsx`, ERP `templates/manada/correo_bienvenida.*` | Leer /manada y preparar un pedido de prueba con código (sin enviarlo). |
| F7-03 | «No compartimos tus datos» reemplazado por un texto coherente con la política de privacidad §4. | `components/manada/FormularioManada.tsx`, `components/CheckoutCliente.tsx` | Comparar /manada con /privacidad §4. |
| F7-04 (parcial) | El proveedor de correos se nombra (Resend, el que usa el ERP). El de factura electrónica sigue genérico: todavía no hay uno contratado. | `app/privacidad/page.tsx` | Leer §4. |
| F7-02, F12-02 | Términos §4 y §7, checkout y Entregas dicen lo mismo: el sitio muestra el subtotal; costo, plazo y total final llegan por WhatsApp en un resumen completo antes de aceptar. Entregas explica paso a paso cómo se cotiza un envío. | `app/terminos/page.tsx`, `app/envios/page.tsx`, `components/CheckoutCliente.tsx`, `lib/pedidoWhatsApp.ts` | Leer las tres páginas. |
| F6-01 | El formulario del checkout (incluida la modalidad de entrega) se conserva al ir Atrás/Adelante. Vive en `sessionStorage` de la pestaña; la aceptación de términos nunca se guarda. | `lib/borradorCheckout.ts`, `components/CheckoutCliente.tsx` | Completar envío a Guanacaste, Atrás, Adelante. |
| F10-01 | Textos de /manada y del formulario de mascotas pasan de #7B8A9D (3,52:1) a #556479 (≈6:1). | `components/manada/*`, `app/manada/bienvenida/page.tsx` | Inspeccionar color en /manada. |
| F3-01 | Equivalencias en el buscador (comida↔alimento, cachorro↔puppy, gatito↔kitten…) y búsqueda sobre nombre + descripción + categoría juntos. Con el catálogo publicado: «comida cachorro» pasa de 1 a 26 alimentos, sin accesorios. | `lib/busqueda.ts`, `components/CatalogoCliente.tsx` | `/catalogo?q=comida+cachorro`. |
| F8-01 | Imagen para compartir de 1200×630 (foto de portada + logo) declarada en `og:image` y `twitter:image`. | `public/compartir/allpet-portada-1200x630.jpg`, `app/layout.tsx` | Inspeccionar metadatos; después probar la vista previa real en WhatsApp. |
| F8-05 | Descripciones propias para Entregas y Sobre nosotros. | `app/envios/page.tsx`, `app/sobre-nosotros/page.tsx` | Ver `<meta name="description">`. |
| F13-02, F13-03 | Medición mínima sin analítica ni cookies: si se entra con UTM (enlace de Instagram), el pedido preparado incluye «Origen: instagram / lanzamiento_20261019 / bio». Declarado en privacidad. | `lib/origenCampana.ts`, `components/RecordarOrigen.tsx`, `app/privacidad/page.tsx` | Entrar por el enlace de campaña y preparar un pedido sin enviarlo. |
| F7 garantía | Términos §9: plazo legal mínimo de 30 días hábiles. | `app/terminos/page.tsx` | Leer §9. |

Términos y privacidad quedan con vigencia «16 de octubre de 2026» (constante `VIGENCIA`): si se publican otro día, poner esa fecha.

## Pendiente de los dueños (no se puede resolver desde el código)

| ID | Qué hacer | Dónde |
|---|---|---|
| F4-01 | Identificar físicamente los tres collares antipulgas y transcribir de la etiqueta: especie, principio activo, modo de uso, duración, edades/pesos y advertencias. Con eso en la descripción, el sitio los habilita solo. Revisar registro SENASA. | ERP → Producto → descripción |
| F4-02 | Fotos correctas del collar de gato (hoy mezcla escenas con perros). | ERP → fotos |
| F4-07 | Identificar, fotografiar y describir el juguete 147295; después quitarlo de `SKUS_RETIRADOS` en `lib/publicacion.ts`. | ERP + este repo |
| F4-05 | Escribir la talla de cada prenda en el nombre o la presentación («talla M») o crear un producto por talla. | ERP |
| F4-04, F10-02, F4-06 | Medir y publicar como texto cuello, pecho, largo y ancho de arneses y ropa; corregir 64–71 cm vs 56–71 cm del arnés L y 10 vs 11 cm de Animalitos. | ERP → descripción |
| F4-03, F4-08 | Revalidar foto vs peso de Balance 2 kg y NutriSource 12 lb; completar ingredientes y análisis garantizado de los alimentos de campaña. | ERP → ficha de alimento |
| F7-05 | Cambiar el teléfono del Perfil de Empresa de Google (8822-0327) a 8856-2992. | Google Business |
| F1-02 | Tomar foto real de la fachada con rótulo y del interior; se cargan en `FOTO_TIENDA` (`lib/contenidoInicio.ts`). `local.jpeg` es un render y no debe usarse. | Fotos + este repo |
| F7-01 | Definir si el 10 % se acumula con otras promociones y si tiene exclusiones; hoy el sitio no dice nada al respecto (no se inventó). | Abogado/contador |
| F12-02 | Cuando haya tarifas por zona que se puedan sostener, agregarlas en Entregas. | Este repo |
| F9-01 | Revisar en DigitalOcean los registros de las horas de los 504 de PageSpeed. | Panel del alojamiento |
| — | En caja: al registrar la venta de un pedido web o de WhatsApp, aplicar el cupón del mensaje («Código La manada: …»). | Operación |

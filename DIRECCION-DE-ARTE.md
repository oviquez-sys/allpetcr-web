# Dirección de arte — fotografía de AllPet

Documento de trabajo para seleccionar y normalizar fotografía. Sirve para
filtrar stock, para instruir a un fotógrafo, y para que Francisco o cualquiera
que toque el sitio aplique el mismo criterio.

---

## 1. Antes que nada: licencias

Esto no es un detalle legal menor, es lo que decide qué podés usar.

| Fuente | ¿Usable en la tienda? | Nota |
|---|---|---|
| **Unsplash** | Sí, uso comercial, sin atribución obligatoria | No sirve para crear un servicio competidor de stock ni para vender impresiones |
| **Pexels** | Sí, uso comercial, sin atribución obligatoria | No vender copias sin alterar |
| **Unsplash+** (marcado "Plus") | Solo con suscripción paga | En los resultados aparece con candado |
| **Adobe Stock / Shutterstock** | Sí, con licencia paga | La opción seria si el presupuesto lo permite |
| **Pinterest** | **NO** | Es un tablero de enlaces. Las fotos tienen dueño |
| **Behance / Dribbble** | **NO** | Portafolios. Copiar de ahí es infracción |
| **Sitios de Chewy, Wild One, etc.** | **NO** | Fotografía con derechos y, además, de sus productos |

Pinterest, Behance y Dribbble sirven para **mirar y aprender composición**.
Nunca para descargar y publicar.

### Advertencia adicional, aunque la licencia sea libre
Aun con licencia comercial, siguen aplicando derechos de imagen: si en la foto
aparece una **persona reconocible**, una **marca** o una **propiedad
identificable**, puede hacer falta autorización. Para tarjetas de categoría, la
regla simple es: **sin personas reconocibles, sin logos de marcas**.

---

## 2. El criterio de descarte (en este orden)

Aplicalos como filtro rápido. La mayoría de fotos muere en los primeros tres.

1. **¿La luz es natural y suave?** Si hay flash directo, sombras duras o
   tono anaranjado de bombillo, descartar. Este solo filtro elimina ~70% del
   stock de mascotas.
2. **¿El fondo es tranquilo?** Si compite con el sujeto —muebles saturados,
   desorden, patrones fuertes— descartar.
3. **¿Los colores caen en tu paleta?** Blanco, crema, arena, madera clara,
   lino, gris. Si domina un azul eléctrico o un verde saturado, descartar
   aunque la foto sea buena: va a pelear con el navy y el dorado.
4. **¿Hay una zona tranquila donde apoyar el texto?** No hace falta que esté
   vacía (el scrim lo resuelve), pero sí que no tenga alto contraste ni
   detalle fino en la franja inferior.
5. **¿Se ve real?** Sin sobre-edición, sin HDR, sin piel plástica, sin
   artefactos de IA (dedos, patas o ojos deformes, texturas repetidas).
6. **¿Aguanta el recorte cuadrado y vertical?** En móvil la tarjeta es casi
   cuadrada. Si al recortar se pierde el sujeto, descartar.

## 3. Qué buscar por categoría

Términos de búsqueda que ya filtran hacia el estilo correcto. Combinar el
sujeto con **un modificador de estilo**: ahí está el truco. Buscar "perro" da
basura; buscar "perro interior minimalista luz natural" da resultados usables.

**Perros** — `dog minimal interior`, `dog neutral home`, `dog linen bed`,
`golden retriever natural light home`, `dog scandinavian interior`,
`dog beige sofa`, `sleeping dog window light`

**Gatos** — `cat scandinavian interior`, `cat window natural light`,
`cat neutral home`, `cat minimal apartment`, `cat sunbeam beige`,
`cat wooden floor calm`

**Higiene** — `pet grooming minimal`, `dog bath neutral`, `pet spa clean`,
`grooming tools flat lay`, `bathroom neutral towels`, `pet care products
minimal`

**Accesorios** — `pet accessories flat lay`, `dog collar leather minimal`,
`ceramic pet bowl`, `pet bed linen neutral`, `dog leash flat lay neutral`

**Ojo con "flat lay":** produce muy buenas composiciones editoriales, pero
suele venir con fondo blanco puro. Sobre tu fondo crema, un blanco puro se ve
como un parche. Preferir flat lays sobre lino, madera clara o papel crudo.

---

## 4. Especificación técnica

- **Resolución mínima:** 2000 px en el lado corto. Las tarjetas son grandes
  y en pantallas retina una foto de 1200 px se ve blanda.
- **Formato de entrega:** Next convierte a WebP/AVIF automáticamente. Subir
  el JPG de mayor calidad disponible a `public/categorias/`.
- **Nombre de archivo:** `perros.jpg`, `gatos.jpg`, `higiene.jpg`,
  `accesorios.jpg`. Sin espacios ni tildes.
- **Punto focal:** si el sujeto no está centrado, pasarle a la tarjeta la
  propiedad `posicion` (ej. `"70% 40%"`) para que el recorte no lo decapite
  en móvil.

## 5. Coherencia entre las cuatro

Esto es lo que separa una selección profesional de cuatro fotos lindas
sueltas. Las cuatro tienen que compartir:

- **Misma temperatura de color.** Todas cálidas o todas neutras. Una fría
  entre tres cálidas se nota inmediatamente y ensucia la fila.
- **Misma dirección de luz.** Idealmente lateral, de ventana.
- **Mismo nivel de saturación.** Si tres son desaturadas y una vibrante, la
  vibrante parece un error.
- **Distinto sujeto, mismo mundo.** Deben verse como fotografiadas en la
  misma casa, el mismo día.

Regla práctica: poné las cuatro miniaturas en fila. Si una salta a la vista
antes que las otras, esa es la que hay que cambiar — aunque sea la más linda
de las cuatro.

## 6. Edición que suele valer la pena

- **Bajar saturación 5-15%.** El stock viene sobresaturado de fábrica.
- **Levantar sombras levemente.** Ayuda a que el scrim no cierre la imagen.
- **Ampliar el encuadre (generative expand).** Si la foto es perfecta pero
  está apretada, ampliar el fondo da aire sin cambiar el sujeto. Es la
  edición de mayor rendimiento.
- **Quitar objetos que distraen.** Un cable, un juguete de color chillón,
  una esquina de mueble cortada.
- **Unificar temperatura.** Si tres fotos son cálidas y una neutra, corregir
  la cuarta en vez de descartarla.

## 7. Fotos de proveedor (el caso real del catálogo)

Distinto de las tarjetas de categoría. Las fotos de producto de proveedores
vienen con calidad despareja: distintos fondos, tamaños y recortes. Sin
normalizar, la grilla se ve desordenada por más buena que sea la tipografía.

Mínimo indispensable:
1. **Recorte cuadrado** (1:1), todas igual.
2. **Fondo unificado**, idealmente el mismo crema del sitio.
3. **Producto centrado** con margen consistente (~10% por lado).
4. **Sin logos de terceros ni marcas de agua.**

Si el proveedor manda la foto sobre fondo blanco, se puede recortar el objeto
y reponerlo sobre el crema. Es trabajo mecánico y repetitivo — vale la pena
automatizarlo si son 184 productos.

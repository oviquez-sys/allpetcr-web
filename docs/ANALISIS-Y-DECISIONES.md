# AllPetcr.com — análisis de referencia y decisiones aplicadas

Documento de trabajo. Explica **qué se cambió, por qué, y qué NO se copió de
Chewy aunque se pudiera**. La parte más útil está en las secciones marcadas
con ⚠: son los puntos donde seguir a Chewy habría empeorado el sitio.

---

## 0. Lo primero: el estado real del proyecto

Antes de rediseñar nada revisé el proyecto completo. Conviene que quede
escrito, porque cambia lo que tenía sentido hacer.

**El sitio no estaba mal construido.** Next.js 16 con App Router, TypeScript
estricto, CSP configurada, JSON-LD de negocio y de producto, `content-visibility`
para diferir el pintado de la grilla, `memo` con comparador explícito,
`useDeferredValue` en el buscador, skip-link WCAG 2.4.1, objetivos táctiles de
44 px, `prefers-reduced-motion` respetado en todas las transiciones. Eso ya
estaba por encima del promedio de tiendas de mascotas de la región.

El problema no era el diseño. Eran cuatro cosas concretas:

| # | Problema | Gravedad |
|---|---|---|
| 1 | Los 8 enlaces principales de navegación **no filtraban nada** | Crítico |
| 2 | Cero fotografías: 184 productos sin imagen | Alto |
| 3 | La prueba que debía detectar el #1 **no podía fallar** | Alto |
| 4 | Cédula jurídica de relleno (`3-102-999999`) | Legal |

### 1 · El bug que rompía la ruta de compra

`NavBar` y `Footer` enlazaban a `/catalogo?c=perros`, `?c=gatos`,
`?c=higiene`, `?c=accesorios`. **Ninguna de esas cuatro categorías existe** en
`data/categorias.json`. Las categorías reales del ERP son otras nueve.

El filtro busca por nombre exacto, no encuentra nada y muestra el catálogo
completo **sin avisar**. Quien hacía clic en "Gatos" veía los 184 productos,
collares de perro incluidos.

Un enlace que parece filtrar y no filtra es peor que no tener el enlace: el
visitante concluye que la tienda no tiene lo que busca, o que el sitio está
roto. Ninguna mejora estética compensa eso, y por eso fue lo primero.

### 2 · La prueba que daba seguridad falsa

`lib/enlaces.test.ts` tenía un caso llamado *"los filtros ?c= apuntan a
categorías que existen"*. Debería haber cazado el bug anterior. Pasaba en
verde.

La causa: extraía enlaces con una expresión regular sobre `href="..."`, pero
la navegación estaba declarada en un array como `{ href: "/catalogo?c=perros" }`
—con dos puntos, no con igual—. **La regex nunca los vio.**

Una prueba que no puede fallar es peor que ninguna, porque desactiva la
sospecha. Se reescribió para importar los datos de navegación de verdad, y se
comprobó rompiendo un enlace a propósito: ahora falla con un mensaje que dice
exactamente qué se rompió.

---

## 1. Arquitectura y navegación

### Qué hace Chewy
Navegación principal por **especie**: Dog, Cat, Fish, Bird, Small Pet. No por
tipo de producto (Bowls, Beds, Toys).

### Por qué
La categoría del inventario y la categoría mental del comprador son cosas
distintas. Quien administra el stock piensa "comederos"; quien compra piensa
"tengo un gato". La navegación debe seguir a la segunda, o el visitante tiene
que traducir mentalmente en cada paso.

### ⚠ Por qué AllPetcr.com NO copió esto
Lo intenté y **los datos no lo soportan**. De los 184 productos:

- 5 mencionan "gato" en el nombre
- 2 mencionan "perro"
- **177 no dicen nada**

No existe un campo `especie` en el ERP. Una navegación Perros/Gatos tendría
que adivinar la clasificación de 177 productos a partir del texto del nombre,
y acabaría mostrando casi el catálogo entero bajo ambas entradas — es decir,
**otro filtro que no filtra**: exactamente el defecto que se venía a corregir.

Vale más una navegación honesta y útil que una aspiracional y rota.

### Qué se hizo
La navegación sigue la distribución real del catálogo:

```
 76  Juguetes y peluches          → sección propia
 48  Collares, correas y arneses  → sección "Collares y paseo"
 27  Salud e higiene              → sección propia
  6  Gatos: areneros/rascadores   → sección "Gatos"
  6  Camas y descanso     ┐
  6  Transporte y paseo   │
  7  Accesorios           ├─────→ sección "Hogar y accesorios"
  4  Comederos            │
  4  Ropa                 ┘
```

Juguetes y Collares son el 67% del inventario: merecen primer nivel. Las
categorías de 4-7 productos se agrupan, porque una sección con cuatro
artículos se siente vacía y daña la percepción de surtido.

**Se conserva el principio de Chewy aunque el resultado se vea distinto: la
navegación refleja el catálogo que existe, no el que uno quisiera tener.**

### Detalle técnico que evita la recaída
Los filtros ahora van por **id** (`?cats=7,3`), no por nombre. Un id no se
rompe si alguien corrige una tilde en el ERP y no obliga a que dos archivos
escriban el nombre igual. Toda la navegación sale de un solo archivo
(`lib/navegacion.ts`) que comparten encabezado, pie y portada: un enlace roto
solo se puede escribir en un lugar, y ahí falla una prueba.

Verificado sobre los datos reales:

```
cats=(ninguno)  ->  184   SIN FILTRO
cats=7          ->   76   Juguetes y peluches
cats=3          ->   48   Collares, correas y arneses
cats=6          ->   27   Salud e higiene
cats=2          ->    6   Gatos: areneros y rascadores
cats=7,3        ->  124   Juguetes + Collares
✓ todos los filtros de navegación filtran de verdad
```

---

## 2. Encabezado

### Qué hace Chewy
Buscador dominante en el centro, logo a la izquierda, carrito a la derecha,
franja de categorías debajo, y una barra superior con la promesa de envío.

### Por qué
- **El buscador grande y centrado**: quien escribe ya sabe qué quiere. Es el
  tráfico con más intención de compra y el que menos pasos necesita para
  llegar al carrito. Cada píxel ahí rinde.
- **La promesa de envío antes del primer precio**: el costo de envío es la
  primera objeción del comercio electrónico. Enunciarla por adelantado la
  desactiva antes de que aparezca.
- **El mega menú**: un menú de un nivel obliga a hacer clic para descubrir qué
  hay dentro. El mega menú enseña la profundidad del catálogo sin navegar, y
  eso baja el costo de exploración.

### Qué se aplicó
Los tres, adaptados:

- Buscador con botón explícito "Buscar" y `focus-within` que lo destaca al
  escribir. En móvil ocupa una fila propia de ancho completo, en vez de
  competir con el logo.
- Barra superior: *"Retiro en tienda sin costo · Asesoría honesta"*. Es la
  versión cumplible de la promesa de Chewy — este negocio no puede prometer
  envío gratis nacional, pero sí retiro sin costo.
- Mega menú **solo en las secciones que agrupan varias categorías reales**.
  Poner una flecha en una sección sin hijos sería mentir sobre lo que hay
  detrás. Se abre con hover **y con foco de teclado**, cierra con Escape, y
  tiene un retardo de 140 ms al salir para que no parpadee cuando el cursor
  cruza el hueco entre el botón y el panel.

### ⚠ Lo que se rechazó
**Ninguna librería de menú.** Radix o Headless UI serían ~15 KB comprimidos en
la ruta crítica para resolver algo que son dos estados de React y CSS. El
encabezado se pinta en todas las páginas: es el peor sitio posible para
agregar peso.

---

## 3. El logo

El archivo que entregaste (`logo Vectorizado.svg`) tenía tres problemas para
uso web, y ninguno era evidente a simple vista.

**Uno — no era transparente.** El primer trazado es un rectángulo de
1254×1254 px con el logo recortado dentro. Copiado tal cual, la marca arrastra
un cuadro blanco que sobre el fondo crema del sitio se ve como un parche. Se
resolvió con una máscara SVG: ahora el perro es un calado real que deja ver el
fondo, sea el que sea.

**Dos — es un logo vertical.** Isotipo arriba, "AllPetcr.com" abajo. En un
encabezado de ~64 px de alto esa proporción obliga a reducir el conjunto hasta
que el texto queda ilegible. Se compuso una **variante horizontal** midiendo
las cajas reales de cada grupo (isotipo 431.8×488.9, texto 736.6×99.8) — no a
ojo. Un logo que solo existe en una proporción es un logo incompleto.

**Tres — el color venía con ruido.** El azul aparece en catorce variantes
entre `rgb(8,43,92)` y `rgb(10,48,96)`: artefactos del vectorizado, no
decisiones de diseño. Se normalizaron al valor dominante.

### ⚠ Los colores: lo que pediste vs. lo que dice el logo

| | Pediste | Proyecto tenía | **Logo real** |
|---|---|---|---|
| Azul | `#1E4E8D` | `#0B3161` | **`#092E5E`** |
| Dorado | `#DBAF5A` | `#CD963A` | **`#CC9539`** |

Se usaron **los del logo**. Es la única opción que no contradice tu identidad,
y resulta que el proyecto ya estaba casi calibrado (quien hizo la "Paleta C"
había muestreado el archivo). Los que pediste son notoriamente más claros que
la marca real.

### ⚠ Advertencia de contraste que conviene no ignorar

El dorado de marca **no sirve para texto**:

| Color | Sobre crema | WCAG AA (≥4.5) |
|---|---|---|
| `#CC9539` dorado del logo | 2.50 | ❌ falla |
| `#DBAF5A` el que pediste | 1.92 | ❌ falla peor |
| `#7F5B25` dorado-700 | 5.78 | ✓ |
| `#092E5E` navy del logo | 12.66 | ✓ |

No es pedantería: el precio y las etiquetas de categoría son justo el texto
que más gente necesita leer. El dorado es correcto para superficies, iconos
grandes y bordes. Para texto, `dorado-700`. Está documentado en
`tailwind.config.ts` para que no se rompa por descuido.

### Nota sobre el nombre
El logo dice **"AllPetcr.com"**. El sitio decía "AllPet". Se unificó al logo,
porque la marca gráfica manda sobre el texto suelto.

---

## 4. Portada

### El orden de las secciones no es decorativo
Sigue la secuencia de decisión de quien entra por primera vez:

1. ¿Qué es esto y por qué me quedo? → **hero**
2. ¿Qué venden? → **categorías**
3. Enseñame producto de verdad → **destacados**
4. ¿Cómo compro? → **cómo funciona**
5. ¿Puedo confiar? → **señales de confianza**

Es el orden que usa Chewy, y no por moda: poner las señales de confianza
arriba, antes de que la persona sepa qué vendés, responde una pregunta que
todavía no se hizo.

### ⚠ Por qué no hay carrusel
Los carruseles de portada tienen tasas de clic muy bajas fuera del primer
cuadro, empujan el contenido útil hacia abajo, y cargan JavaScript y varias
imágenes grandes en la ruta crítica — justo donde se decide el **LCP**, la
métrica de Core Web Vitals que más pesa. Un hero fijo con una sola promesa
carga más rápido y comunica mejor.

### Decisiones concretas
- **Un solo botón principal.** Dos botones del mismo peso obligan a elegir
  antes de saber qué se elige. "Ver catálogo" es primario; WhatsApp es una
  salida secundaria y se ve como tal.
- **El `h1` es la promesa, no el nombre de la marca.** El nombre ya está en el
  logo; repetirlo gasta el elemento más importante del documento.
- **Micro-señal bajo el CTA**: *"Sin registro · Sin tarjeta · Confirmás por
  WhatsApp antes de pagar"*. Responde "¿me van a obligar a registrarme?" justo
  cuando surge la duda, no tres pantallas más abajo.
- **Solo productos disponibles en el escaparate.** Mostrar agotados en la
  portada es la forma más rápida de gastar la primera impresión.
- **Sección "Cómo comprar"** — no la tiene Chewy, y aquí hace falta. Una
  tienda sin pasarela de pago debe explicar su mecánica o el visitante asume
  que está rota.
- **La dirección física como cierre.** Es la señal de confianza más barata y
  más fuerte que tiene un comercio local. Solo se pinta si el dato existe: un
  "PENDIENTE" ahí haría el efecto contrario.

---

## 5. Ficha de producto

Ya estaba bien resuelta (JSON-LD de `Product` y `BreadcrumbList`, cross-selling,
consulta por WhatsApp). Se corrigieron tres defectos:

**Cross-selling con agotados.** Los relacionados no filtraban por
disponibilidad. Recomendar un producto agotado gasta el clic de alguien que ya
estaba dispuesto a comprar — el peor momento para hacerle perder el tiempo.
Ahora los disponibles van primero y los agotados solo completan la fila si
hacen falta.

**Migas por nombre.** Enlazaban con `?c=Nombre`, el parámetro frágil. Ahora
por id, igual que el resto del sitio.

**El estado usaba el dorado de marca.** Mezclar el color de identidad con el
de estado hace que ninguno de los dos signifique nada. Ahora verde para
disponible, gris para agotado — y **el punto acompaña al texto, no lo
sustituye** (WCAG 1.4.1: el estado nunca se comunica solo por color).

---

## 6. Fotografía — el punto pendiente, dicho sin adornos

**No se agregaron fotos, y conviene entender por qué.**

Pediste "fotografías hiperrealistas de nivel publicitario, nada de imágenes
típicas de IA". Tres hechos:

1. **La IA no da ese nivel de forma confiable con animales.** Pelo, ojos y
   patas son exactamente donde falla. Prometer lo contrario sería venderte
   humo.
2. **Para fotos de producto la IA no sirve en absoluto.** No puede inventar el
   empaque real de un arenero que vendés. Eso necesita fotos del proveedor o
   fotografía propia.
3. **El sandbox donde trabajo no tiene acceso de red a bancos de imágenes**,
   así que tampoco pude descargar y evaluar stock por mi cuenta.

Lo que sí se hizo: dejar el sistema listo para que las fotos entren **sin
tocar código**. Guardar el archivo en `public/categorias/` y descomentar una
línea en `lib/navegacion.ts`. El scrim de doble capa de `TarjetaCategoria` ya
garantiza que el texto sea legible sobre cualquier foto razonable — esa parte
estaba bien resuelta desde antes.

`docs/CASTING-fotografico.html` ya tiene 10 candidatas de Unsplash
preseleccionadas, y `docs/DIRECCION-DE-ARTE.md` tiene el criterio de descarte.
Vale la pena leer la
tabla de licencias antes de elegir: **Pinterest, Behance y Dribbble no son
fuentes**, son tableros de obras con dueño.

**Recomendación honesta:** para las 4 tarjetas de categoría, stock licenciado
da mejor resultado que IA. Para los 184 productos no hay atajo — o fotos del
proveedor, o una sesión propia. Con 184 SKU, normalizar recorte y fondo es
trabajo mecánico que vale la pena automatizar.

---

## 7. Rendimiento

Lo que ya estaba y se conservó:

- `content-visibility: auto` en las tarjetas: el navegador se salta el pintado
  de lo que está fuera de pantalla. Nativo, sin librería de virtualización, y
  mantiene las 184 en el DOM (Ctrl+F las encuentra, no se pierde SEO).
- `memo` con comparador explícito + `useDeferredValue` en el buscador.
- Tipografías autohospedadas vía npm: cero peticiones a terceros.

Lo que se agregó:

- **El logo va en línea en el HTML**, no como `<img src>`. Un archivo externo
  sería una petición más en la ruta crítica y dejaría un hueco que desplaza el
  contenido mientras carga (CLS). Pesa ~4 KB comprimido: menos que la
  penalización de la petición extra.
- Cero JavaScript nuevo en la ruta crítica. El mega menú son dos estados de
  React que ya existían en el bundle.

Build de producción verificado: **194 páginas estáticas**, 184 fichas de
producto pregeneradas, compilación en 4.5 s.

---

## 8. Verificación

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | ✓ sin errores |
| `npm test` | ✓ 18/18 (antes 12) |
| `npm run build` | ✓ 194 páginas |
| Filtros de navegación | ✓ los 8 filtran de verdad |
| Contraste WCAG AA | ✓ verificado por cálculo |
| Prueba de enlaces | ✓ **falla al romperla a propósito** |

Ese último punto es el que más vale: una prueba que no se comprueba rompiendo
puede estar dando seguridad falsa, que es como estaba antes.

**No verificado:** no pude tomar capturas del sitio renderizado — el sandbox
no permitió instalar un navegador. El HTML servido, el build y los tests están
comprobados; **el aspecto visual final no lo he visto.** Conviene que lo
revises con `npm run dev` antes de dar nada por bueno.

---

## 9. Pendientes, por orden de impacto

1. **Cédula jurídica falsa** — `lib/negocio.ts` dice `3-102-999999`. El README
   afirma que se corrigió; no es así. Publicar eso tiene consecuencias legales
   en Costa Rica. *Es el pendiente más urgente y el más rápido de resolver.*
2. **Fotografía** — 184 productos y 4 categorías sin imagen.
3. **Campo `especie` en el ERP** — desbloquea la navegación Perros/Gatos, que
   es mejor que la actual. Es la mejora estructural de mayor rendimiento.
4. **Coordenadas del local** — `lat`/`lng` en `null`. Sin eso el JSON-LD no
   emite `geo` y se pierde posicionamiento local.
5. **Ficha de Google Business** — sin crear. Mayor impacto comercial de la
   lista, y la verificación tarda una o dos semanas: conviene empezarla ya.
6. **Analítica** — sin instalar. Plausible o Umami no requieren banner de
   cookies. Sin datos, las decisiones de conversión son opinión.

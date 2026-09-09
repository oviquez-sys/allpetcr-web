import categoriasJson from "@/data/categorias.json";
import productosJson from "@/data/productos.json";
import type { Categoria, Producto } from "./types";

/**
 * NAVEGACIÓN DEL SITIO
 *
 * ── EL PROBLEMA QUE ESTE ARCHIVO RESOLVIÓ
 * El encabezado y el pie enlazaban a `/catalogo?c=perros`, `?c=gatos`,
 * `?c=higiene` y `?c=accesorios`. Ninguna de esas cuatro categorías existía en
 * data/categorias.json. El filtro busca por nombre exacto, no encontraba nada,
 * y mostraba el catálogo completo **sin avisar**: los ocho enlaces principales
 * de navegación del sitio no filtraban nada.
 *
 * ── QUÉ CAMBIÓ EL 02/08/2026
 * El ERP pasó de nueve familias planas a un árbol real de dos niveles
 * (10 categorías web publicadas · 42 subcategorías) y sumó el campo
 * `mascota`. Las secciones de abajo ya no son una agrupación inventada para
 * tapar categorías de cuatro productos: son las categorías del catálogo.
 *
 * ── QUÉ CAMBIÓ EL 04/08/2026: SE ACABARON LAS SUBCATEGORÍAS
 * El árbol de dos niveles se aplanó. El ERP pasó de 11 familias y 75
 * subcategorías a CINCO categorías y nada debajo, porque encontrar un
 * producto en el ERP obligaba a decidir entre "Arneses" y "Correas" antes de
 * ver una sola foto. Esa decisión es la que hacía perder el tiempo.
 *
 * El costo de aplanar cae justo acá: los 20 enlaces de subgrupo de este menú
 * ("Peluches", "Pelotas", "Collares", "Bozales"…) apuntaban a subcategorías
 * que ya no existen. Veinte puertas de entrada al catálogo, y su tráfico.
 *
 * ── POR QUÉ AHORA SÍ "PERRO / GATO", Y POR QUÉ NO ANTES
 * La versión anterior de este archivo descartó "Perros/Gatos" como navegación
 * principal con un argumento correcto: de 184 productos publicados, 159 (86%)
 * sirven para perro. Una entrada "Perros" que muestra 159 de 184 no es una
 * sección, es el catálogo con otro nombre — un filtro que parece filtrar y no
 * filtra, el defecto exacto que este archivo vino a corregir.
 *
 * Ese argumento sigue en pie y por eso la especie NO es sección de primer
 * nivel. Lo que cambió es el segundo nivel: ahí la especie sí parte de verdad,
 * porque se cruza con la categoría en vez de competir con ella.
 *
 *     Juguetes         perro  61   gato  20
 *     Ropa y paseo     perro  53   gato  15
 *     Casa y comida    perro  15   gato  16
 *     Higiene y salud  perro  30   gato  32
 *
 * Ninguna combinación queda vacía ni devuelve casi todo. "Juguetes + gato" da
 * 20 productos: eso sí es un filtro. Y es como piensa quien compra, que llega
 * sabiendo para cuál de sus animales viene.
 *
 * ── EL MENÚ SE DIO VUELTA: PRIMERO LA MASCOTA (01/09/2026)
 * Hasta hoy el primer nivel eran las categorías (Juguetes, Ropa y paseo…) y
 * la especie era el segundo. Se invirtió: ahora es Perro / Gato arriba y las
 * categorías adentro.
 *
 * El motivo no es estético. Quien entra a una tienda de mascotas llega
 * sabiendo para cuál de sus animales viene; nadie entra pensando "quiero ver
 * juguetes". Es como lo hacen las tiendas grandes del rubro —Chewy abre con
 * Perro / Gato / Otros animales— y coincide con lo que este mismo archivo ya
 * había concluido más arriba al justificar el filtro cruzado por especie.
 *
 * ── ESTE ARCHIVO YA NO SABE QUÉ CATEGORÍAS EXISTEN
 * Antes tenía las cinco escritas a mano. Eso significaba que crear una
 * categoría en el ERP —"Alimento", por ejemplo— NO la hacía aparecer en el
 * menú hasta que alguien se acordara de editar acá. Dos listas separadas que
 * se desincronizan es cuestión de tiempo, y el que la descubre es el cliente.
 *
 * Ahora las categorías salen de `data/categorias.json` ordenadas por el campo
 * `orden`, que decide el ERP (`catalogo/management/commands/asegurar_categorias.py`).
 * Una categoría nueva aparece sola, en su lugar, sin tocar una línea de acá.
 *
 * ── POR QUÉ EL ENLACE DE "PERRO" NO LLEVA FILTRO DE CATEGORÍA
 * Más arriba está escrito que un enlace de especie sin categoría "mostraría
 * 159 de 184 productos, que es el caso que este archivo prohíbe". Esa regla se
 * escribió cuando la especie era el SEGUNDO nivel, y ahí tenía razón: un
 * subgrupo que muestra casi todo no filtra nada.
 *
 * Como primer nivel es al revés. "Perro" es la puerta de la tienda: tiene que
 * mostrar todo lo de perro, igual que la sección "Perro" de cualquier tienda
 * del rubro. Lo que sigue prohibido es un enlace a `/catalogo` pelado, sin
 * ningún filtro — eso lo verifica `lib/enlaces.test.ts`.
 *
 * ── EL PRINCIPIO QUE NO CAMBIA
 * La navegación refleja el catálogo que existe, no el que uno quisiera tener.
 * Una categoría sin existencias no sale en `categorias.json`, así que
 * desaparece del menú sola y vuelve sola cuando entra mercadería.
 *
 * ── AL CAMBIAR EL INVENTARIO
 * Los nombres de abajo se resuelven a id contra data/categorias.json. Como el
 * ERP ahora publica solo lo que hay en existencia, una categoría puede
 * desaparecer del JSON al agotarse todo lo suyo: `idsDe` la omite y
 * `lib/enlaces.test.ts` falla si una sección se queda sin un solo producto.
 * No hay enlace roto posible sin que falle una prueba.
 */

const categorias = categoriasJson as Categoria[];

/** Id de una categoría por su nombre exacto del ERP. Devuelve null si no
 *  existe, para que un nombre mal escrito se note en vez de fallar callado. */
function idDe(nombre: string): number | null {
  const c = categorias.find((x) => x.nombre === nombre);
  if (c) return c.id;
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[navegacion] no existe la categoría "${nombre}" en data/categorias.json`);
  }
  return null;
}

function idsDe(...nombres: string[]): number[] {
  return nombres.map(idDe).filter((x): x is number => x !== null);
}

/**
 * FILTRO CRUZADO POR ESPECIE
 *
 * Vive acá y no dentro del componente para que el catálogo y cualquier enlace
 * futuro compartan exactamente la misma definición de "es para gato".
 *
 * Un producto marcado "Perro y gato" cuenta para las dos especies: son la
 * mayoría de los accesorios genéricos (platos, camas, quita pelusas), y
 * esconderlos de ambos filtros dejaría a "Gatos" con 25 de 184 productos,
 * mostrando mucho menos de lo que la tienda de verdad vende para gato.
 *
 * Está declarado ACÁ ARRIBA y no al final del archivo a propósito: desde el
 * 04/08/2026 `navegacion` arma sus subgrupos recorriendo ESPECIES, y un const
 * no se puede leer antes de su declaración (zona muerta temporal). Con la
 * definición al final, importar este módulo reventaba al cargarlo.
 */
export const ESPECIES = [
  { clave: "perro", label: "Perros", coincide: ["Perro", "Perro y gato"] },
  { clave: "gato", label: "Gatos", coincide: ["Gato", "Perro y gato"] },
] as const;

export type ClaveEspecie = (typeof ESPECIES)[number]["clave"];

/** True si el producto sirve para la especie pedida. */
export function esParaEspecie(mascota: string, clave: ClaveEspecie): boolean {
  const especie = ESPECIES.find((e) => e.clave === clave);
  if (!especie) return true;
  return (especie.coincide as readonly string[]).includes(mascota);
}

export interface GrupoNav {
  label: string;
  href: string;
}

export interface SeccionNav {
  id: string;
  label: string;
  href: string;
  grupos: GrupoNav[];
}

/** Enlace al catálogo filtrado por ids de categoría.
 *  Se filtra por id y no por nombre: un id no se rompe si alguien corrige una
 *  tilde en el ERP, y no depende de que dos archivos escriban igual. */
export function hrefCats(ids: number[]): string {
  return ids.length > 0 ? `/catalogo?cats=${ids.join(",")}` : "/catalogo";
}

/** Enlace filtrado por una sola categoría del ERP, por nombre. */
export function hrefCategoria(nombre: string): string {
  return hrefCats(idsDe(nombre));
}

/**
 * Enlace a categoría CRUZADA con especie: /catalogo?cats=3&para=gato
 *
 * `para` ya lo entendía `app/catalogo/page.tsx` desde que existe el filtro
 * lateral; acá simplemente se usa para armar el segundo nivel del menú. Se
 * apoya en `cats` y no lo reemplaza: un enlace de especie sin categoría
 * mostraría 159 de 184 productos, que es el caso que este archivo prohíbe.
 */
export function hrefCatsEspecie(ids: number[], especie: ClaveEspecie): string {
  return ids.length > 0 ? `${hrefCats(ids)}&para=${especie}` : "/catalogo";
}

// Se conservan para las tarjetas de la portada (`destacadas`), que sí son una
// selección escrita a mano: cuatro categorías elegidas por surtido, no el
// catálogo entero. El MENÚ ya no las usa.
const JUGUETES = idsDe("Juguetes");
const ROPA_PASEO = idsDe("Ropa y paseo");
const CASA_COMIDA = idsDe("Casa y comida");
const HIGIENE_SALUD = idsDe("Higiene y salud");

/**
 * Las categorías raíz que HOY tienen productos, en el orden que manda el ERP.
 *
 * No hay ninguna lista de nombres acá a propósito: si mañana el ERP publica
 * "Alimento" y "Snacks y premios", aparecen en el menú sin tocar este archivo.
 * Ese es el punto del campo `orden` (ver el encabezado).
 *
 * Solo raíces: las subcategorías (Alimento seco, Alimento húmedo) no entran al
 * menú todavía porque el encabezado tiene dos niveles y el primero se lo lleva
 * la mascota. Viven en el filtro lateral del catálogo.
 */
const RAICES = categorias
  .filter((c) => c.padre_id === null)
  .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"));

const productos = productosJson as Producto[];

/** Ids de una raíz más los de todas sus hijas: un producto vive en la hoja. */
function ramaDe(raizId: number): Set<number> {
  return new Set([
    raizId,
    ...categorias.filter((c) => c.padre_id === raizId).map((c) => c.id),
  ]);
}

/**
 * ¿Esta categoría tiene algo para esta especie?
 *
 * Hace falta porque el menú de perro y el de gato NO pueden ser la misma
 * lista: "Rascadores y muebles" son 19 productos, todos de gato, y
 * "Perro › Rascadores y muebles" llevaba a una página vacía. Lo cazó
 * `lib/enlaces.test.ts` el 01/09/2026 antes de que lo viera un cliente, que
 * es exactamente para lo que esa prueba existe.
 *
 * Se calcula de los productos publicados en vez de escribir a mano qué
 * categoría es de perro y cuál de gato: esa lista escrita a mano envejece —es
 * el mismo error que tenía el menú antes— y además el surtido cambia. Si
 * mañana entra un rascador para perro, aparece solo.
 */
function tieneProductos(raizId: number, clave: ClaveEspecie): boolean {
  const rama = ramaDe(raizId);
  return productos.some(
    (p) => p.categoria_id !== null && rama.has(p.categoria_id) && esParaEspecie(p.mascota ?? "", clave),
  );
}

/**
 * Navegación principal: una sección por MASCOTA, con las categorías adentro.
 *
 * Cada especie arma sus grupos por separado —y no comparten un arreglo— para
 * que el día que el menú de gato tenga que diferir del de perro (arena y
 * rascadores para gato, entrenamiento para perro, como hacen las tiendas
 * grandes) sea un cambio local y no una excepción incrustada.
 *
 * Se descarta la especie que no tenga ni una categoría con producto: una
 * puerta que no lleva a nada es peor que no tener la puerta.
 */
function seccionDeEspecie(clave: ClaveEspecie, label: string): SeccionNav | null {
  const grupos: GrupoNav[] = RAICES.filter((c) => tieneProductos(c.id, clave))
    .map((c) => ({ label: c.nombre, href: hrefCatsEspecie([c.id], clave) }))
    .filter((g) => g.href !== "/catalogo");

  if (grupos.length === 0) return null;
  return { id: clave, label, href: hrefEspecie(clave), grupos };
}

export const navegacion: SeccionNav[] = ESPECIES.map((e) =>
  // "Perros" → "Perro": el menú nombra al animal, no al grupo. Es como lo
  // dice quien compra ("algo para mi perro") y como lo rotulan las tiendas
  // del rubro.
  seccionDeEspecie(e.clave, e.label.replace(/s$/, "")),
).filter((s): s is SeccionNav => s !== null);

/**
 * Las cuatro tarjetas de categoría del inicio.
 *
 * Son las cuatro secciones con más surtido, con el detalle que ayuda a
 * decidir. Se limitan a cuatro por la retícula: una quinta rompe la fila en
 * escritorio y deja un hueco que se ve como un error.
 *
 * ── CÓMO AGREGAR LAS FOTOS (cuando estén elegidas)
 * 1. Guardar el archivo en `public/categorias/` con el nombre de abajo.
 * 2. Descomentar la línea `imagen` de esa tarjeta.
 * 3. Si el sujeto no está centrado, ajustar `posicion` (ej. "70% 40%") para
 *    que el recorte en móvil no lo decapite.
 * Nada más. El scrim de TarjetaCategoria se encarga de que el texto siga
 * siendo legible sobre cualquier foto razonable.
 *
 * Mientras no haya foto, la tarjeta usa su tinte de la paleta. No se ve rota:
 * se ve intencional. Los criterios de selección están en docs/DIRECCION-DE-ARTE.md
 * —vale la pena leerlo antes de elegir, sobre todo la parte de licencias.
 */
export interface DestacadaNav {
  nombre: string;
  detalle: string;
  href: string;
  imagen?: string;
  posicion?: string;
  tinte: string;
  /** Clave de components/IconoCategoria. Replica la señalética con iconos
   *  que el local tiene junto a la puerta: reconocer una forma es más rápido
   *  que leer una palabra. */
  icono: string;
}

export const destacadas: DestacadaNav[] = [
  {
    nombre: "Juguetes",
    detalle: "Peluches, mordedores y pelotas",
    href: hrefCats(JUGUETES),
    tinte: "bg-crema-300",
    icono: "juguetes",
    imagen: "/categorias/juguetes.jpg",
    posicion: "center 45%",
  },
  {
    nombre: "Ropa y paseo",
    detalle: "Arneses, correas, collares y ropa",
    href: hrefCats(ROPA_PASEO),
    tinte: "bg-dorado-100",
    icono: "paseo",
    imagen: "/categorias/paseo.jpg",
    posicion: "center 40%",
  },
  {
    nombre: "Casa y comida",
    detalle: "Camas, casas, comederos y transporte",
    href: hrefCats(CASA_COMIDA),
    tinte: "bg-crema-400",
    icono: "gatos",
    imagen: "/categorias/hogar.jpg",
    posicion: "center 40%",
  },
  {
    nombre: "Higiene y salud",
    detalle: "Baño, cepillado y cuidado",
    href: hrefCats(HIGIENE_SALUD),
    tinte: "bg-navy-50",
    icono: "higiene",
    imagen: "/categorias/higiene.jpg",
    posicion: "center",
  },
].filter((d) => d.href !== "/catalogo");


/**
 * ENLACE POR ESPECIE SOLA — /catalogo?para=gato
 *
 * `app/catalogo/page.tsx` entiende `?para=` desde que existe el filtro
 * lateral; lo que faltaba era un ayudante para armar el enlace.
 *
 * ── POR QUÉ ESTO NO CONTRADICE A hrefCatsEspecie
 * Arriba está escrito que "un enlace de especie sin categoría mostraría 159
 * de 184 productos, que es el caso que este archivo prohíbe". Eso vale para
 * la NAVEGACIÓN, y sigue en pie: el menú no usa esta función y las secciones
 * siguen siendo las cuatro categorías del ERP.
 *
 * Esta función existe solo para las dos puertas del inicio, donde el criterio
 * es otro: una portada orienta, no filtra. Ver el encabezado de
 * `components/PuertaEspecie.tsx` para el argumento completo.
 */
export function hrefEspecie(especie: ClaveEspecie): string {
  return `/catalogo?para=${especie}`;
}

/**
 * LAS DOS PUERTAS DEL INICIO
 *
 * El conteo NO va acá: se calcula en `app/page.tsx` contra los productos
 * reales con `esParaEspecie`, para que no exista una cifra escrita a mano que
 * se desactualice cuando cambie el inventario. Es el mismo principio que rige
 * `secciones()`: la navegación refleja el catálogo que existe.
 *
 * Las dos puertas ya tienen foto propia. Para cambiar una: guardar el archivo
 * en `public/categorias/` y ajustar `imagen` y, si hace falta, `posicion`
 * (el encuadre se verifica en pantalla, no se supone — el texto de la puerta
 * vive abajo a la izquierda y no debe tapar al animal).
 */
export interface PuertaNav {
  clave: ClaveEspecie;
  nombre: string;
  icono: string;
  tinte: string;
  imagen?: string;
  posicion?: string;
}

export const PUERTAS: PuertaNav[] = [
  {
    clave: "perro",
    nombre: "Para perro",
    icono: "huella",
    tinte: "bg-crema-300",
    imagen: "/categorias/paseo.jpg",
    posicion: "center 40%",
  },
  {
    clave: "gato",
    nombre: "Para gato",
    icono: "gatos",
    tinte: "bg-navy-50",
    // Foto definitiva desde el 17/08/2026: gato jugando, aportada por Oscar.
    // Reemplaza a higiene.jpg (un gato siendo bañado), que era provisional y
    // transmitía estrés justo donde hay que dar ganas de entrar. Esta muestra
    // producto real de la tienda en uso —pelota, ratón, rascador— sin que
    // parezca un catálogo.
    //
    // Nota de resolución: 1108x736, más chica que las otras fotos de
    // categoría (2400x1600). Alcanza para el tamaño al que se muestra la
    // puerta (~575px), pero en pantallas muy grandes y de alta densidad se
    // verá algo menos nítida que las demás. Si aparece el original en mayor
    // resolución, vale la pena reemplazarla.
    imagen: "/categorias/gato.jpg",
    posicion: "center 45%",
  },
];

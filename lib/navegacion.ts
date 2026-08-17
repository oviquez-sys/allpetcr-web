import categoriasJson from "@/data/categorias.json";
import type { Categoria } from "./types";

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
 * ── POR QUÉ CUATRO SECCIONES Y NO CINCO
 * Las categorías del ERP son cinco, pero Acuario tiene HOY cero productos en
 * existencia y el ERP publica solo lo que hay. `idDe("Acuario")` devuelve null,
 * `secciones()` descarta la sección y el menú queda con cuatro. Cuando entre
 * mercadería de acuario, la quinta aparece sola: no hay que tocar este archivo.
 *
 * El principio es el mismo de siempre: la navegación refleja el catálogo que
 * existe, no el que uno quisiera tener.
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

const JUGUETES = idsDe("Juguetes");
const ROPA_PASEO = idsDe("Ropa y paseo");
const CASA_COMIDA = idsDe("Casa y comida");
const HIGIENE_SALUD = idsDe("Higiene y salud");
const ACUARIO = idsDe("Acuario");

/**
 * Navegación principal: una sección por categoría del ERP.
 *
 * El segundo nivel ya no son subcategorías —no existen— sino la especie
 * cruzada con la categoría. Ver el encabezado del archivo para el porqué y
 * para los conteos que respaldan que ninguna combinación queda vacía.
 *
 * `secciones()` descarta las que no tienen id: una categoría sin existencias
 * no sale en data/categorias.json, y un enlace a /catalogo pelado mostraría
 * el catálogo completo fingiendo que filtra.
 */
function seccion(
  id: string,
  label: string,
  ids: number[],
): SeccionNav | null {
  if (ids.length === 0) return null;
  return {
    id,
    label,
    href: hrefCats(ids),
    grupos: ESPECIES.map((e) => ({
      label: `Para ${e.label.toLowerCase()}`,
      href: hrefCatsEspecie(ids, e.clave),
    })),
  };
}

export const navegacion: SeccionNav[] = [
  seccion("juguetes", "Juguetes", JUGUETES),
  seccion("ropa-paseo", "Ropa y paseo", ROPA_PASEO),
  seccion("casa-comida", "Casa y comida", CASA_COMIDA),
  seccion("higiene-salud", "Higiene y salud", HIGIENE_SALUD),
  seccion("acuario", "Acuario", ACUARIO),
].filter((s): s is SeccionNav => s !== null);

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


/**
 * Búsqueda tolerante a errores de escritura (Bloque 5, ítem 32).
 *
 * Sin dependencias nuevas a propósito: es un problema chico (532 productos,
 * nombres cortos) y un Levenshtein por palabra alcanza — traer una
 * librería de búsqueda difusa completa sería resolver con una grúa lo que
 * resuelve un destornillador.
 *
 * CÓMO FUNCIONA
 * -------------
 * 1. Coincidencia exacta primero (substring, como antes): "correa" en
 *    "Correa Retráctil" sigue siendo instantáneo y no cambia de
 *    comportamiento para quien escribe bien.
 * 2. Si no hay coincidencia exacta, se compara PALABRA A PALABRA: cada
 *    palabra del término buscado se compara contra cada palabra del texto
 *    con distancia de Levenshtein. Tolera 1 error en palabras cortas y 2 en
 *    palabras largas — "coyar" encuentra "collar" (2 letras), "correa"
 *    encuentra "correa" con una letra de más o de menos.
 *
 * Por qué palabra a palabra y no la frase completa: comparar "correa retra"
 * contra "correa retráctil" entero da una distancia grande aunque el error
 * esté en una sola palabra. Comparando palabra por palabra, cada una se
 * mide contra su mejor candidata.
 */

// Marcas diacríticas combinantes (acentos, tildes) que quedan sueltas tras
// normalizar a NFD: "á" se separa en "a" + U+0301. Escrito como \u.... y no
// como el carácter literal para que no dependa de cómo el editor lo guarde.
const QUITAR_DIACRITICOS = /[̀-ͯ]/g;

// El ERP arma el nombre de un producto pegando marca + nombre de factura +
// presentación ("Balance Ad Cat Chicken" + "10 kg"), y la presentación
// siempre lleva un espacio entre el número y la unidad. Escribir "10kg"
// pegado —lo más natural al teclear rápido— no es una subcadena de "10 kg",
// así que la búsqueda no encontraba ningún alimento por peso (28/09/2026,
// pedido de Oscar). Sacar ese espacio acá, en normalizar(), hace que "10kg"
// y "10 kg" pasen a ser el mismo texto sin importar cuál de los dos se
// escribió — funciona para el nombre del producto Y para lo que la persona
// tipeó, porque los dos pasan por esta misma función.
const UNIDADES_DE_PESO = ["kg", "g", "lb", "oz", "ml", "l"];
const ESPACIO_ENTRE_NUMERO_Y_UNIDAD = new RegExp(`(\\d)\\s+(${UNIDADES_DE_PESO.join("|")})\\b`, "gi");

export function normalizar(texto: string | null | undefined): string {
  // Defensivo a propósito: esto ya rompió una vez en el navegador porque
  // la API mandaba un campo undefined (ver api/serializers.py del ERP,
  // corregido) y coincideAproximado() lo pasaba tal cual. El campo que
  // faltaba ya se arregló en el ERP, pero esta función no debería volver
  // a tumbar la búsqueda si algún día falta otro dato inesperado.
  if (!texto) return "";
  return texto
    .normalize("NFD")
    .replace(QUITAR_DIACRITICOS, "")
    .toLowerCase()
    .trim()
    .replace(ESPACIO_ENTRE_NUMERO_Y_UNIDAD, "$1$2");
}

/** Distancia de Levenshtein clásica (programación dinámica, O(n·m)). */
export function distanciaLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let fila = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const filaAnterior = fila;
    fila = [i];
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      fila.push(
        Math.min(
          filaAnterior[j] + 1, // borrar
          fila[j - 1] + 1, // insertar
          filaAnterior[j - 1] + costo, // sustituir
        ),
      );
    }
  }
  return fila[b.length];
}

// Palabras de 3 letras o menos no entran al difuso: a esa longitud, casi
// cualquier par de palabras cortas queda "cerca" en Levenshtein y el
// resultado deja de servir (falsos positivos). Con 4 o más letras hay
// suficiente información para distinguir un error de tipeo real de una
// palabra distinta.
const LARGO_MINIMO_DIFUSO = 4;

// Proporción de letras que tienen que "coincidir" para aceptar la palabra
// como la misma con errores. 0.65 es lo que hace pasar el caso de
// referencia (coyar/collar, 4 de 6 letras iguales = 0.667) sin aceptar
// pares de palabras cortas que solo comparten la mitad de las letras por
// casualidad (casa/mesa, 0.5). Calibrado a mano contra esos dos casos, no
// medido con datos reales de búsquedas — si en producción se ve corto o
// largo, es el único número que hay que tocar.
const SIMILITUD_MINIMA = 0.65;

function similares(a: string, b: string): boolean {
  if (a.length < LARGO_MINIMO_DIFUSO || b.length < LARGO_MINIMO_DIFUSO) return false;
  // Misma primera letra (20/10/2026): casi nadie se equivoca en la primera
  // letra ("coyar" → "collar"), y sin esta regla "pato" (alimento de pato)
  // traía todo lo de "gato" — una letra de diferencia, 75 % de parecido.
  if (a[0] !== b[0]) return false;
  const largoMax = Math.max(a.length, b.length);
  const similitud = (largoMax - distanciaLevenshtein(a, b)) / largoMax;
  return similitud >= SIMILITUD_MINIMA;
}

/**
 * Equivalencias (auditoría F3-01, 16/10/2026): "comida cachorro" devolvía un
 * solo producto mientras "cachorro" devolvía once, porque los alimentos dicen
 * "alimento" o "Puppy", no "comida". Cada grupo son palabras que el cliente
 * usa para lo mismo. Lista corta y a mano a propósito: es corregir casos
 * concretos, no reescribir el buscador. Las de 3 letras ("cat", "dog") solo
 * valen como palabra completa, para que "cat" no encuentre "catalogo".
 */
const EQUIVALENCIAS: string[][] = [
  ["comida", "alimento", "concentrado", "croqueta", "food"],
  ["cachorro", "puppy", "junior"],
  ["gatito", "kitten"],
  ["adulto", "adult"],
  ["perro", "dog"],
  ["gato", "cat"],
  ["golosina", "snack", "premio", "treat"],
];

function equivalentes(palabra: string): string[] {
  const grupo = EQUIVALENCIAS.find((g) => g.some((e) => palabra === e || (e.length >= LARGO_MINIMO_DIFUSO && palabra.startsWith(e))));
  return grupo ? [palabra, ...grupo.filter((e) => e !== palabra)] : [palabra];
}

function palabras(texto: string | null | undefined): string[] {
  return normalizar(texto).split(/\s+/).filter(Boolean);
}

/**
 * Buscador "inteligente" (20/10/2026, pedido de Oscar): "comida perro
 * cachorro" tiene que mostrar todos los alimentos de cachorro.
 *
 * Cada producto llega del ERP con `etiquetas`: las palabras que la gente usa
 * para encontrarlo (sinónimos en español e inglés, la mascota, la etapa y el
 * tamaño de raza de su ficha técnica…). La lista de sinónimos vive en UN
 * solo lugar, el ERP (catalogo/palabras_clave.py); acá solo se busca.
 *
 * Reglas (las mismas del ERP):
 * - se ignoran palabras vacías ("comida PARA perro"),
 * - "cachorros" también busca "cachorro",
 * - cada palabra tiene que aparecer al INICIO de una palabra del producto
 *   (nombre, presentación, descripción, categoría o etiquetas): "pato" no
 *   encuentra "zapatos",
 * - la tolerancia a errores de escritura ("coyar" → "collar") se aplica solo
 *   contra el NOMBRE: contra las etiquetas daría "pato" ≈ "gato".
 */
export const PALABRAS_VACIAS = new Set([
  "para", "de", "del", "con", "el", "la", "los", "las", "y", "en", "un", "una",
  "unos", "unas", "mi", "su", "al", "que", "por", "o", "a",
]);

function tokens(texto: string | null | undefined): string[] {
  return normalizar(texto).replace(/[^a-z0-9]+/g, " ").split(" ").filter(Boolean);
}

function variantes(palabra: string): string[] {
  const v = [palabra];
  if (palabra.length > 4 && palabra.endsWith("es") && !palabra.endsWith("ses")) v.push(palabra.slice(0, -2));
  if (palabra.length > 3 && palabra.endsWith("s")) v.push(palabra.slice(0, -1));
  return v;
}

export interface CamposBusqueda {
  nombre: string;
  presentacion?: string;
  descripcion?: string;
  categorias?: string;
  etiquetas?: string;
}

export function coincideProducto(campos: CamposBusqueda, termino: string): boolean {
  const buscadas = tokens(termino).filter((w) => !PALABRAS_VACIAS.has(w));
  if (buscadas.length === 0) return true;
  const todas = tokens(
    `${campos.nombre} ${campos.presentacion ?? ""} ${campos.descripcion ?? ""} ${campos.categorias ?? ""} ${campos.etiquetas ?? ""}`,
  );
  const delNombre = tokens(campos.nombre);
  return buscadas.every((pt) => {
    if (variantes(pt).some((v) => todas.some((px) => px.startsWith(v)))) return true;
    const otras = equivalentes(pt).slice(1);
    if (otras.some((e) => todas.some((px) => (e.length < LARGO_MINIMO_DIFUSO ? px === e : px.startsWith(e))))) return true;
    return delNombre.some((px) => similares(pt, px));
  });
}

/** True si CADA palabra del término aparece —exacta o aproximada— en el
 * texto. Es un AND entre palabras buscadas, no un OR: buscar "arnes gato"
 * no debería devolver cualquier cosa que tenga "gato". */
export function coincideAproximado(texto: string | null | undefined, termino: string): boolean {
  const terminoNorm = normalizar(termino);
  if (!terminoNorm) return true;
  if (normalizar(texto).includes(terminoNorm)) return true; // camino rápido, sin fuzzy

  const palabrasTexto = palabras(texto);
  const palabrasTermino = palabras(termino);

  return palabrasTermino.every((pt) => {
    if (palabrasTexto.some((px) => px.includes(pt))) return true; // substring por palabra
    const otras = equivalentes(pt).slice(1);
    if (otras.some((e) => palabrasTexto.some((px) => (e.length < LARGO_MINIMO_DIFUSO ? px === e : px.includes(e))))) return true;
    return palabrasTexto.some((px) => similares(pt, px));
  });
}

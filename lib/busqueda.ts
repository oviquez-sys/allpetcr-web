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
    .trim();
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
  const largoMax = Math.max(a.length, b.length);
  const similitud = (largoMax - distanciaLevenshtein(a, b)) / largoMax;
  return similitud >= SIMILITUD_MINIMA;
}

function palabras(texto: string | null | undefined): string[] {
  return normalizar(texto).split(/\s+/).filter(Boolean);
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
    return palabrasTexto.some((px) => similares(pt, px));
  });
}

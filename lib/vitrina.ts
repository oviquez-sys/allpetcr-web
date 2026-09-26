import type { Producto } from "./types";

/** Cuántas tarjetas trae "La vitrina" de la portada. */
export const CANTIDAD_VITRINA = 12;

/**
 * "La vitrina" de la portada — merchandising manual con relleno automático
 * (26/09/2026, a pedido de Oscar: "los primeros productos que vea un
 * visitante deben ser los más atractivos y representativos, no los primeros
 * que devuelve la base de datos").
 *
 * ANTES se armaba sola: repartía `disponibles` por categoría en round-robin
 * para que no saliera todo de "Juguetes" (ver el historial de este archivo).
 * Funcionaba, pero no dejaba a Oscar elegir qué producto recibe al
 * visitante — eso lo decide la tienda, no un algoritmo de reparto.
 *
 * AHORA, en dos pasos:
 *
 *   1. DESTACADOS A MANO — los productos marcados `destacado_home` en el
 *      ERP entran primero, en el orden que diga `orden_home` (menor
 *      primero). Nunca alfabético. Se exige foto (`imagen`): esta sección
 *      es una vidriera, y un destacado sin foto no cumple el objetivo de
 *      "productos visualmente atractivos" que pidió Oscar. `disponibles`
 *      ya llega filtrado por stock (`Producto.disponible`), así que un
 *      destacado sin existencia queda afuera solo, sin lógica extra acá.
 *
 *   2. RELLENO AUTOMÁTICO — si con eso no se llenan los `cantidad` lugares
 *      (pocos destacados todavía, o alguno se quedó sin stock justo hoy),
 *      el resto se completa con el reparto de siempre: por categoría, la
 *      más surtida primero, sin repetir nombre de producto. Es el mismo
 *      criterio de antes, ahora como respaldo en vez de ser todo el
 *      sistema — para que la vidriera nunca se vea vacía ni "cargada por
 *      SKU" mientras Oscar termina de elegir sus destacados.
 *
 * Ningún nombre se repite en la vitrina (ni entre destacados, ni en el
 * relleno, ni entre los dos): el ERP tiene nombres repetidos para
 * variantes ("Arnés chaleco" nueve veces) y dos tarjetas idénticas sin
 * nada que las diferencie no ayudan a nadie en un escaparate de doce.
 *
 * Determinista: mismo catálogo y mismos destacados, misma vitrina. No
 * toca el orden del catálogo completo (/catalogo) ni el de ninguna otra
 * pantalla — esto es solo esta sección de la portada.
 */
export function armarVitrina(disponibles: Producto[], cantidad: number = CANTIDAD_VITRINA): Producto[] {
  const nombresUsados = new Set<string>();
  const vitrina: Producto[] = [];

  // ── 1. Destacados a mano, en el orden que eligió Oscar ──
  const destacados = [...disponibles]
    .filter((p) => p.destacado_home && p.imagen)
    .sort((a, b) => (a.orden_home ?? Number.MAX_SAFE_INTEGER) - (b.orden_home ?? Number.MAX_SAFE_INTEGER));
  for (const p of destacados) {
    if (vitrina.length >= cantidad) break;
    if (nombresUsados.has(p.nombre)) continue;
    vitrina.push(p);
    nombresUsados.add(p.nombre);
  }

  // ── 2. Relleno automático por categoría, si hacen falta más lugares ──
  if (vitrina.length < cantidad) {
    const porCategoria = new Map<number | null, Producto[]>();
    for (const p of disponibles) {
      if (nombresUsados.has(p.nombre)) continue; // ya entró como destacado
      const lista = porCategoria.get(p.categoria_id) ?? [];
      lista.push(p);
      porCategoria.set(p.categoria_id, lista);
    }
    const orden = [...porCategoria.keys()].sort(
      (a, b) => (porCategoria.get(b)?.length ?? 0) - (porCategoria.get(a)?.length ?? 0),
    );
    const conFoto = new Map(
      [...porCategoria.entries()].map(([cat, lista]) => [cat, lista.filter((p) => p.imagen)]),
    );
    const indice = new Map<number | null, number>(orden.map((cat) => [cat, 0]));

    for (let vuelta = 0; vitrina.length < cantidad && vuelta < 200; vuelta++) {
      let agregoAlguno = false;
      for (const cat of orden) {
        if (vitrina.length >= cantidad) break;
        const lista = conFoto.get(cat) ?? [];
        let i = indice.get(cat) ?? 0;
        while (i < lista.length && nombresUsados.has(lista[i].nombre)) i++;
        if (i < lista.length) {
          vitrina.push(lista[i]);
          nombresUsados.add(lista[i].nombre);
          indice.set(cat, i + 1);
          agregoAlguno = true;
        } else {
          indice.set(cat, i);
        }
      }
      if (!agregoAlguno) break; // se agotaron los nombres distintos con foto
    }
  }

  return vitrina;
}

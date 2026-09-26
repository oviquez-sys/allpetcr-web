import type { Categoria, Producto } from "./types";

export const ESPECIES = [
  { clave: "perro", label: "Perros", coincide: ["Perro", "Perro y gato"] },
  { clave: "gato", label: "Gatos", coincide: ["Gato", "Perro y gato"] },
] as const;
export type ClaveEspecie = (typeof ESPECIES)[number]["clave"];
export function esParaEspecie(mascota: string, clave: ClaveEspecie): boolean {
  return (ESPECIES.find((e) => e.clave === clave)!.coincide as readonly string[]).includes(mascota);
}
export interface GrupoNav { label: string; href: string }
export interface SeccionNav { id: string; label: string; href: string; grupos: GrupoNav[] }
export interface DestacadaNav { nombre: string; detalle: string; href: string; imagen?: string; posicion?: string; tinte: string; icono: string }
export function hrefCats(ids: number[]): string {
  return ids.length ? `/catalogo?cats=${ids.join(",")}` : "/catalogo";
}
export function hrefEspecie(especie: ClaveEspecie): string {
  return `/catalogo?para=${especie}`;
}
export function hrefCatsEspecie(ids: number[], especie: ClaveEspecie): string {
  return ids.length ? `${hrefCats(ids)}&para=${especie}` : hrefEspecie(especie);
}
/** Incluye descendientes y termina aunque el ERP contenga un ciclo. */
export function idsRama(categorias: Categoria[], id: number): number[] {
  const ids = new Set([id]);
  const pendientes = [id];
  while (pendientes.length) {
    const padre = pendientes.pop();
    for (const categoria of categorias) {
      if (categoria.padre_id === padre && !ids.has(categoria.id)) {
        ids.add(categoria.id);
        pendientes.push(categoria.id);
      }
    }
  }
  return [...ids];
}
/** Raíces que forman la división de alimentos (26/09/2026). Se reconocen por
 *  nombre porque son parte del árbol oficial del ERP (`asegurar_categorias`)
 *  y no cambian; la misma lista vive en `catalogo/divisiones.py`. */
export const RAICES_ALIMENTO = ["Alimento", "Snacks y premios"];

function porOrden(a: Categoria, b: Categoria): number {
  return a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es");
}

/**
 * Sección "Alimentos" del menú: cada formato separado por especie
 * ("Alimento seco para perro", "Snacks y premios para gato"…). La especie no
 * es una categoría —es el campo `mascota` del producto—, así que se combina
 * acá con `para=`, igual que el resto del menú. Solo aparecen los grupos con
 * existencia, y la sección entera no aparece si no hay alimento disponible.
 */
export function construirAlimentos(categorias: Categoria[], productos: Producto[]): SeccionNav | null {
  const raices = categorias.filter((c) => c.padre_id === null && RAICES_ALIMENTO.includes(c.nombre)).sort(porOrden);
  if (!raices.length) return null;
  // Cada raíz se ofrece por sus subcategorías (seco, húmedo…); una raíz sin
  // subcategorías (Snacks y premios) se ofrece entera.
  const hojas = raices.flatMap((r) => {
    const hijas = categorias.filter((c) => c.padre_id === r.id).sort(porOrden);
    return hijas.length ? [...hijas, r] : [r];
  });
  const grupos: GrupoNav[] = [];
  for (const e of ESPECIES) {
    const especie = e.clave === "perro" ? "perro" : "gato";
    for (const c of hojas) {
      const esRaizConHijas = c.padre_id === null && categorias.some((h) => h.padre_id === c.id);
      // Una raíz con hijas solo aparece si hay productos colgados directo de
      // ella (sin formato asignado); sus hijas ya cubren el resto.
      const ids = esRaizConHijas ? [c.id] : idsRama(categorias, c.id);
      const hay = productos.some((p) => p.disponible && p.categoria_id !== null && ids.includes(p.categoria_id) && esParaEspecie(p.mascota, e.clave));
      if (hay) grupos.push({ label: `${c.nombre} para ${especie}`, href: hrefCatsEspecie([c.id], e.clave) });
    }
  }
  if (!grupos.length) return null;
  return { id: "alimentos", label: "Alimentos", href: hrefCats(raices.map((r) => r.id)), grupos };
}

/** Los datos los suministra el servidor desde el ERP; nunca un JSON empaquetado. */
export function construirNavegacion(categorias: Categoria[], productos: Producto[]): SeccionNav[] {
  const raices = categorias.filter((c) => c.padre_id === null).sort(porOrden);
  const alimentos = construirAlimentos(categorias, productos);
  // Alimentos va primero: es lo que la gente viene a comprar (mismo criterio
  // que el orden del árbol en el ERP).
  return [...(alimentos ? [alimentos] : []), ...ESPECIES.map((e) => ({
    id: e.clave, label: e.label, href: hrefEspecie(e.clave),
    grupos: raices.filter((c) => {
      const rama = idsRama(categorias, c.id);
      return productos.some((p) => p.disponible && p.categoria_id !== null && rama.includes(p.categoria_id) && esParaEspecie(p.mascota, e.clave));
    }).map((c) => ({ label: c.nombre, href: hrefCatsEspecie([c.id], e.clave) })),
  }))];
}
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

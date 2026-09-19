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
/** Los datos los suministra el servidor desde el ERP; nunca un JSON empaquetado. */
export function construirNavegacion(categorias: Categoria[], productos: Producto[]): SeccionNav[] {
  const raices = categorias.filter((c) => c.padre_id === null)
    .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"));
  return ESPECIES.map((e) => ({
    id: e.clave, label: e.label, href: hrefEspecie(e.clave),
    grupos: raices.filter((c) => {
      const rama = idsRama(categorias, c.id);
      return productos.some((p) => p.disponible && p.categoria_id !== null && rama.includes(p.categoria_id) && esParaEspecie(p.mascota, e.clave));
    }).map((c) => ({ label: c.nombre, href: hrefCatsEspecie([c.id], e.clave) })),
  }));
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

/**
 * CONTENIDO EDITORIAL DEL INICIO — rediseño 26/09/2026
 *
 * Lo que la portada muestra y que NO sale del ERP: fotos de ambiente, marcas,
 * fotos de la comunidad. Vive acá, en un solo lugar, para que cambiarlo no
 * obligue a tocar componentes.
 *
 * La regla de siempre: nada inventado. Una lista vacía no rompe nada —la
 * sección correspondiente simplemente no se pinta— y es preferible a una
 * sección con marcas que no se venden o fotos de clientes que no existen.
 */

/** Marcas que de verdad se venden en la tienda. `logo` es una ruta en
 *  /public (idealmente SVG o PNG monocromo, ver components/inicio/Marcas.tsx).
 *  Vacío a propósito: el ERP no tiene campo de marca y todavía no hay una
 *  lista confirmada. Con al menos una entrada, la sección aparece sola. */
export const MARCAS: { nombre: string; logo: string }[] = [];

/** Fotos reales de clientes y sus mascotas, con permiso. Vacío hasta que las
 *  haya: con al menos una, aparece la sección "Comunidad AllPet". */
export const FOTOS_COMUNIDAD: { src: string; alt: string }[] = [];

/** Foto real del local. `null` mientras no exista: la sección de la tienda
 *  está diseñada para verse completa sin ella (dirección, horario, retiro).
 *
 *  OJO: `local.jpeg` en la carpeta del proyecto es un render, no una foto —el
 *  cartel de la vitrina dice "tamilla"—. Mostrarlo como "nuestra tienda"
 *  sería presentar algo inventado como real. */
export const FOTO_TIENDA: { src: string; alt: string } | null = null;

/**
 * COMPRAR POR ACTIVIDAD — cada actividad apunta a categorías REALES del ERP,
 * resueltas por nombre y enlazadas por id (nunca por nombre, ver
 * lib/enlaces.test.ts). Una actividad sin productos con existencia no se
 * muestra.
 *
 * `imagen` es opcional: hoy no hay fotos de ambiente suficientes para las
 * seis sin repetir las que ya usa la portada, así que el bloque es
 * tipográfico. Con foto en las seis, conviene pasarlas todas a la vez —una
 * sola con foto al lado de cinco sin ella se lee como error—.
 */
export interface Actividad {
  nombre: string;
  categorias: string[];
  imagen?: string;
}

export const ACTIVIDADES: Actividad[] = [
  { nombre: "Pasear", categorias: ["Paseo"] },
  { nombre: "Jugar", categorias: ["Juguetes"] },
  { nombre: "Comer", categorias: ["Alimento", "Snacks y premios", "Comederos y bebederos"] },
  { nombre: "Descansar", categorias: ["Descanso"] },
  { nombre: "Cuidar", categorias: ["Higiene y aseo", "Salud y cuidado"] },
  { nombre: "Viajar", categorias: ["Transporte"] },
];

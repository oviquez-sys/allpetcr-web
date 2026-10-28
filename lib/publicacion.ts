import type { Categoria, MotivoConsulta, Producto } from "./types";
import { nombreLegible } from "./nombreLegible";

/**
 * REGLAS DE PUBLICACIÓN — auditoría de prelanzamiento del 16/10/2026
 *
 * El contenido de cada ficha vive en el ERP y lo cargan los dueños. Este
 * archivo es la red de seguridad del sitio para que una ficha incompleta no
 * se venda como si estuviera lista, sin esperar a que alguien la corrija a
 * mano en el sistema:
 *
 *  1. RETIRADAS (F4-07, F8-03). Una ficha con una nota interna en el texto
 *     ("revisar en tienda antes de publicar", "FOTO PENDIENTE") no se publica:
 *     no aparece en el catálogo, ni en Google, ni se puede pedir. Borrar la
 *     nota no basta para que vuelva: el artículo tiene que estar identificado.
 *     Por eso también hay una lista explícita de SKU.
 *
 *  2. SOLO CON CONSULTA (F4-01, F4-05). Siguen visibles, pero en vez de
 *     "Agregar al carrito" ofrecen consultar por WhatsApp:
 *     - Antipulgas y antiparasitarios sin la información de la etiqueta. Se
 *       habilitan SOLOS cuando la descripción del ERP incluye principio
 *       activo, modo de uso y advertencias (transcritos de la etiqueta real:
 *       nunca se inventan).
 *     - Ropa sin una talla única elegible: el sitio no tiene selector de
 *       variantes, así que "Tallas M y L" obliga a adivinar qué se pide. Se
 *       habilita cuando el nombre o la presentación dicen una sola talla.
 *
 * El checkout del servidor aplica las mismas reglas: aunque alguien tenga uno
 * de estos productos guardado en el carrito de antes, no llega al pedido.
 */

/** Fichas retiradas a mano hasta que el artículo esté identificado,
 *  fotografiado y descrito en el ERP. Quitar el SKU de aquí las republica. */
export const SKUS_RETIRADOS: readonly string[] = [
  "147295", // "Juguete": sin identificar, con nota interna (F4-07)
];

/** Texto de trabajo que nunca debe ver un cliente. */
const NOTA_INTERNA = /revisar en tienda|antes de publicar|foto pendiente|\bpendiente de (?:revisi[oó]n|foto|ficha)\b|\bno publicar\b/i;

export function tieneNotaInterna(p: Pick<Producto, "nombre" | "descripcion">): boolean {
  return NOTA_INTERNA.test(p.nombre) || NOTA_INTERNA.test(p.descripcion);
}

export function estaRetirado(p: Pick<Producto, "sku" | "nombre" | "descripcion">): boolean {
  return SKUS_RETIRADOS.includes(p.sku) || tieneNotaInterna(p);
}

// ── Antiparasitarios ────────────────────────────────────────────────────
const ANTIPARASITARIO = /antipulga|pulgas|garrapat|desparasit|antiparasit|ectopar|endopar/i;

/** Lo mínimo para elegir y usar un antiparasitario, transcrito de la
 *  etiqueta: qué contiene, cómo se usa y qué precauciones tiene. */
function antiparasitarioDocumentado(descripcion: string): boolean {
  return /principio activo|ingrediente activo|composici[oó]n/i.test(descripcion) &&
    /modo de uso|instrucciones|c[oó]mo (?:se )?usa|aplicaci[oó]n|dosis/i.test(descripcion) &&
    /advertencia|precauci[oó]n|contraindicaci/i.test(descripcion);
}

// ── Ropa ────────────────────────────────────────────────────────────────
const PRENDA = /camiseta|chaleco|buzo|sudadera|abrigo|chaqueta|impermeable|vestido|\bpolo\b|disfraz|su[eé]ter|pijama|\bcapa\b/i;
const TALLA_UNICA = /\btalla\s+(?:XXS|XS|S|M|L|XL|XXL|XXXL|\d{1,2})\b/i;

// Por el nombre, no por la categoría: así la regla no obliga a pedirle al
// ERP el árbol de categorías en cada consulta de una ficha.
function esPrenda(p: Producto): boolean {
  return PRENDA.test(p.nombre);
}

/** Una prenda se puede pedir directo si dice UNA talla y no ofrece varias. */
function tallaElegible(p: Producto): boolean {
  const texto = `${p.nombre} ${p.presentacion}`;
  return TALLA_UNICA.test(texto) && !/\btallas\b/i.test(texto);
}

/** Por qué este producto se vende solo con consulta previa, o null si se
 *  puede agregar al carrito. */
export function motivoConsulta(p: Producto): MotivoConsulta | null {
  if (ANTIPARASITARIO.test(p.nombre) && !antiparasitarioDocumentado(p.descripcion)) return "salud";
  if (esPrenda(p) && !tallaElegible(p)) return "talla";
  return null;
}

/** Aplica las reglas a todo lo que llega del ERP: quita las retiradas y
 *  marca las que se venden solo con consulta. */
export function prepararParaPublicar(productos: Producto[]): Producto[] {
  return productos.filter((p) => !estaRetirado(p)).map(prepararFicha);
}

/** Una ficha lista para mostrarse: consulta marcada y nombre legible
 *  (sin MAYÚSCULAS de factura, ver lib/nombreLegible.ts). */
export function prepararFicha(p: Producto): Producto {
  const conConsulta = marcarConsulta(p);
  const nombre = nombreLegible(conConsulta.nombre, conConsulta.marca);
  return nombre === conConsulta.nombre ? conConsulta : { ...conConsulta, nombre };
}

/** Las categorías nuevas también pueden llegar en mayúsculas ("ADORNOS"). */
export function prepararCategorias(categorias: Categoria[]): Categoria[] {
  return categorias.map((c) => {
    const nombre = nombreLegible(c.nombre);
    return nombre === c.nombre ? c : { ...c, nombre };
  });
}

/**
 * Qué tan lista está una ficha para mostrarse arriba del catálogo
 * (27/10/2026). El orden por defecto ("Disponibles primero") dejaba el orden
 * del ERP, que pone lo último cargado de primero: productos recién entrados
 * desde una factura, sin foto ni descripción, eran lo primero que veía un
 * cliente. Con esto suben las fichas completas y bajan las que faltan
 * terminar. No esconde nada: todo sigue en el catálogo y en el buscador.
 */
export function puntajeFicha(p: Producto): number {
  let puntos = 0;
  if (p.imagen) puntos += 4;
  if ((p.descripcion ?? "").trim().length >= 40) puntos += 2;
  if ((p.marca ?? "").trim()) puntos += 1;
  if (!p.solo_consulta) puntos += 1;
  return puntos;
}

/** Solo agrega `solo_consulta` cuando aplica: el resto de los productos
 *  queda idéntico a como lo mandó el ERP. */
export function marcarConsulta(p: Producto): Producto {
  const motivo = motivoConsulta(p);
  return motivo ? { ...p, solo_consulta: motivo } : p;
}

// ── Textos para el cliente ──────────────────────────────────────────────
export const TEXTO_CONSULTA: Record<MotivoConsulta, { boton: string; botonCorto: string; aviso: string; mensaje: string }> = {
  salud: {
    boton: "Consultar por WhatsApp",
    botonCorto: "Consultar antes de comprar",
    aviso:
      "Este producto se vende con asesoría. Antes de comprarlo te confirmamos por WhatsApp o en la tienda " +
      "para qué mascota, peso y edad sirve y cómo se usa, según la etiqueta del fabricante.",
    mensaje: "Hola, quiero que me asesoren sobre este producto antes de comprarlo (para qué mascota, peso y edad sirve y cómo se usa):",
  },
  talla: {
    boton: "Consultar talla disponible",
    botonCorto: "Consultar talla disponible",
    aviso:
      "La talla de este producto todavía no se puede elegir en la web. Escribinos con las medidas de tu " +
      "mascota y te confirmamos qué talla hay disponible antes de preparar el pedido.",
    mensaje: "Hola, quiero consultar qué talla tienen disponible de este producto:",
  },
};

// ── Especie, para no recomendar productos de otra mascota (F4-02) ────────
export type Especie = "perro" | "gato" | "ambos" | "desconocida";

export function especieDe(p: Pick<Producto, "mascota" | "nombre">): Especie {
  const m = p.mascota.toLowerCase();
  const perro = /perro/.test(m);
  const gato = /gato/.test(m);
  if (perro && gato) return "ambos";
  if (perro) return "perro";
  if (gato) return "gato";
  // Sin dato en el ERP: el nombre suele decirlo ("Collar antipulgas gato").
  const n = p.nombre.toLowerCase();
  const nPerro = /\bperros?\b|\bcachorros?\b|\bpuppy\b/.test(n);
  const nGato = /\bgat[oa]s?\b|\bgatitos?\b|\bkitten\b/.test(n);
  if (nPerro && nGato) return "ambos";
  if (nPerro) return "perro";
  if (nGato) return "gato";
  return "desconocida";
}

/** ¿Se puede recomendar `candidato` desde la ficha de `base`? Nunca uno de la
 *  otra especie; y en productos de salud, nunca uno de especie sin
 *  identificar, porque sugeriría que son intercambiables. */
export function recomendable(base: Producto, candidato: Producto): boolean {
  const eb = especieDe(base);
  const ec = especieDe(candidato);
  if ((eb === "perro" && ec === "gato") || (eb === "gato" && ec === "perro")) return false;
  const esSalud = base.solo_consulta === "salud" || ANTIPARASITARIO.test(base.nombre) || ANTIPARASITARIO.test(candidato.nombre);
  if (esSalud && (ec === "desconocida" || eb === "desconocida")) return false;
  if (esSalud && eb !== ec && ec !== "ambos") return false;
  return true;
}

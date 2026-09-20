/** Formato de moneda de Costa Rica, sin decimales (los colones no los usan
 *  en precio de góndola). */
export function formatoColones(valor: number): string {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(valor);
}

// Tintes cálidos para los bloques sin foto. Se elige de forma determinista a
// partir del SKU: así un mismo producto conserva siempre su color (no
// "parpadea" entre recargas) y la grilla se ve variada pero coherente.
const TINTES = [
  "bg-crema-300",
  "bg-dorado-100",
  "bg-navy-50",
  "bg-crema-400",
  "bg-dorado-50",
];

export function tinteDeSku(sku: string): string {
  let suma = 0;
  for (let i = 0; i < sku.length; i++) suma += sku.charCodeAt(i);
  return TINTES[suma % TINTES.length];
}

/**
 * PRESENTACIÓN VISIBLE PARA EL CLIENTE
 *
 * ── EL PROBLEMA
 * `Producto.presentacion` está pensado para lo que un comprador necesita
 * saber del envase: "2 kg", "500 ml", "talla M". Lo que el ERP exporta hoy es
 * otra cosa: "Paquete: 12 / Caja: 216" — cuántas unidades trae el paquete del
 * proveedor y cuántas la caja máster. Es dato de bodega y de compra a
 * mayoreo, y en el sitio lo veía el cliente minorista.
 *
 * De los 184 productos publicados (17/08/2026): 141 traen ese formato, 43
 * vienen vacíos y NINGUNO trae una presentación de venta real. O sea que hoy
 * el campo nunca aporta nada al cliente, y sí confunde: "Paquete: 12" al lado
 * del precio de una unidad sugiere que se está comprando una docena. En el
 * mensaje de pedido por WhatsApp era peor —"1 × Alimentador (Paquete: 12 /
 * Caja: 216)"— porque ahí la confusión se convierte en un pedido mal hecho.
 *
 * ── POR QUÉ UN FILTRO Y NO BORRAR LOS USOS
 * Borrar cada `{producto.presentacion && ...}` resuelve hoy y hay que
 * deshacerlo entero el día que el ERP exporte "2 kg". Este filtro deja pasar
 * cualquier presentación de venta legítima y bloquea solo el formato de
 * empaque: cuando el ERP se corrija, el dato aparece solo, sin tocar código.
 *
 * ── DÓNDE ESTÁ LA CORRECCIÓN DE VERDAD
 * Acá se tapa un síntoma. El arreglo de fondo es que el exportador del ERP
 * mande la presentación de venta en este campo, o que mande el empaque en uno
 * aparte que el sitio no lea.
 */
const EMPAQUE_DE_BODEGA = /^\s*paquete\s*:/i;

export function presentacionVisible(presentacion: string | undefined): string {
  if (!presentacion) return "";
  const limpia = presentacion.trim();
  if (!limpia || EMPAQUE_DE_BODEGA.test(limpia)) return "";
  return limpia;
}

/**
 * NOMBRE RESUMIDO PARA LA TARJETA DEL CATÁLOGO (20/09/2026, a pedido de
 * Oscar)
 *
 * ── QUÉ HACE
 * Quita, solo al final del nombre, la medida ("70 cm", "55.5x36x18.5 cm") y,
 * si queda una palabra de forma justo detrás de esa medida ("Redonda",
 * "Cuadrado"...), también la quita.
 *   "Alfombrilla Refrescante Redonda 70 cm" → "Alfombrilla Refrescante"
 *
 * ── POR QUÉ SOLO AL FINAL Y SOLO ESE PATRÓN
 * "Talla L" / "Talla M" / "Talla S" NO calza con el patrón (no hay número
 * antes de la unidad), así que nunca se toca. Eso importa: cuando la talla es
 * lo único que distingue tres productos con el mismo nombre base, borrarla
 * dejaría tres tarjetas iguales en la grilla y el cliente no podría saber
 * cuál es cuál. Por la misma razón nunca se acorta a la fuerza por cantidad
 * de palabras — solo se quita lo que el patrón reconoce con certeza como
 * medida o forma redundante, así que en un nombre sin esa cola el resultado
 * es el nombre completo, sin recortes raros a mitad de frase.
 *
 * ── DÓNDE SE USA
 * Únicamente en <TarjetaProducto> (la tarjeta del catálogo). La ficha de
 * producto, el carrito, el checkout y el pedido por WhatsApp siguen usando
 * `producto.nombre` completo — ahí sí importa el detalle exacto.
 */
const MEDIDA_AL_FINAL =
  /\s+\d+(?:[.,]\d+)?(?:\s*[x×]\s*\d+(?:[.,]\d+)?){0,2}\s*(cm|mm|m|kg|g|ml|l)\.?\s*$/i;

const FORMAS_REDUNDANTES = new Set([
  "redonda",
  "redondo",
  "cuadrado",
  "cuadrada",
  "rectangular",
  "ovalado",
  "ovalada",
]);

export function nombreResumido(nombre: string): string {
  const original = nombre.trim();
  let s = original.replace(MEDIDA_AL_FINAL, "");

  const palabras = s.split(/\s+/).filter(Boolean);
  const ultima = palabras[palabras.length - 1]?.toLowerCase();
  if (palabras.length > 2 && ultima && FORMAS_REDUNDANTES.has(ultima)) {
    palabras.pop();
    s = palabras.join(" ");
  }

  return s.trim() || original;
}

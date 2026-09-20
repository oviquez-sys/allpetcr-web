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
 * NOMBRE RESUMIDO PARA LA TARJETA DEL CATÁLOGO
 * (20/09/2026, a pedido de Oscar; ajustado el mismo día a máximo 3 palabras)
 *
 * ── QUÉ HACE, EN ORDEN
 * 1. Aparta "Talla L/M/S" (o cualquier código de talla) si está al final —
 *    ver más abajo por qué esto nunca se toca.
 * 2. Del resto, quita la medida final ("70 cm", "55.5x36x18.5 cm") y, si
 *    queda pegada, una palabra de forma redundante ("Redonda", "Cuadrado"…).
 * 3. Si aún quedan más de 3 palabras, corta a las primeras 3.
 * 4. Si esa tercera palabra es una muletilla que no aporta nada sola
 *    ("tipo", "para", "de"...), también se quita, y el nombre queda en 2.
 * 5. Vuelve a pegar la talla apartada en el paso 1, sin contarla en el tope.
 *
 *   "Alfombrilla Refrescante Redonda 70 cm" → "Alfombrilla Refrescante"
 *   "Alimentador Lento tipo Tapete 20 cm"   → "Alimentador Lento"
 *   "Arnés Acolchado Reflectivo Talla L"    → "Arnés Acolchado Reflectivo Talla L"
 *
 * ── POR QUÉ LA TALLA ES LA EXCEPCIÓN AL TOPE DE 3 PALABRAS
 * Cuando la talla es lo único que distingue varios productos con el mismo
 * nombre base, contarla dentro del tope (o recortarla) dejaría varias
 * tarjetas con el nombre idéntico en la grilla y el cliente no podría saber
 * cuál es cuál. Por eso se aparta ANTES de aplicar el tope y se pega después:
 * el resto del nombre sí respeta las 3 palabras, la talla siempre se ve.
 *
 * ── DÓNDE SE USA
 * Únicamente en <TarjetaProducto> (la tarjeta del catálogo). La ficha de
 * producto, el carrito, el checkout y el pedido por WhatsApp siguen usando
 * `producto.nombre` completo — ahí sí importa el detalle exacto.
 */
const TOPE_PALABRAS = 3;

const TALLA_AL_FINAL = /\s+talla\s+\S+\s*$/i;

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

// Palabras que, si quedan solas al final tras cortar a 3, no aportan nada
// ("Alimentador Lento tipo" no dice más que "Alimentador Lento") y sobran.
const MULETILLAS_FINALES = new Set([
  "tipo",
  "estilo",
  "para",
  "de",
  "del",
  "con",
  "en",
  "sin",
  "y",
  "a",
  "al",
  "por",
]);

export function nombreResumido(nombre: string): string {
  const original = nombre.trim();

  const coincideTalla = original.match(TALLA_AL_FINAL);
  const sufijoTalla = coincideTalla ? coincideTalla[0].replace(/\s+/g, " ") : "";
  const base = coincideTalla ? original.slice(0, coincideTalla.index) : original;

  let s = base.replace(MEDIDA_AL_FINAL, "");

  let palabras = s.split(/\s+/).filter(Boolean);
  const ultimaForma = palabras[palabras.length - 1]?.toLowerCase();
  if (palabras.length > 2 && ultimaForma && FORMAS_REDUNDANTES.has(ultimaForma)) {
    palabras.pop();
  }

  if (palabras.length > TOPE_PALABRAS) {
    palabras = palabras.slice(0, TOPE_PALABRAS);
  }

  const ultimaMuletilla = palabras[palabras.length - 1]?.toLowerCase();
  if (palabras.length > 1 && ultimaMuletilla && MULETILLAS_FINALES.has(ultimaMuletilla)) {
    palabras.pop();
  }

  const resultado = `${palabras.join(" ")}${sufijoTalla}`.trim();
  return resultado || original;
}

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

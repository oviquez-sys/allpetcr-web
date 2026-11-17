import { formatoColones, presentacionVisible } from "./formato";
import type { ResultadoCheckout } from "./checkoutServidor";
import type { ResumenBeneficios } from "./campana";

export interface DatosPedidoWhatsApp {
  nombre: string;
  telefono: string;
  entrega: "retiro" | "coordinar";
  direccion?: {
    provincia: string;
    canton: string;
    distrito: string;
    senas: string;
    lat: number | null;
    lng: number | null;
  };
  nota?: string;
  /** Código de La manada (o el WhatsApp con que se registró). La tienda lo
   *  valida antes de confirmar el total: el sitio no aplica el descuento. */
  codigoManada?: string;
  /** Campaña por la que entró (lib/origenCampana.ts), si la hubo. */
  origen?: string;
  /** Número que el ERP le dio al pedido (WEB-12), para que la caja lo
   *  encuentre y le acredite los números del sorteo a esta persona. */
  numeroPedido?: string;
  /** Lo que la campaña le da a este pedido, según el ERP. */
  sorteo?: ResumenBeneficios | null;
  /** Se inscribió al sorteo al preparar este pedido. */
  inscritoAhora?: boolean;
}

/** Genera el mensaje solo con las líneas que el servidor acaba de verificar. */
export function crearTextoPedido(
  resultado: ResultadoCheckout,
  datos: DatosPedidoWhatsApp,
): string {
  const lineas = [datos.numeroPedido ? `*Pedido ${datos.numeroPedido} desde allpetcr.com*` : "*Pedido desde allpetcr.com*", ""];

  for (const item of resultado.items) {
    const presentacion = presentacionVisible(item.presentacion);
    lineas.push(
      `• ${item.cantidad} × ${item.nombre}${presentacion ? ` (${presentacion})` : ""} ` +
      `[Código: ${item.sku}] — ${formatoColones(item.subtotal)}`,
    );
  }

  const envioGratis = datos.entrega === "coordinar" && datos.sorteo?.envioGratis === true;
  lineas.push(
    "",
    `*Subtotal de productos: ${formatoColones(resultado.total)}*`,
    envioGratis
      ? "Envío: GRATIS (pedido de más de ₡20.000 dentro de la zona de Heredia). Descuentos, total final y pago: por confirmar con la tienda antes de pagar."
      : "Envío, descuentos, total final y pago: por confirmar con la tienda antes de pagar.",
    "",
    `Nombre: ${datos.nombre.trim()}`,
    `Teléfono: ${datos.telefono.trim()}`,
  );

  if (datos.entrega === "retiro") {
    lineas.push("Entrega: retiro en tienda");
  } else {
    lineas.push("Entrega: coordinar envío");
    const direccion = datos.direccion;
    const divisiones = [direccion?.provincia, direccion?.canton, direccion?.distrito]
      .filter((valor): valor is string => Boolean(valor?.trim()))
      .join(", ");
    if (divisiones) lineas.push(`Provincia/cantón/distrito: ${divisiones}`);
    if (direccion?.senas.trim()) lineas.push(`Señas: ${direccion.senas.trim()}`);
    if (direccion?.lat !== null && direccion?.lat !== undefined &&
        direccion.lng !== null && direccion.lng !== undefined) {
      lineas.push(`Ubicación: https://www.google.com/maps?q=${direccion.lat},${direccion.lng}`);
    }
  }

  if (datos.codigoManada?.trim()) {
    lineas.push(`Código La manada: ${datos.codigoManada.trim()} (validar descuento de primera compra)`);
  }
  if (datos.inscritoAhora) lineas.push("Sorteo de Navidad: me inscribí al preparar este pedido.");
  if (datos.sorteo?.numeros) lineas.push(`Sorteo de Navidad: ${datos.sorteo.numeros}`);
  if (datos.nota?.trim()) lineas.push(`Nota: ${datos.nota.trim()}`);
  if (datos.origen?.trim()) lineas.push(`Origen: ${datos.origen.trim()}`);
  return lineas.join("\n");
}

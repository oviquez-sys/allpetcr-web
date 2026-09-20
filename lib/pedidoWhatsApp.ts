import { formatoColones, presentacionVisible } from "./formato";
import type { ResultadoCheckout } from "./checkoutServidor";

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
}

/** Genera el mensaje solo con las líneas que el servidor acaba de verificar. */
export function crearTextoPedido(
  resultado: ResultadoCheckout,
  datos: DatosPedidoWhatsApp,
): string {
  const lineas = ["*Pedido desde allpetcr.com*", ""];

  for (const item of resultado.items) {
    const presentacion = presentacionVisible(item.presentacion);
    lineas.push(
      `• ${item.cantidad} × ${item.nombre}${presentacion ? ` (${presentacion})` : ""} ` +
      `[Código: ${item.sku}] — ${formatoColones(item.subtotal)}`,
    );
  }

  lineas.push(
    "",
    `*Subtotal de productos: ${formatoColones(resultado.total)}*`,
    "Envío y condiciones de pago por confirmar con la tienda.",
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

  if (datos.nota?.trim()) lineas.push(`Nota: ${datos.nota.trim()}`);
  return lineas.join("\n");
}

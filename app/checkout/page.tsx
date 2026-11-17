import { connection } from "next/server";
import CheckoutCliente from "@/components/CheckoutCliente";
import { getProductos } from "@/lib/data";
import { regaliaVigente } from "@/lib/regaliaPublica";
import { leerCampana } from "@/lib/campanaServidor";
import { estadoCampana } from "@/lib/campana";

export const metadata = {
  title: "Confirmar pedido",
  description: "Completá tus datos y enviá el pedido.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Siempre en cada visita: la compilación no tiene ERP (16/11/2026).
  await connection();
  const [productos, regalia, campana] = await Promise.all([getProductos(), regaliaVigente(), leerCampana()]);
  const campanaAbierta = estadoCampana(campana) === "abierta" && campana.conectado;
  const porcentaje = regalia?.activa && regalia.porcentaje ? regalia.porcentaje : null;
  return <CheckoutCliente productos={productos} porcentajeManada={porcentaje}
    manadaSinAlimentos={!!regalia?.excluye_alimentos}
    campana={campanaAbierta ? { zonas: campana.erp?.envio_gratis?.zonas ?? [] } : null} />;
}

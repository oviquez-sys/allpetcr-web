import CheckoutCliente from "@/components/CheckoutCliente";
import { getProductos } from "@/lib/data";
import { regaliaVigente } from "@/lib/regaliaPublica";

export const metadata = {
  title: "Confirmar pedido",
  description: "Completá tus datos y enviá el pedido.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [productos, regalia] = await Promise.all([getProductos(), regaliaVigente()]);
  const porcentaje = regalia?.activa && regalia.porcentaje ? regalia.porcentaje : null;
  return <CheckoutCliente productos={productos} porcentajeManada={porcentaje} />;
}

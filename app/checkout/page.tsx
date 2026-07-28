import CheckoutCliente from "@/components/CheckoutCliente";
import { getProductos } from "@/lib/data";

export const metadata = {
  title: "Confirmar pedido",
  description: "Completá tus datos y enviá el pedido.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const productos = await getProductos();
  return <CheckoutCliente productos={productos} />;
}

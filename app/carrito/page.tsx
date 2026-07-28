import CarritoCliente from "@/components/CarritoCliente";
import { getProductos } from "@/lib/data";

export const metadata = {
  title: "Tu carrito",
  description: "Revisá tu pedido antes de enviarlo.",
  robots: { index: false, follow: true },
};

export default async function CarritoPage() {
  // El catálogo se pasa completo para resolver el carrito contra los precios
  // vigentes: lo guardado en el navegador nunca se usa para calcular totales.
  const productos = await getProductos();
  return <CarritoCliente productos={productos} />;
}

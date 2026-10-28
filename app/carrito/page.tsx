import CarritoCliente from "@/components/CarritoCliente";
import { getProductos, getProductosPublico } from "@/lib/data";

export const metadata = {
  title: "Tu carrito",
  description: "Revisá tu pedido antes de enviarlo.",
  robots: { index: false, follow: true },
};

export default async function CarritoPage() {
  // El catálogo se pasa completo para resolver el carrito contra los precios
  // vigentes: lo guardado en el navegador nunca se usa para calcular totales.
  // 28/10/2026: si el ERP no responde, el carrito se sigue viendo con la copia
  // de hasta 60 s del catálogo (la misma de Inicio y Catálogo) en vez de una
  // pantalla de error. Mirar el carrito no compromete nada: el checkout vuelve
  // a verificar precio y existencias contra el ERP en vivo antes de armar el
  // pedido, y si el ERP sigue caído lo dice ahí.
  const productos = await getProductos().catch(() => getProductosPublico());
  return <CarritoCliente productos={productos} />;
}

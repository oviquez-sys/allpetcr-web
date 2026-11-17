import { connection } from "next/server";
import CarritoCliente from "@/components/CarritoCliente";
import { getProductos, getProductosPublico } from "@/lib/data";
import { leerCampana } from "@/lib/campanaServidor";
import { estadoCampana } from "@/lib/campana";

export const metadata = {
  title: "Tu carrito",
  description: "Revisá tu pedido antes de enviarlo.",
  robots: { index: false, follow: true },
};

export default async function CarritoPage() {
  // Siempre en cada visita: la compilación no tiene ERP (16/11/2026).
  await connection();
  // El catálogo se pasa completo para resolver el carrito contra los precios
  // vigentes: lo guardado en el navegador nunca se usa para calcular totales.
  // 28/10/2026: si el ERP no responde, el carrito se sigue viendo con la copia
  // de hasta 60 s del catálogo (la misma de Inicio y Catálogo) en vez de una
  // pantalla de error. Mirar el carrito no compromete nada: el checkout vuelve
  // a verificar precio y existencias contra el ERP en vivo antes de armar el
  // pedido, y si el ERP sigue caído lo dice ahí.
  const [productos, campana] = await Promise.all([getProductos().catch(() => getProductosPublico()), leerCampana()]);
  return <CarritoCliente productos={productos} campanaAbierta={estadoCampana(campana) === "abierta"} />;
}

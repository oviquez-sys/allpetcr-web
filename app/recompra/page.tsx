import RecompraCliente from "@/components/RecompraCliente";
import { getProductos } from "@/lib/data";

export const metadata = {
  title: "Repetir pedido",
  description: "Volvé a pedir lo mismo de la última vez.",
  // Es una página personal: lo que muestra depende del navegador de quien
  // entra. Indexarla no tendría sentido — Google vería siempre la versión
  // vacía — y además invita a que aparezca en resultados como si fuera una
  // sección del catálogo.
  robots: { index: false, follow: true },
};

export default async function RecompraPage() {
  // El catálogo completo se pasa al cliente para resolver el pedido guardado
  // contra los precios y existencias vigentes. Igual que en /carrito.
  const productos = await getProductos();
  return <RecompraCliente productos={productos} />;
}

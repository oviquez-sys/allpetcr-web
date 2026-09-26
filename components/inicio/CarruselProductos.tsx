import TarjetaProducto from "@/components/TarjetaProducto";
import type { Producto } from "@/lib/types";

/**
 * FILA DE PRODUCTOS — rediseño del inicio, 26/09/2026.
 *
 * En móvil es una fila horizontal con scroll nativo y `scroll-snap`: el
 * visitante ve dos tarjetas y media, y la media es la invitación a deslizar.
 * En escritorio pasa a grilla de cuatro columnas, porque un carrusel con el
 * mouse obliga a buscar flechas que esconden producto.
 *
 * Cero JavaScript propio: es CSS. Sigue siendo Server Component; lo único
 * que hidrata es el BotonAgregar de cada tarjeta, igual que en el catálogo.
 * Nada de autoplay (DESIGN.md: "Don't add a carousel, autoplay…") — esto es
 * una fila que se desliza con el dedo, no un carrusel que se mueve solo.
 */
export default function CarruselProductos({
  productos,
  nombrePorId,
}: {
  productos: Producto[];
  nombrePorId: Map<number, string>;
}) {
  return (
    <ul className="sin-barra -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:gap-4 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-x-5 lg:gap-y-12 lg:overflow-visible lg:px-0 lg:pb-0">
      {productos.map((p) => (
        <li key={p.sku} className="w-[42%] shrink-0 snap-start sm:w-[30%] lg:w-auto">
          <TarjetaProducto
            producto={p}
            categoria={p.categoria_id === null ? undefined : nombrePorId.get(p.categoria_id)}
          />
        </li>
      ))}
    </ul>
  );
}

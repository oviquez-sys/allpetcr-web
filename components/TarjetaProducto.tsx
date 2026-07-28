import Link from "next/link";
import type { Producto } from "@/lib/types";
import { formatoColones, tinteDeSku } from "@/lib/formato";
import BotonAgregar from "./BotonAgregar";

interface Props {
  producto: Producto;
  categoria?: string;
}

export default function TarjetaProducto({ producto, categoria }: Props) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-crema-400 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-crema-500 hover:shadow-[0_6px_24px_rgba(11,49,97,0.09)]">
      <Link
        href={`/producto/${encodeURIComponent(producto.sku)}`}
        className="flex flex-1 flex-col rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
      >
        {/* Bloque de imagen: mientras no haya fotos, un tinte cálido derivado
            del SKU. Se ve intencional en vez de roto, y cada producto
            mantiene siempre el mismo color. */}
        <div
          className={`relative grid aspect-square place-items-center overflow-hidden ${tinteDeSku(producto.sku)}`}
        >
          {producto.imagen ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={producto.imagen}
              alt={producto.nombre}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="text-[11px] uppercase tracking-[0.09em] text-navy-300">
              Foto pendiente
            </span>
          )}
          {!producto.disponible && (
            <span className="absolute left-3 top-3 rounded-full border border-crema-400 bg-white/95 px-3 py-1 text-[10.5px] tracking-wide text-navy-400 backdrop-blur">
              Sin existencias
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col px-5 pb-4 pt-4">
          {categoria && (
            <p className="mb-1.5 text-[10.5px] uppercase tracking-[0.09em] text-dorado-700">
              {categoria}
            </p>
          )}
          <h3 className="text-[14.5px] font-normal leading-snug text-navy-500 transition-colors group-hover:text-dorado-700">
            {producto.nombre}
          </h3>
          {producto.presentacion && (
            <p className="mt-1 text-xs text-navy-300">{producto.presentacion}</p>
          )}
          <p className="mt-auto pt-3 text-[17px] font-medium text-navy-500">
            {formatoColones(producto.precio_venta)}
          </p>
        </div>
      </Link>

      <div className="px-5 pb-5">
        <BotonAgregar producto={producto} tamano="chico" />
      </div>
    </article>
  );
}

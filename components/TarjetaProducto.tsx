import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Producto } from "@/lib/types";
import { formatoColones, nombreResumido, tinteDeSku } from "@/lib/formato";
import BotonAgregar from "./BotonAgregar";

interface Props {
  producto: Producto;
  /** Se sigue recibiendo por compatibilidad; la tarjeta ya no la muestra. */
  categoria?: string;
  cargaPrioritaria?: boolean;
}

/**
 * Tarjeta de producto estilo "vitrina limpia" (20/09/2026, ajustado el mismo
 * día): solo foto, nombre y precio, con el botón "Agregar al carrito" como
 * texto debajo del precio.
 *
 * (Se probó primero un botón circular con ícono flotando sobre la foto —
 * revertido porque tapaba parte del producto en fotos pequeñas o descentradas.)
 *
 * Fondo blanco con un borde muy sutil (`crema-300`) para que el cuadro se
 * distinga de la página sin usar un color de relleno. La foto en sí no se toca.
 *
 * Rendimiento: `memo` + `tarjeta-diferida` (content-visibility) se mantienen,
 * la grilla del catálogo monta ~184 tarjetas a la vez.
 *
 * El nombre visible pasa por `nombreResumido` (quita medida y forma
 * redundante cuando el nombre termina así, ver lib/formato.ts) — la foto y
 * el resto del sitio siguen usando `producto.nombre` completo.
 */
function TarjetaProducto({ producto, cargaPrioritaria = false }: Props) {
  const url = `/producto/${encodeURIComponent(producto.sku)}`;

  return (
    <article className="tarjeta-diferida group flex flex-col">
      <Link
        href={url}
        className={`relative aspect-[1/0.9] overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 ${
          producto.imagen ? "border border-crema-300 bg-white" : tinteDeSku(producto.sku)
        }`}
      >
        <div className="absolute inset-0 grid place-items-center">
          {producto.imagen ? (
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              fill
              {...(cargaPrioritaria ? { priority: true } : { loading: "lazy" as const })}
              sizes="(max-width: 640px) 48vw, (max-width: 1280px) 32vw, 380px"
              className="object-contain p-4 transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:p-6"
            />
          ) : (
            <span className="text-label uppercase text-navy-400">Foto pendiente</span>
          )}
        </div>

        {!producto.disponible && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10.5px] tracking-wide text-navy-400">
            Sin existencias
          </span>
        )}
      </Link>

      <Link
        href={url}
        className="mt-3 block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 sm:mt-4"
      >
        <h3 className="text-sm font-bold leading-snug text-navy-500 sm:text-[17px]">
          {nombreResumido(producto.nombre)}
        </h3>
        <p className="mt-1.5 text-sm text-navy-400 sm:mt-2.5 sm:text-[17px]">
          {formatoColones(producto.precio_venta)}
        </p>
      </Link>

      <div className="mt-3 sm:mt-4">
        <BotonAgregar producto={producto} tamano="chico" />
      </div>
    </article>
  );
}

export default memo(TarjetaProducto);

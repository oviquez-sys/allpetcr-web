import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Producto } from "@/lib/types";
import { formatoColones, presentacionVisible, tinteDeSku } from "@/lib/formato";
import BotonAgregar from "./BotonAgregar";

interface Props {
  producto: Producto;
  categoria?: string;
  cargaPrioritaria?: boolean;
}

/**
 * Rendimiento: la grilla del catálogo monta 184 tarjetas a la vez, y cada una
 * arrastra un componente cliente (BotonAgregar). Sin memoizar, cada tecla en
 * el buscador re-renderizaba las 184 — es la causa principal de que la página
 * se sintiera pegada. `memo` corta eso: solo se re-renderiza la tarjeta cuyos
 * datos cambiaron. Requiere que `categoria` llegue como string estable, no
 * recalculada por render (ver el mapa memoizado en CatalogoCliente).
 *
 * `content-visibility: auto` (clase `tarjeta-diferida`) hace que el navegador
 * se salte el pintado de las tarjetas fuera de pantalla. Es nativo, sin JS y
 * sin librería de virtualización, y mantiene las 184 en el DOM: Ctrl+F sigue
 * encontrándolas y no se pierde nada de SEO.
 */
function TarjetaProducto({ producto, categoria, cargaPrioritaria = false }: Props) {
  return (
    <article className="tarjeta-diferida group flex flex-col overflow-hidden rounded-card border border-crema-400 bg-white transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-crema-500 hover:shadow-[0_6px_24px_rgba(11,49,97,0.09)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link
        href={`/producto/${encodeURIComponent(producto.sku)}`}
        className="flex flex-1 flex-col rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
      >
        {/* Bloque de imagen: mientras no haya fotos, un tinte cálido derivado
            del SKU. Se ve intencional en vez de roto, y cada producto
            mantiene siempre el mismo color.

            Con foto el fondo es blanco, no el tinte: el tinte es el marcador
            de "falta la foto", y de fondo detrás de una imagen recortada se
            leía como un error de diseño.

            object-contain, no object-cover: las fotos del catálogo son
            apaisadas (300x231) y el marco es cuadrado. Con cover, el navegador
            escalaba hasta llenar y recortaba los costados — por eso se veían
            "con zoom" y perdían parte del producto. */}
        <div
          className={`relative grid aspect-square place-items-center overflow-hidden ${
            producto.imagen ? "bg-crema-100" : tinteDeSku(producto.sku)
          }`}
        >
          {producto.imagen ? (
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              fill
              {...(cargaPrioritaria ? { priority: true } : { loading: "lazy" as const })}
              sizes="(max-width: 640px) 45vw, (max-width: 1280px) 30vw, 270px"
              className="object-contain p-3 transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <span className="text-label uppercase text-navy-400">
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
            <p className="mb-1.5 text-label uppercase text-dorado-700">
              {categoria}
            </p>
          )}
          <h3 className="text-title font-normal leading-snug text-navy-500 transition-colors group-hover:text-dorado-700">
            {producto.nombre}
          </h3>
          <p className="mt-2 text-xs text-navy-400">Código {producto.sku}{producto.mascota ? ` · ${producto.mascota}` : ""}</p>
          {producto.descripcion && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-navy-400">{producto.descripcion}</p>}
          {/* Filtrado: lo que el ERP manda hoy es empaque de bodega
              ("Paquete: 12 / Caja: 216"), no presentación de venta. Ver
              presentacionVisible en lib/formato.ts. */}
          {presentacionVisible(producto.presentacion) && (
            <p className="mt-1 text-xs text-navy-400">
              {presentacionVisible(producto.presentacion)}
            </p>
          )}
          <p className="mt-auto pt-3 text-price text-navy-500">
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

// La comparación estándar también actualiza nombres y descripciones recibidos.
export default memo(TarjetaProducto);

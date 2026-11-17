import { memo } from "react";
import SinFoto from "@/components/SinFoto";
import Link from "next/link";
import Image from "next/image";
import type { Producto } from "@/lib/types";
import { formatoColones, nombreResumido, tinteDeSku } from "@/lib/formato";
import BotonAgregar from "./BotonAgregar";
import { separarTalla } from "@/lib/variantes";
import { enOferta, fechaCorta } from "@/lib/ofertas";
import { marcaVisible } from "@/lib/marcaVisible";

// Placeholder "shimmer" mientras carga la foto (20/09/2026): no reduce el
// peso real de la imagen —para eso está `minimumCacheTTL` en next.config.ts—
// esto es puramente de percepción. Sin esto, el cuadro queda en blanco hasta
// que la foto entra; con esto, se ve un degradado sutil animándose desde el
// primer instante, y el cambio a la foto real es menos brusco. Es el mismo
// SVG para las ~184 tarjetas (no depende de cada foto), así que no cuesta
// nada calcularlo por producto.
const RELLENO_SHIMMER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0Y1RjBFOCIvPgogIDxyZWN0IGlkPSJyIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0VGRThEQSIvPgogIDxhbmltYXRlIHhsaW5rOmhyZWY9IiNyIiBhdHRyaWJ1dGVOYW1lPSJ4IiBmcm9tPSItMTAwIiB0bz0iMTAwIiBkdXI9IjEuMXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+Cjwvc3ZnPg==";

interface Props {
  producto: Producto;
  /** Se sigue recibiendo por compatibilidad; la tarjeta ya no la muestra. */
  categoria?: string;
  cargaPrioritaria?: boolean;
  /** Tallas del mismo producto (lib/variantes.ts). Con 2 o más, la tarjeta
   *  muestra el nombre sin talla, «Tallas S · M · L», «Desde ₡…» y
   *  «Elegir talla» en vez de agregar al carrito (hay que elegir cuál). */
  tallas?: Producto[];
  /** content-visibility: solo en la grilla larga del catálogo. En las filas
   *  que se deslizan de lado (inicio, «También te puede servir») dejaba un
   *  hueco en blanco abajo: las tarjetas fuera de la vista reservaban 420 px
   *  de alto y estiraban toda la fila (17/11/2026). */
  diferida?: boolean;
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
 * ACTUALIZADO 28/10/2026: ahora es `object-contain` con margen (ver la nota
 * junto a la función). Oscar lo aprobó viendo una muestra sobre el catálogo
 * real: con cover los sacos de alimento salían recortados. Lo de abajo queda
 * como historia de la decisión anterior.
 *
 * `object-cover`, sin relleno (20/09/2026, a pedido de Oscar: quiere la foto
 * a tamaño completo del cuadro). Antes tenía `object-contain` + `padding`,
 * que dejaba un margen blanco alrededor —redundante con el que ya traen las
 * fotos del proveedor— y el producto se veía chico dentro de la tarjeta. Con
 * `cover` la foto llena el cuadro entero; puede recortar un poco los bordes
 * en fotos muy apaisadas, pero el catálogo es sobre todo cuadrado (1024×803)
 * y el recorte es mínimo.
 *
 * Rendimiento: `memo` + `tarjeta-diferida` (content-visibility) se mantienen,
 * la grilla del catálogo monta ~184 tarjetas a la vez.
 *
 * El nombre visible pasa por `nombreResumido` (quita medida y forma
 * redundante cuando el nombre termina así, ver lib/formato.ts) — la foto y
 * el resto del sitio siguen usando `producto.nombre` completo.
 */
// TARJETA 17/11/2026 (Oscar aprobó «todas las mejoras»):
//  - Marco de foto crema parejo, sin borde, y la foto en «multiplicar»
//    (.marco-foto en globals.css): las fotos de proveedores distintos se ven
//    como una sola vitrina. Margen interno 6 % (antes 8 %): el producto se ve
//    más grande.
//  - Marca arriba del nombre, cuando el nombre no la dice (lib/marcaVisible).
//  - Precio más grande y, a su derecha, un botón redondo «+» de 44 px. NO va
//    sobre la foto: eso se probó el 20/09 y tapaba el producto. El aviso
//    «Agregado · Ver carrito» (AvisoAgregado.tsx) confirma cada toque.
//  - Precio y botón alineados abajo en todas las tarjetas de una fila,
//    aunque los nombres ocupen distinto número de líneas.
//
// Foto (28/10/2026): `object-contain` con 8 % de margen en vez de
// `object-cover`. Con cover, cada foto se recortaba distinto según su
// proporción (sacos de alimento sin la parte de arriba y de abajo); con
// contain todas quedan completas, centradas y del mismo tamaño dentro del
// marco blanco, y la grilla se lee pareja aunque las fotos no lo sean.
function TarjetaProducto({ producto, cargaPrioritaria = false, tallas, diferida = true }: Props) {
  const url = `/producto/${encodeURIComponent(producto.sku)}`;
  const agrupado = tallas && tallas.length > 1 ? tallas : null;
  const base = agrupado ? (separarTalla(producto.nombre)?.base ?? producto.nombre) : producto.nombre;
  const disponibles = agrupado ? agrupado.filter((t) => t.disponible) : [];
  const precios = (disponibles.length ? disponibles : agrupado ?? []).map((t) => t.precio_venta);
  const precioMin = agrupado ? Math.min(...precios) : producto.precio_venta;
  const precioVaria = agrupado ? new Set(precios).size > 1 : false;
  const algunaDisponible = agrupado ? disponibles.length > 0 : producto.disponible;
  // Ofertas (04/11/2026): con tallas, la etiqueta dice el mayor % de las
  // tallas en oferta; el tachado solo se muestra en un producto suelto, donde
  // "antes" es un solo precio y no se presta a confusión.
  const enPromo = (agrupado ? (disponibles.length ? disponibles : agrupado) : [producto]).filter(enOferta);
  const pctOferta = enPromo.length ? Math.max(...enPromo.map((t) => t.oferta.pct)) : 0;
  const ofertaSuelta = !agrupado && enOferta(producto) ? producto : null;
  const marca = marcaVisible(producto);
  const nombre = nombreResumido(base);

  return (
    <article className={`${diferida ? "tarjeta-diferida " : ""}group flex h-full min-w-0 flex-col`}>
      <Link
        href={url}
        tabIndex={-1}
        aria-hidden="true"
        className={`relative aspect-square overflow-hidden rounded-xl ${producto.imagen ? "marco-foto" : tinteDeSku(producto.sku)}`}
      >
        <div className="absolute inset-0 grid place-items-center">
          {producto.imagen ? (
            <Image
              src={producto.imagen}
              alt=""
              fill
              {...(cargaPrioritaria ? { priority: true } : { loading: "lazy" as const })}
              sizes="(max-width: 640px) 48vw, (max-width: 1280px) 32vw, 380px"
              placeholder="blur"
              blurDataURL={RELLENO_SHIMMER}
              className="object-contain p-[6%] transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <SinFoto />
          )}
        </div>

        {!algunaDisponible ? (
          <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-white/95 px-3 py-1 text-[10.5px] tracking-wide text-navy-400">
            Sin existencias
          </span>
        ) : pctOferta > 0 && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-orange-700 px-2.5 py-1 text-[12.5px] font-extrabold leading-none text-white sm:text-[14px]">
            {agrupado && enPromo.length < agrupado.length ? "Hasta " : ""}-{pctOferta}%
          </span>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        {marca && (
          <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.1em] text-navy-300 sm:text-[11px]">{marca}</p>
        )}
        <Link
          href={url}
          className="mt-0.5 block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
        >
          <h3 className="line-clamp-3 text-[14px] font-medium leading-snug text-navy-500 group-hover:underline group-hover:decoration-navy-200 group-hover:underline-offset-4 sm:line-clamp-2 sm:text-[15.5px]">
            {nombre}
          </h3>
        </Link>
        {agrupado && (
          <p className="mt-1 text-xs text-navy-400 sm:text-[13px]">
            Tallas {agrupado.map((t) => separarTalla(t.nombre)?.talla).join(" · ")}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
          <div className="min-w-0">
            {ofertaSuelta ? (
              <>
                <p className="text-[17px] font-bold leading-tight text-orange-700 sm:text-[19px]">{formatoColones(ofertaSuelta.precio_venta)}</p>
                <p className="text-xs text-navy-300 line-through sm:text-[13px]">
                  <span className="sr-only">Antes </span>{formatoColones(ofertaSuelta.precio_antes)}
                </p>
                <p className="text-[11px] text-navy-400">Hasta el {fechaCorta(ofertaSuelta.oferta.hasta)}</p>
              </>
            ) : (
              <p className={`leading-tight ${pctOferta ? "text-orange-700" : "text-navy-500"}`}>
                {precioVaria && <span className="block text-[11px] font-normal text-navy-400 sm:text-xs">Desde</span>}
                <span className="text-[17px] font-semibold sm:text-[19px]">{formatoColones(precioMin)}</span>
              </p>
            )}
          </div>
          {agrupado ? (
            algunaDisponible && (
              <Link
                href={url}
                aria-label={`Elegir talla de ${nombre}`}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-navy-500 ring-1 ring-inset ring-navy-500 transition-colors duration-150 hover:bg-navy-500 hover:text-crema-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
            )
          ) : (
            <BotonAgregar producto={producto} tamano="icono" />
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(TarjetaProducto);

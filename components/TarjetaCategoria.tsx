import Link from "next/link";
import Image from "next/image";
import IconoCategoria from "./IconoCategoria";

interface Props {
  nombre: string;
  detalle: string;
  href: string;
  /** Ruta en /public. Si falta, la tarjeta usa el tinte de respaldo. */
  imagen?: string;
  /** Punto focal de la foto: evita decapitar a la mascota al recortar. */
  posicion?: string;
  /** Color de respaldo mientras no haya foto. */
  tinte?: string;
  /** Clave de IconoCategoria. Ver la nota de señalética más abajo. */
  icono?: string;
  prioridad?: boolean;
}

/**
 * Tarjeta de categoría con SCRIM.
 *
 * Por qué un scrim y no "elegir fotos con espacio vacío":
 * una regla de composición (ej. "la mascota ocupa 40%") se rompe apenas
 * cambiás la foto, y en móvil el recorte se come ese espacio. El scrim
 * garantiza el contraste del texto sobre CUALQUIER fotografía razonable,
 * que es como resuelven esto Apple y Airbnb.
 *
 * El degradado es doble a propósito:
 *   1. una base uniforme muy sutil, que evita que un punto claro de la foto
 *      justo debajo de una letra la borre;
 *   2. un degradado vertical fuerte abajo, donde vive el texto.
 * Un solo degradado plano ensucia la foto; dos capas ligeras la respetan.
 */
export default function TarjetaCategoria({
  nombre,
  detalle,
  href,
  imagen,
  posicion = "center",
  tinte = "bg-crema-300",
  icono,
  prioridad = false,
}: Props) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500"
    >
      {imagen ? (
        <>
          <Image
            src={imagen}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={prioridad}
            style={{ objectPosition: posicion }}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {/* Capa 1: base uniforme muy leve. */}
          <div className="absolute inset-0 bg-navy-900/10" aria-hidden="true" />
          {/* Capa 2: degradado donde se apoya el texto. */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/25 to-transparent"
            aria-hidden="true"
          />
        </>
      ) : (
        <div className={`absolute inset-0 ${tinte}`} aria-hidden="true" />
      )}

      {/* Zona segura del texto: padding generoso para que nunca toque el borde. */}
      <div className="relative p-7">
        {/* El icono en un círculo de trazo dorado, como el rótulo vertical de
            iconos que el local tiene junto a la puerta. Sobre foto va en
            blanco translúcido para no competir con la imagen; sobre tinte, en
            navy con el aro dorado a la vista. */}
        {icono && (
          <span
            className={`mb-5 grid h-11 w-11 place-items-center rounded-full border transition-colors ${
              imagen
                ? "border-white/45 bg-white/10 text-white backdrop-blur-sm"
                : "border-dorado-500/40 text-navy-500 group-hover:border-dorado-500/70"
            }`}
            aria-hidden="true"
          >
            <IconoCategoria nombre={icono} className="h-[22px] w-[22px]" />
          </span>
        )}
        <h3
          className={`font-display text-xl font-normal ${
            imagen ? "text-white" : "text-navy-500"
          }`}
        >
          {nombre}
        </h3>
        <p
          className={`mt-1 text-xs ${imagen ? "text-white/85" : "text-navy-400"}`}
        >
          {detalle}
        </p>
        <span
          className={`mt-4 inline-block rounded-full px-5 py-2 text-xs font-medium transition-colors ${
            imagen
              ? "bg-white/95 text-navy-500 group-hover:bg-white"
              : "bg-navy-500 text-crema-100 group-hover:bg-navy-600"
          }`}
        >
          Ver productos
        </span>
      </div>
    </Link>
  );
}

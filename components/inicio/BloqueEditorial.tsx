import Link from "next/link";
import Image from "next/image";

/** Flecha fina que acompaña a los bloques y enlaces del inicio. */
export function Flecha({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

interface Props {
  titulo: string;
  href: string;
  /** Línea chica bajo el título; en el inicio, el conteo real de productos. */
  detalle?: string;
  /** Ruta en /public. Sin foto se pinta un placeholder marcado como tal. */
  imagen?: string;
  posicion?: string;
  sizes: string;
  className?: string;
}

/**
 * BLOQUE EDITORIAL — rediseño del inicio, 26/09/2026.
 *
 * Reemplaza a PuertaEspecie en la portada. Misma función (una entrada grande
 * con foto y el conteo real) pero con otro lenguaje: la foto manda, el texto
 * es nombre + flecha, y desaparecen el filete dorado, el ícono en círculo y
 * la sensación de "tarjeta". Se lee como una pieza de campaña, no como un
 * botón grande.
 *
 * Sin foto, el bloque NO disimula: muestra "Foto pendiente" a la vista para
 * que nadie lo confunda con un diseño terminado (lo pidió el brief del
 * rediseño). Se reemplaza pasando `imagen`.
 */
export default function BloqueEditorial({
  titulo,
  href,
  detalle,
  imagen,
  posicion = "center",
  sizes,
  className = "",
}: Props) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col justify-end overflow-hidden rounded-xl bg-crema-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 ${className}`}
    >
      {imagen ? (
        <>
          <Image
            src={imagen}
            alt=""
            fill
            sizes={sizes}
            style={{ objectPosition: posicion }}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          {/* Velo solo abajo, donde vive el texto: el resto de la foto queda
              limpia. Nunca texto sobre foto sin una capa de contraste. */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-navy-900/70 via-navy-900/25 to-transparent" aria-hidden="true" />
        </>
      ) : (
        <span className="absolute left-4 top-4 rounded-full border border-dashed border-navy-300 px-3 py-1 text-label font-medium uppercase text-navy-400">
          Foto pendiente
        </span>
      )}

      <div className={`relative flex items-end justify-between gap-4 p-5 sm:p-7 ${imagen ? "text-white" : "text-navy-500"}`}>
        <div>
          <h3 className="font-display text-bloque">{titulo}</h3>
          {detalle && (
            <p className={`mt-2 text-xs font-medium tracking-wide ${imagen ? "text-white/85" : "text-navy-400"}`}>
              {detalle}
            </p>
          )}
        </div>
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors duration-200 sm:h-11 sm:w-11 ${
            imagen
              ? "border-white/60 group-hover:border-white group-hover:bg-white group-hover:text-navy-500"
              : "border-navy-300 group-hover:border-navy-500 group-hover:bg-navy-500 group-hover:text-white"
          }`}
          aria-hidden="true"
        >
          <Flecha />
        </span>
      </div>
    </Link>
  );
}

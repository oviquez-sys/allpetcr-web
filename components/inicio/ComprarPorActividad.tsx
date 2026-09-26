import Link from "next/link";
import { Flecha } from "./BloqueEditorial";

export interface ActividadResuelta {
  nombre: string;
  href: string;
  total: number;
}

/**
 * COMPRAR POR ACTIVIDAD — rediseño del inicio, 26/09/2026.
 *
 * Reemplaza a la línea de texto con las categorías del ERP. Mismo destino
 * (las categorías reales, enlazadas por id) pero ordenado por lo que la
 * persona va a HACER con su mascota, no por cómo el ERP archiva el producto.
 *
 * Tipográfico a propósito: no hay fotos de ambiente para las seis sin
 * repetir las que ya usa la portada (ver lib/contenidoInicio.ts). Después de
 * tres bloques con foto y una banda a sangre, una grilla de palabras grandes
 * además descansa la vista.
 */
export default function ComprarPorActividad({ actividades }: { actividades: ActividadResuelta[] }) {
  if (actividades.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
      {actividades.map((a) => (
        <li key={a.nombre}>
          <Link
            href={a.href}
            className="group flex h-full min-h-[128px] flex-col justify-between rounded-xl bg-crema-200 p-5 transition-colors duration-200 hover:bg-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 sm:min-h-[168px] sm:p-7"
          >
            <span className="font-display text-bloque text-navy-500 transition-colors duration-200 group-hover:text-white">
              {a.nombre}
            </span>
            <span className="mt-6 flex items-center justify-between text-xs font-medium text-navy-400 transition-colors duration-200 group-hover:text-white/85">
              {a.total} productos
              <Flecha className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

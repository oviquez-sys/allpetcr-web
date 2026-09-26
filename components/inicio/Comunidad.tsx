import Image from "next/image";
import { FOTOS_COMUNIDAD } from "@/lib/contenidoInicio";
import { negocio, faltante } from "@/lib/negocio";

/**
 * COMUNIDAD ALLPET — rediseño del inicio, 26/09/2026. Hoy NO se muestra.
 *
 * Listo pero apagado: no hay fotos de clientes ni redes sociales cargadas
 * (negocio.redes está vacío). Una sección de "comunidad" con fotos de stock
 * sería un testimonio inventado. Se enciende sola al cargar
 * FOTOS_COMUNIDAD en lib/contenidoInicio.ts; el enlace a Instagram aparece
 * cuando negocio.redes.instagram tenga la URL.
 */
export default function Comunidad() {
  if (FOTOS_COMUNIDAD.length === 0) return null;
  const instagram = negocio.redes.instagram;
  return (
    <section className="mx-auto max-w-contenido px-4 py-20 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-seccion text-navy-500">Comunidad AllPet</h2>
        {!faltante(instagram) && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded text-sm font-medium text-navy-500 underline decoration-crema-500 underline-offset-[6px] hover:decoration-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
          >
            Seguinos en Instagram
          </a>
        )}
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {FOTOS_COMUNIDAD.map((f) => (
          <li key={f.src} className="relative aspect-square overflow-hidden rounded-lg">
            <Image src={f.src} alt={f.alt} fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover" />
          </li>
        ))}
      </ul>
    </section>
  );
}

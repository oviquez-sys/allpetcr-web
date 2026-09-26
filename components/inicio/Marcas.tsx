import Image from "next/image";
import { MARCAS } from "@/lib/contenidoInicio";

/**
 * MARCAS — rediseño del inicio, 26/09/2026. Hoy NO se muestra.
 *
 * Queda listo pero apagado: el ERP no tiene campo de marca y no hay una
 * lista confirmada de las que se venden. Mostrar logos de marcas que la
 * tienda no tiene sería inventar surtido. Se enciende solo al cargar
 * MARCAS en lib/contenidoInicio.ts.
 *
 * Los logos van en gris y al 60% de opacidad, a color solo al pasar el
 * mouse: doce logos a todo color en fila son ruido que compite con la marca
 * propia.
 */
export default function Marcas() {
  if (MARCAS.length === 0) return null;
  return (
    <section className="mx-auto max-w-contenido px-4 py-20 sm:px-6">
      <h2 className="text-center font-display text-seccion text-navy-500">Marcas que encontrás en AllPet</h2>
      <ul className="mt-12 grid grid-cols-3 items-center gap-x-8 gap-y-10 sm:grid-cols-4 lg:grid-cols-6">
        {MARCAS.map((m) => (
          <li key={m.nombre} className="relative mx-auto h-10 w-full max-w-[140px]">
            <Image
              src={m.logo}
              alt={m.nombre}
              fill
              sizes="140px"
              className="object-contain opacity-60 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

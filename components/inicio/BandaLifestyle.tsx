import Link from "next/link";
import Image from "next/image";
import { Flecha } from "./BloqueEditorial";

interface Props {
  titulo: string;
  texto: string;
  cta: string;
  href: string;
  imagen: string;
  posicion?: string;
}

/**
 * BANDA LIFESTYLE — rediseño del inicio, 26/09/2026.
 *
 * La pausa emocional de la portada: una foto horizontal grande, una frase y
 * un solo enlace. Después de la fila de productos, recuerda para qué se
 * compra (salir, jugar, estar juntos) sin volver a pedir un clic en un precio.
 *
 * Es la única banda a sangre fuera del hero. Una segunda la volvería patrón
 * y dejaría de funcionar como pausa.
 */
export default function BandaLifestyle({ titulo, texto, cta, href, imagen, posicion = "center" }: Props) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="relative h-[68svh] max-h-[640px] min-h-[420px] lg:h-[72vh] lg:max-h-[720px]">
        <Image
          src={imagen}
          alt=""
          fill
          sizes="100vw"
          style={{ objectPosition: posicion }}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/75 via-navy-900/20 to-transparent lg:bg-gradient-to-r lg:from-navy-900/65 lg:via-navy-900/15" aria-hidden="true" />
        <div className="relative mx-auto flex h-full max-w-contenido items-end px-4 pb-12 sm:px-6 lg:items-center lg:pb-0">
          <div className="max-w-md text-white">
            <h2 className="font-display text-seccion">{titulo}</h2>
            <p className="mt-4 text-[15px] font-light leading-relaxed text-white/90">{texto}</p>
            <Link
              href={href}
              className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-navy-500 transition-colors hover:bg-crema-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
            >
              {cta}
              <Flecha className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

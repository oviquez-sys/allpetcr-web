import Image from "next/image";
import Link from "next/link";
import BotonCampana from "./BotonCampana";
import IconoPin from "./IconoPin";
import { CAMPANA_IMPRESA, fechaLarga, REFERENCIA_LOCAL, type EstadoCampana } from "@/lib/campana";
import { negocio } from "@/lib/negocio";

/**
 * CAMPAÑA NAVIDAD ALLPET 2026 — primer bloque de la portada (16/11/2026).
 *
 * Quien escanea la tarjeta tiene que reconocer EN EL ACTO lo que tiene en la
 * mano: el mismo perro, el mismo gato, la misma canasta, el logo y la misma
 * frase. Por eso la ilustración es la de la tarjeta (sin sus textos: acá el
 * texto es texto de verdad, que se lee en cualquier pantalla y lo encuentra
 * Google) y el fondo es el mismo crema de la tarjeta, para que la imagen se
 * funda sin marco.
 *
 * CELULAR: el botón tiene que verse sin bajar. Orden: título, ilustración
 * (con alto tope), fecha y botón. Medido en 375 × 600 (iPhone SE con las
 * barras del navegador): el botón queda dentro de la primera pantalla.
 *
 * ESCRITORIO: texto a la izquierda, ilustración a la derecha.
 *
 * Tres estados (lib/campana.ts → estadoCampana): abierta, cerrada (ya no se
 * inscribe, falta el sorteo) y finalizada («Este sorteo finalizó»).
 */
export default function HeroCampana({
  estado, sorteoEn = CAMPANA_IMPRESA.sorteo, comoTitulo = "h2", destinoRegistro = "/navidad#registro",
}: {
  estado: Exclude<EstadoCampana, "ninguna">;
  sorteoEn?: string;
  /** h1 en /navidad; h2 en la portada (la portada ya tiene su h1). */
  comoTitulo?: "h1" | "h2";
  destinoRegistro?: string;
}) {
  const Titulo = comoTitulo;
  const fecha = fechaLarga(sorteoEn);

  return (
    <section aria-labelledby="titulo-campana" className="relative overflow-hidden bg-[#FDF8F3]">
      {/* Una sola ilustración en tres zonas de grilla: arriba (título),
          ilustración y abajo (fecha y botón). En celular van una debajo de
          otra; en escritorio la ilustración ocupa la columna derecha. */}
      <div className="mx-auto grid max-w-contenido items-center gap-x-10 px-4 pb-6 pt-4 [grid-template-areas:'arriba'_'imagen'_'abajo'] sm:px-6 sm:pb-10 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:grid-rows-[auto_auto] lg:py-12 lg:[grid-template-areas:'arriba_imagen'_'abajo_imagen']">
        <div className="[grid-area:arriba] lg:self-end">
          {/* La fecha del sorteo va arriba, como etiqueta: en un celular chico
              es lo que permite que el botón entre en la primera pantalla. */}
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#B3261E] px-3 py-1 text-[13px] font-semibold text-white sm:text-[14px]">
            <IconoCalendario /> {estado === "finalizada" ? "Navidad AllPet 2026" : `Sorteo · ${fecha}`}
          </p>

          {estado === "finalizada" ? (
            <Titulo id="titulo-campana" className="mt-2.5 font-display text-[1.62rem] leading-[1.08] text-navy-500 sm:text-[2.6rem] lg:mt-4 lg:text-[3.1rem]">
              Este sorteo finalizó
            </Titulo>
          ) : (
            <Titulo id="titulo-campana" className="mt-2.5 font-display text-[1.62rem] leading-[1.08] text-navy-500 sm:text-[2.6rem] lg:mt-4 lg:text-[3.1rem]">
              ¡Ganate una canasta con{" "}
              <span className="whitespace-nowrap rounded-full bg-dorado-500 px-3 text-navy-900 [box-decoration-break:clone]">15 productos</span>{" "}
              de AllPet!
            </Titulo>
          )}

        </div>

        <Ilustracion className="mt-3 [grid-area:imagen] lg:mt-0" />

        <div className="[grid-area:abajo] lg:self-start">
          {estado === "finalizada" ? (
            <p className="mt-3 max-w-md text-[16px] leading-relaxed text-navy-400 sm:text-[17px]">
              ¡Gracias por participar en la Navidad AllPet 2026! Ya se sorteó la canasta y le avisamos a
              quien ganó. Seguimos esperándote en la tienda y en la web.
            </p>
          ) : (
            <>
              <p className="mt-2 max-w-md text-[15.5px] font-medium leading-snug text-navy-500 sm:text-[18px] lg:mt-5">
                Si ganás, elegís la canasta para perro o para gato.
              </p>
            </>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3 sm:mt-6">
            {estado === "abierta" ? (
              <BotonCampana href={destinoRegistro} />
            ) : (
              <>
                <Link href="/catalogo"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-navy-500 px-7 text-[15px] font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
                  Ver productos
                </Link>
                <a href={negocio.resenasUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded text-[15px] font-medium text-navy-500 underline decoration-navy-200 underline-offset-[6px] hover:decoration-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500">
                  <IconoPin /> Cómo llegar
                </a>
              </>
            )}
          </div>

          {estado === "cerrada" && (
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-navy-400">
              Las inscripciones ya cerraron. El sorteo es el {fecha} y le avisamos a quien gane por WhatsApp o
              correo.
            </p>
          )}
          {estado !== "abierta" && (
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-navy-400">
              Tienda en Heredia centro: {REFERENCIA_LOCAL}.
            </p>
          )}
        </div>
      </div>
      {/* Franja de los colores de la marca, como cierre del bloque. */}
      <div className="h-1.5 bg-[linear-gradient(90deg,#B3261E_0_33%,#CC9539_33%_66%,#011B44_66%)]" aria-hidden="true" />
    </section>
  );
}

function Ilustracion({ className = "" }: { className?: string }) {
  return (
    // Bordes difuminados: la ilustración viene recortada de la tarjeta y sin
    // esto se le veían los cortes rectos sobre el crema.
    <div className={`relative mx-auto aspect-[766/437] h-auto w-full max-w-[640px] max-h-[23svh] sm:max-h-[34svh] lg:max-h-none ${className}`}
      style={{
        WebkitMaskImage: "linear-gradient(to right, transparent, #000 7%, #000 96%, transparent), linear-gradient(to bottom, transparent, #000 9%, #000 94%, transparent)",
        WebkitMaskComposite: "source-in",
        maskImage: "linear-gradient(to right, transparent, #000 7%, #000 96%, transparent), linear-gradient(to bottom, transparent, #000 9%, #000 94%, transparent)",
        maskComposite: "intersect",
      }}>
      <Image
        src="/campana/navidad-2026-canasta.png"
        alt="Un perro con bufanda navideña y un gato con gorro de Santa junto a una canasta con juguetes y snacks"
        fill
        preload
        fetchPriority="high"
        sizes="(min-width: 1024px) 600px, 100vw"
        className="object-contain"
      />
    </div>
  );
}

function IconoCalendario() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  );
}

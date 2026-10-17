"use client";

import Link from "next/link";
import { useEsMiembro } from "./useEsMiembro";

/**
 * Franja de la portada que invita a la manada (14/10/2026). Navy con el dorado
 * de la marca, igual que la página /manada, para que el clic lleve a algo que
 * se ve como continuación y no como otro sitio. Desaparece para quien ya se
 * unió desde ese celular.
 */
export default function BandaManada({ porcentaje }: { porcentaje: string | null }) {
  const miembro = useEsMiembro();
  if (miembro) return null;
  return (
    <section className="superficie-navy text-crema-100">
      <div className="franja-dorada" />
      <div className="mx-auto grid max-w-contenido items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:gap-12 lg:py-16">
        {porcentaje ? (
          <div className="justify-self-center text-center lg:justify-self-start">
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-display text-[4.5rem] leading-none text-dorado-300">{porcentaje}</span>
              <span className="font-display text-3xl text-dorado-300">%</span>
            </div>
            <p className="mt-1 text-[13px] font-light text-crema-200">en tu primera compra</p>
            <p className="mt-0.5 text-[12px] font-light text-crema-200">En la tienda, por WhatsApp o en la web</p>
          </div>
        ) : (
          <span aria-hidden="true" className="justify-self-center text-6xl lg:justify-self-start">🐾</span>
        )}
        <div className="text-center lg:text-left">
          <p className="text-label uppercase text-dorado-300">La manada AllPetcr.com</p>
          <h2 className="mt-2 font-display text-seccion">
            Unite a la manada
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[16px] font-light text-crema-200 lg:mx-0">
            Dejanos tu nombre y tu WhatsApp, o entrá con Google. En 30 segundos sos parte, y te avisamos primero
            de lo nuevo para tu peludo.
          </p>
        </div>
        <Link href="/manada?o=web-portada"
          className="inline-flex items-center justify-center gap-2 justify-self-center rounded-full bg-dorado-500 px-8 py-4 text-[16px] font-medium text-navy-900 transition-colors hover:bg-dorado-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-600 lg:justify-self-end">
          <span aria-hidden="true">🐾</span> Unirme a la manada
        </Link>
      </div>
      <div className="franja-dorada" />
    </section>
  );
}

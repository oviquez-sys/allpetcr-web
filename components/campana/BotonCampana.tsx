"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { yaParticipaEnNavegador } from "@/lib/campana";

/**
 * Botón principal de la campaña. A quien ya se inscribió desde este celular
 * no se le vuelve a pedir el registro: se le confirma que participa y se le
 * lleva a los productos (cada compra le suma números).
 */
export default function BotonCampana({ href, tono = "claro" }: { href: string; tono?: "claro" | "oscuro" }) {
  const oscuro = tono === "oscuro";
  const [participa, setParticipa] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de una cookie al montar
  useEffect(() => setParticipa(yaParticipaEnNavegador()), []);

  if (participa) {
    return (
      <>
        <span className="inline-flex h-12 items-center gap-2 rounded-full bg-emerald-700 px-6 text-[15px] font-medium text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m20 6-11 11-5-5" /></svg>
          ¡Ya estás participando!
        </span>
        <Link href="/catalogo"
          className={`inline-flex min-h-11 items-center rounded text-[15px] font-medium underline underline-offset-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 ${oscuro ? "text-crema-100 decoration-crema-200" : "text-navy-500 decoration-navy-200 hover:decoration-navy-500"}`}>
          Ver productos
        </Link>
      </>
    );
  }
  return (
    <Link href={href}
      className={`inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-8 text-[17px] font-semibold shadow-md shadow-navy-900/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 sm:w-auto ${
        oscuro ? "bg-dorado-500 text-navy-900 hover:bg-dorado-400" : "bg-navy-500 text-crema-100 hover:bg-navy-600"}`}>
      Registrarme para el sorteo
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </Link>
  );
}

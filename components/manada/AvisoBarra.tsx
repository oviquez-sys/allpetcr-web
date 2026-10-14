"use client";

import Link from "next/link";
import { useEsMiembro } from "./useEsMiembro";

/**
 * La invitación de la barra de arriba (14/10/2026). Es lo primero que ve
 * quien entra por www.allpetcr.com en cualquier página, sin tapar nada: un
 * enlace de una línea, no una ventana emergente. A quien ya se unió se le
 * vuelve a mostrar la línea de siempre.
 */
export default function AvisoBarra({ frase, normal }: { frase: string | null; normal: React.ReactNode }) {
  const miembro = useEsMiembro();
  if (!frase || miembro) return <>{normal}</>;
  return (
    <Link href="/manada?o=web-barra"
      className="group inline-flex items-center gap-1.5 text-crema-100 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado-400">
      <span aria-hidden="true">🐾</span>
      <span>
        <strong className="font-medium text-dorado-300">{frase}</strong>
        <span className="hidden sm:inline"> · Unite a la manada</span>
      </span>
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

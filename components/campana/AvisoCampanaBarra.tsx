"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { yaParticipaEnNavegador, type EstadoCampana } from "@/lib/campana";

/**
 * La línea de arriba durante la Navidad AllPet 2026 (16/11/2026). Reemplaza
 * la invitación del 10 % de La manada, que el ERP deja de emitir mientras
 * corre la campaña. A quien ya participa le recuerda cómo sumar números.
 */
export default function AvisoCampanaBarra({ estado }: { estado: Exclude<EstadoCampana, "ninguna"> }) {
  const [participa, setParticipa] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de una cookie al montar
  useEffect(() => setParticipa(yaParticipaEnNavegador()), []);

  const clase = "group inline-flex items-center gap-1.5 text-white underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";
  if (estado !== "abierta") {
    return (
      <Link href="/navidad" className={clase}>
        <span aria-hidden="true">🎄</span>
        <span>{estado === "finalizada" ? "El sorteo de Navidad finalizó · Gracias por participar" : "Inscripciones cerradas · Sorteo el 24 de diciembre"}</span>
      </Link>
    );
  }
  if (participa) {
    return (
      <Link href="/catalogo" className={clase}>
        <span aria-hidden="true">🎄</span>
        <span><strong className="font-semibold">Ya estás participando</strong>
          <span className="hidden sm:inline"> · Comprá más de ₡20.000 y ganá doble puntaje</span></span>
        <span aria-hidden="true">→</span>
      </Link>
    );
  }
  return (
    <Link href="/navidad?o=web-barra#registro" className={clase}>
      <span aria-hidden="true">🎄</span>
      <span><strong className="font-semibold">Ganate una canasta con 15 productos</strong>
        <span className="hidden sm:inline"> · Registrate gratis para el sorteo</span></span>
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

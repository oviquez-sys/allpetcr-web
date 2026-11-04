"use client";

import { useEffect, useState } from "react";
import { finDeOferta } from "@/lib/ofertas";

/**
 * Cuánto falta para que termine la oferta (04/11/2026). Se calcula en el
 * navegador y se actualiza cada minuto; en el servidor no se pinta nada para
 * no mostrar una cuenta congelada en la copia de 60 s del catálogo.
 */
export default function CuentaRegresiva({ hasta }: { hasta: string }) {
  const [ahora, setAhora] = useState<number | null>(null);
  useEffect(() => {
    // El primer valor en un callback (no directo en el efecto): así el
    // servidor y la primera pintura del navegador coinciden (sin cuenta).
    const primero = setTimeout(() => setAhora(Date.now()), 0);
    const t = setInterval(() => setAhora(Date.now()), 60_000);
    return () => { clearTimeout(primero); clearInterval(t); };
  }, []);
  if (ahora === null) return null;
  const falta = finDeOferta(hasta).getTime() - ahora;
  if (falta <= 0) return null;
  const dias = Math.floor(falta / 86_400_000);
  const horas = Math.floor((falta % 86_400_000) / 3_600_000);
  const min = Math.floor((falta % 3_600_000) / 60_000);
  const bloques: [number, string][] = [[dias, dias === 1 ? "día" : "días"], [horas, "horas"], [min, "min"]];
  return (
    <div className="mt-3 flex gap-1.5" aria-label={`Termina en ${dias} días, ${horas} horas y ${min} minutos`}>
      {bloques.map(([n, txt]) => (
        <div key={txt} className="min-w-[52px] rounded-lg bg-orange-900 px-2 py-1.5 text-center text-white">
          <span className="block text-base font-extrabold leading-none tabular-nums">{String(n).padStart(2, "0")}</span>
          <span className="text-[10px] opacity-80">{txt}</span>
        </div>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import type { ResumenBeneficios } from "@/lib/campana";

/**
 * Recuadro del sorteo en el carrito y en la confirmación: lo que dice el ERP
 * de ESTE carrito, en palabras. Mientras el ERP responde se deja el último
 * resultado atenuado (no se borra y vuelve a aparecer a cada cambio).
 */
export default function CajaSorteo({
  resumen, cargando, invitarRegistro = false, mostrarEnvio = false,
}: {
  resumen: ResumenBeneficios | null;
  cargando: boolean;
  /** Mostrar «Registrate gratis» (quien no se sabe inscrito, en el carrito). */
  invitarRegistro?: boolean;
  /** En la confirmación, con envío elegido: decir qué pasa con el envío. */
  mostrarEnvio?: boolean;
}) {
  if (!resumen) return null;
  return (
    <div aria-live="polite" aria-busy={cargando}
      className={`mt-5 rounded-lg border border-[#B3261E]/25 bg-[#FDF3F2] px-4 py-3.5 text-[13.5px] leading-relaxed text-navy-500 transition-opacity ${cargando ? "opacity-60" : ""}`}>
      <p className="font-semibold"><span aria-hidden="true">🎄 </span>Sorteo de Navidad</p>
      {resumen.numeros && <p className="mt-1">{resumen.numeros}</p>}
      {resumen.faltante && <p className="mt-1 text-navy-400">{resumen.faltante}</p>}
      {mostrarEnvio && resumen.envio && (
        <p className={`mt-1 ${resumen.envioGratis ? "font-semibold text-emerald-800" : "text-navy-400"}`}>
          {resumen.envio}{!resumen.envioGratis && " El costo del envío te lo confirmamos por WhatsApp."}
        </p>
      )}
      {invitarRegistro && !resumen.participa && (
        <Link href="/navidad?o=web-carrito#registro" className="mt-1.5 inline-block font-medium underline underline-offset-2">
          Registrate gratis para participar
        </Link>
      )}
      <p className="mt-1.5 text-[12px] text-navy-400">Los números se acreditan al pagar la compra.</p>
    </div>
  );
}

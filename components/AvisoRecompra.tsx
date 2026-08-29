"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  useRecompra,
  hayQueRecordar,
  diasDesde,
  posponerRecordatorio,
  descartarRecordatorio,
  POSPONER_DIAS,
} from "@/lib/recompra";

/**
 * Aviso de reposición.
 *
 * Aparece bajo la cabecera cuando se cumplió el plazo que el propio cliente
 * eligió al confirmar su último pedido. No aparece nunca por iniciativa del
 * sitio: si no pidió recordatorio, esto no existe.
 *
 * Es deliberadamente discreto —al revés de AvisoConfiguracion, que le habla
 * a quien mantiene el sitio y por eso es feo a propósito—. Este le habla al
 * cliente, y una banda estridente que reaparece sola se lee como publicidad.
 *
 * Las dos salidas ("En una semana" y cerrar) son la parte que hace honesto al
 * aviso: un recordatorio del que no se puede salir es una molestia.
 */
export default function AvisoRecompra() {
  const { estado, listo, ahora } = useRecompra();

  // Solo después de hidratar: en el servidor no hay localStorage, así que el
  // primer render tiene que coincidir en vacío o React reporta desajuste.
  const mostrar = useMemo(
    () => listo && hayQueRecordar(estado, ahora),
    [estado, listo, ahora],
  );

  if (!mostrar || !estado) return null;

  const dias = diasDesde(estado.hecho, ahora);

  return (
    <div
      role="status"
      className="border-b border-crema-400 bg-crema-200 print:hidden"
    >
      <div className="mx-auto flex max-w-contenido flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3">
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0 text-dorado-600" aria-hidden="true"
        >
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>

        <p className="text-[13px] font-light leading-relaxed text-navy-400">
          Tu último pedido fue hace {dias} {dias === 1 ? "día" : "días"}.{" "}
          <span className="font-medium text-navy-500">¿Te toca reponer?</span>
        </p>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/recompra"
            className="rounded-full bg-navy-500 px-4 py-2 text-xs font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
          >
            Ver mi pedido
          </Link>
          <button
            type="button"
            onClick={posponerRecordatorio}
            className="rounded-full px-3 py-2 text-xs font-light text-navy-400 transition-colors hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
          >
            En {POSPONER_DIAS} días
          </button>
          <button
            type="button"
            onClick={descartarRecordatorio}
            aria-label="No recordarme este pedido"
            title="No recordarme este pedido"
            className="grid h-8 w-8 place-items-center rounded-full text-navy-300 transition-colors hover:bg-crema-300 hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Producto } from "@/lib/types";

interface Props {
  producto: Producto;
}

type Estado = "inicial" | "enviando" | "ok" | "error";

/**
 * "Avisame cuando llegue" — reemplaza al botón de comprar en la ficha de un
 * producto agotado (nunca convive con él: un agotado no se compra).
 *
 * Guarda el correo en el ERP (pedidos.AvisoDisponibilidad, vía
 * app/api/avisos-disponibilidad). No promete un plazo ni un canal de aviso
 * automático —ese envío todavía no existe— para no prometer algo que hoy
 * no se cumple; el dato queda listo para cuando exista.
 */
export default function BotonAvisoDisponibilidad({ producto }: Props) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<Estado>("inicial");

  if (estado === "ok") {
    return (
      <p role="status" className="mt-1 flex items-center gap-2 text-sm text-navy-500">
        <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
        Registramos tu interés y el correo {email}. Consultá con la tienda para conocer la disponibilidad; todavía no hay una fecha de reposición confirmada.
      </p>
    );
  }

  return (
    <form
      className="flex flex-wrap items-start gap-2"
      onSubmit={async (evento) => {
        evento.preventDefault();
        setEstado("enviando");
        try {
          const respuesta = await fetch("/api/avisos-disponibilidad", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sku: producto.sku, email }),
          });
          setEstado(respuesta.ok ? "ok" : "error");
        } catch {
          setEstado("error");
        }
      }}
    >
      <label htmlFor={`aviso-email-${producto.sku}`} className="sr-only">
        Tu correo, para avisarte cuando vuelva a haber
      </label>
      <input
        id={`aviso-email-${producto.sku}`}
        type="email"
        autoComplete="email"
        required
        placeholder="tu@correo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-56 rounded-full border border-crema-500 px-4 py-2.5 text-sm outline-none transition-colors focus-visible:border-navy-500 focus-visible:ring-2 focus-visible:ring-navy-500"
      />
      <button
        type="submit"
        disabled={estado === "enviando"}
        className="rounded-full bg-navy-500 px-6 py-2.5 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
      >
        {estado === "enviando" ? "Enviando…" : "Avisame cuando llegue"}
      </button>
      {estado === "error" && (
        <p role="alert" className="w-full text-xs text-red-700">
          No se pudo registrar el aviso. Probá de nuevo en un rato.
        </p>
      )}
    </form>
  );
}

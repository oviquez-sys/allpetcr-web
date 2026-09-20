"use client";

import { useState } from "react";
import { formatoColones } from "@/lib/formato";

interface LineaEstado {
  producto_nombre: string;
  cantidad: number;
}

interface EstadoPedido {
  numero: string;
  estado: string;
  estado_display: string;
  creado_en: string;
  total: number;
  lineas: LineaEstado[];
}

// Mismos 5 estados que pedidos.Pedido.Estado en el ERP (Bloque 2). Un
// punto de color no reemplaza el texto (WCAG 1.4.1) — el texto real lo
// manda el ERP (estado_display) y siempre se muestra al lado.
const COLOR_ESTADO: Record<string, string> = {
  PAG: "bg-navy-200",
  PRE: "bg-dorado-500",
  DES: "bg-dorado-700",
  ENT: "bg-emerald-600",
  CAN: "bg-red-600",
};

export default function PedidoSeguimientoCliente({ numero }: { numero: string }) {
  const [telefono, setTelefono] = useState("");
  const [estado, setEstado] = useState<EstadoPedido | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function consultar(ev: React.FormEvent) {
    ev.preventDefault();
    setCargando(true);
    setError("");
    setEstado(null);
    try {
      const r = await fetch(
        `/api/pedidos/${encodeURIComponent(numero)}/estado?telefono=${encodeURIComponent(telefono)}`,
      );
      const datos = await r.json();
      if (!r.ok) {
        setError(datos.error || "No se pudo consultar el pedido.");
        return;
      }
      setEstado(datos);
    } catch {
      setError("No se pudo consultar el pedido. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-headline text-navy-500">Seguimiento de pedido</h1>
      <p className="mt-2 text-[15px] font-light text-navy-400">
        Pedido <span className="font-medium text-navy-500">{numero}</span>
      </p>

      <form onSubmit={consultar} className="mt-8 flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label htmlFor="telefono" className="block text-sm text-navy-500">
            Teléfono con el que hiciste el pedido
          </label>
          <input
            id="telefono"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            placeholder="8888-7777"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="mt-2 w-full rounded-lg border border-crema-400 bg-white px-4 py-3 text-[15px] text-navy-500 outline-none transition-colors focus:border-navy-400 focus-visible:ring-2 focus-visible:ring-navy-500"
          />
        </div>
        <button
          type="submit"
          disabled={cargando}
          className="rounded-full bg-navy-500 px-8 py-3 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
        >
          {cargando ? "Consultando…" : "Consultar"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-5 rounded-card border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {estado && (
        <div className="mt-8 rounded-card border border-crema-400 bg-white p-6">
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${COLOR_ESTADO[estado.estado] ?? "bg-navy-200"}`}
              aria-hidden="true"
            />
            <span role="status" className="text-[15px] font-medium text-navy-500">{estado.estado_display}</span>
          </div>
          <p className="mt-1.5 text-xs text-navy-400">
            {new Intl.DateTimeFormat("es-CR", { dateStyle: "long", timeStyle: "short" }).format(
              new Date(estado.creado_en),
            )}
          </p>

          <ul className="mt-5 space-y-2 border-t border-crema-400 pt-5">
            {estado.lineas.map((l, i) => (
              <li key={i} className="flex justify-between text-sm text-navy-400">
                <span>{l.cantidad} × {l.producto_nombre}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-baseline justify-between border-t border-crema-400 pt-5">
            <span className="text-sm font-medium text-navy-500">Total</span>
            <span className="text-[22px] font-medium text-navy-500">{formatoColones(estado.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

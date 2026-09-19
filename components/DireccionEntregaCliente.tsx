"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

// Leaflet toca `window` al cargar — sin ssr:false, `next build` rompe
// intentando renderizar el mapa en el servidor.
const MapaDireccion = dynamic(() => import("./MapaDireccion"), {
  ssr: false,
  loading: () => <div className="h-[320px] w-full animate-pulse rounded-card bg-crema-300" />,
});

export interface DireccionEntrega {
  lat: number | null;
  lng: number | null;
  provincia: string;
  canton: string;
  distrito: string;
  /** "Más señas exactas": lo que el courier de verdad necesita, ningún
   * mapa lo reemplaza (ítem 33). */
  senas: string;
}

interface Props {
  valor: DireccionEntrega;
  onCambiar: Dispatch<SetStateAction<DireccionEntrega>>;
  error?: string;
}

const claseCampo =
  "mt-1.5 w-full rounded-lg border border-crema-400 bg-crema-100 px-3.5 py-2.5 text-sm text-navy-500 outline-none transition-colors focus:border-navy-400 focus-visible:ring-2 focus-visible:ring-navy-500";

/**
 * Dirección de entrega: mapa + provincia/cantón/distrito + señas (ítem 33).
 *
 * Provincia/cantón/distrito llegan SUGERIDOS desde el pin del mapa (vía
 * /api/geocodificar, que consulta OpenStreetMap) pero son campos de texto
 * EDITABLES, no un resultado fijo: OpenStreetMap no calca el sistema
 * oficial de divisiones de Costa Rica, así que puede acertar, acercarse o
 * fallar — el cliente confirma o corrige antes de enviar. Las señas
 * exactas y el teléfono (ya obligatorio en CheckoutCliente) los escribe
 * el cliente siempre; ningún mapa los reemplaza.
 */
export default function DireccionEntregaCliente({ valor, onCambiar, error }: Props) {
  const [buscando, setBuscando] = useState(false);
  const [mapaAbierto, setMapaAbierto] = useState(false);
  const solicitud = useRef<AbortController | null>(null);
  useEffect(() => () => solicitud.current?.abort(), []);
  async function alMoverPin(lat: number, lng: number) {
    solicitud.current?.abort();
    const controlador = new AbortController();
    solicitud.current = controlador;
    onCambiar((actual) => ({ ...actual, lat, lng }));
    setBuscando(true);
    try {
      const respuesta = await fetch(`/api/geocodificar?lat=${lat}&lng=${lng}`, { signal: controlador.signal });
      if (!respuesta.ok || controlador.signal.aborted) return;
      const sugerido = await respuesta.json();
      if (controlador.signal.aborted) return;
      // Solo completa campos vacíos: nunca pisa texto escrito mientras responde la red.
      onCambiar((actual) => ({ ...actual,
        provincia: actual.provincia || (typeof sugerido.provincia === "string" ? sugerido.provincia : ""),
        canton: actual.canton || (typeof sugerido.canton === "string" ? sugerido.canton : ""),
        distrito: actual.distrito || (typeof sugerido.distrito === "string" ? sugerido.distrito : ""),
      }));
    } catch { /* La dirección manual sigue disponible si el geocodificador falla. */ }
    finally { if (!controlador.signal.aborted) setBuscando(false); }
  }
  return (
    <div className="space-y-4">

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block text-sm text-navy-500">
          Provincia
          <input
            id="direccion-provincia"
            autoComplete="address-level1"
            aria-required="true"
            aria-invalid={!!error}
            aria-describedby={error ? "err-direccion" : undefined}
            type="text"
            value={valor.provincia}
            onChange={(e) => onCambiar({ ...valor, provincia: e.target.value })}
            className={claseCampo}
          />
        </label>
        <label className="block text-sm text-navy-500">
          Cantón
          <input
            autoComplete="address-level2"
            aria-required="true"
            type="text"
            value={valor.canton}
            onChange={(e) => onCambiar({ ...valor, canton: e.target.value })}
            className={claseCampo}
          />
        </label>
        <label className="block text-sm text-navy-500">
          Distrito
          <input
            autoComplete="address-level3"
            aria-required="true"
            type="text"
            value={valor.distrito}
            onChange={(e) => onCambiar({ ...valor, distrito: e.target.value })}
            className={claseCampo}
          />
        </label>
      </div>

      <label className="block text-sm text-navy-500">
        Más señas exactas
        <textarea
          autoComplete="street-address"
          aria-required="true"
          rows={2}
          value={valor.senas}
          onChange={(e) => onCambiar({ ...valor, senas: e.target.value })}
          placeholder="Casa color…, portón negro, 200m sur del…"
          className={`${claseCampo} resize-none`}
        />
      </label>
      <details onToggle={(e) => setMapaAbierto(e.currentTarget.open)} className="rounded-lg border border-crema-400 p-4">
        <summary className="cursor-pointer py-2 text-sm text-navy-500">Agregar ubicación en el mapa (opcional)</summary>
        <p className="mb-3 text-sm text-navy-400">Podés completar el pedido usando únicamente la dirección escrita.</p>
        {mapaAbierto && <MapaDireccion lat={valor.lat} lng={valor.lng} onCambiar={alMoverPin} />}
        <p role="status" className="mt-2 text-sm text-navy-400">{buscando ? "Buscando provincia, cantón y distrito…" : "Revisá la dirección sugerida y corregila si hace falta."}</p>
      </details>
    </div>
  );
}

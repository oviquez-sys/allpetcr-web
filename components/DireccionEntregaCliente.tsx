"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

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
  onCambiar: (valor: DireccionEntrega) => void;
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
export default function DireccionEntregaCliente({ valor, onCambiar }: Props) {
  const [buscando, setBuscando] = useState(false);

  async function alMoverPin(lat: number, lng: number) {
    onCambiar({ ...valor, lat, lng });
    setBuscando(true);
    try {
      const r = await fetch(`/api/geocodificar?lat=${lat}&lng=${lng}`);
      if (r.ok) {
        const sugerido = await r.json();
        onCambiar({
          ...valor,
          lat,
          lng,
          provincia: sugerido.provincia || valor.provincia,
          canton: sugerido.canton || valor.canton,
          distrito: sugerido.distrito || valor.distrito,
        });
      }
    } catch {
      // Sin conexión al geocodificador: el pin y las coordenadas ya
      // quedaron guardados igual. El cliente completa a mano.
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="space-y-4">
      <MapaDireccion lat={valor.lat} lng={valor.lng} onCambiar={alMoverPin} />
      {buscando && <p className="text-xs text-navy-400">Buscando provincia, cantón y distrito…</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block text-sm text-navy-500">
          Provincia
          <input
            type="text"
            value={valor.provincia}
            onChange={(e) => onCambiar({ ...valor, provincia: e.target.value })}
            className={claseCampo}
          />
        </label>
        <label className="block text-sm text-navy-500">
          Cantón
          <input
            type="text"
            value={valor.canton}
            onChange={(e) => onCambiar({ ...valor, canton: e.target.value })}
            className={claseCampo}
          />
        </label>
        <label className="block text-sm text-navy-500">
          Distrito
          <input
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
          rows={2}
          value={valor.senas}
          onChange={(e) => onCambiar({ ...valor, senas: e.target.value })}
          placeholder="Casa color…, portón negro, 200m sur del…"
          className={`${claseCampo} resize-none`}
        />
      </label>
    </div>
  );
}

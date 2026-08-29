"use client";

import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet arma la URL del ícono por defecto asumiendo una estructura de
// carpetas que el empaquetado de Next.js no reproduce (busca /marker-icon.png
// suelto en la raíz del sitio, que no existe). Sin este arreglo, el pin no
// se ve —o revienta con "iconUrl not set in Icon options"— aunque el mapa
// funcione bien.
//
// Se referencian los PNG desde public/leaflet/ por ruta directa, no con un
// import estático de Next (`import x from "leaflet/dist/images/..."`):
// probado en el navegador, el import estático de un asset dentro de
// node_modules no siempre expone `.src` con Turbopack, y sin esa cadena
// Leaflet recibe `undefined` como URL. Copiar los tres PNG a public/ evita
// depender de esa resolución.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

// Heredia Central: el local de AllPet, centro por defecto si el cliente
// todavía no marcó nada. No es una suposición sobre dónde vive el
// cliente, es solo dónde arranca centrado el mapa.
const CENTRO_POR_DEFECTO: [number, number] = [10.0027, -84.1165];

interface Props {
  lat: number | null;
  lng: number | null;
  onCambiar: (lat: number, lng: number) => void;
}

function ManejadorClicks({ onCambiar }: { onCambiar: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onCambiar(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Mapa interactivo para marcar el punto de entrega (ítem 33).
 *
 * Leaflet + OpenStreetMap, no Google Maps: sin llave de API ni cuenta de
 * facturación, gratuito de verdad (el encargo prohíbe gastar en
 * servicios pagos). El mapa YA se usaba en el sitio -contacto.tsx- pero
 * ahí es un iframe estático de Google solo para mostrar la ubicación de
 * la tienda; esto es distinto: interactivo, para que el CLIENTE marque
 * SU punto de entrega.
 */
export default function MapaDireccion({ lat, lng, onCambiar }: Props) {
  // Sin guardia de "montado" propia: este componente se carga con
  // next/dynamic({ssr:false}) desde DireccionEntregaCliente.tsx, así que
  // para cuando llega a renderizar ya está garantizado del lado del
  // cliente — Leaflet nunca se ejecuta en el servidor.
  const posicion: [number, number] = lat !== null && lng !== null ? [lat, lng] : CENTRO_POR_DEFECTO;

  return (
    <div className="overflow-hidden rounded-card border border-crema-400">
      <MapContainer
        center={posicion}
        zoom={lat !== null ? 16 : 13}
        style={{ height: 320, width: "100%" }}
        aria-label="Mapa para marcar el punto de entrega"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {lat !== null && lng !== null && (
          <Marker
            position={[lat, lng]}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const marcador = e.target as L.Marker;
                const { lat: nuevaLat, lng: nuevaLng } = marcador.getLatLng();
                onCambiar(nuevaLat, nuevaLng);
              },
            }}
          />
        )}
        <ManejadorClicks onCambiar={onCambiar} />
      </MapContainer>
      <p className="border-t border-crema-400 bg-crema-100 px-4 py-2.5 text-xs text-navy-400">
        Tocá el mapa para marcar dónde entregar. Podés arrastrar el pin para ajustarlo.
      </p>
    </div>
  );
}

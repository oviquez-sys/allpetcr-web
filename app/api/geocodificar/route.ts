import { NextResponse } from "next/server";
import { extraerDivisionesCR, type DireccionNominatim } from "@/lib/direccionCR";

/**
 * Geocodificación inversa (lat/lng -> provincia/cantón/distrito
 * sugeridos), ítem 33. Usa Nominatim (OpenStreetMap): gratuito, sin llave
 * ni cuenta — el encargo prohíbe gastar en servicios pagos.
 *
 * Se llama DESDE EL SERVIDOR (no directo desde el navegador) por dos
 * razones: la política de uso de Nominatim exige un User-Agent
 * identificable (no "cualquier origen anónimo"), y así la CSP del sitio
 * (connect-src 'self') no necesita abrirse a un dominio externo — el único
 * que sale a internet es este servidor, no el navegador del cliente.
 */
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!lat || !lng || !Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
    return NextResponse.json({ error: "Faltan coordenadas válidas (lat, lng)." }, { status: 400 });
  }

  const url = `${NOMINATIM_URL}?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&accept-language=es&zoom=18&addressdetails=1`;

  let datos: DireccionNominatim;
  try {
    const respuesta = await fetch(url, {
      headers: {
        // Requisito de la política de uso de Nominatim: identificar la
        // aplicación, no un User-Agent genérico de librería HTTP.
        "User-Agent": "AllPetCR-sitio-web (contacto: ver allpetcr.com/contacto)",
      },
    });
    if (!respuesta.ok) {
      return NextResponse.json({ error: "No se pudo consultar la ubicación." }, { status: 502 });
    }
    datos = await respuesta.json();
  } catch {
    return NextResponse.json({ error: "No se pudo consultar la ubicación." }, { status: 502 });
  }

  return NextResponse.json(extraerDivisionesCR(datos));
}

/**
 * Extrae provincia/cantón/distrito de la respuesta de reverse geocoding de
 * Nominatim (OpenStreetMap) — Bloque 5, ítem 33.
 *
 * POR QUÉ ESTO ES "SUGERIDO", NO AUTORITATIVO
 * ---------------------------------------------
 * OpenStreetMap no etiqueta sus datos de Costa Rica calcados al sistema
 * oficial de 7 provincias / 84 cantones / 492 distritos del INEC — usa
 * campos genéricos (`state`, `county`, `city`, `suburb`...) que se
 * ACERCAN pero no siempre calzan exacto. Inventar una tabla propia de
 * cantones/distritos para "corregirlo" sería peor: quedaría desactualizada
 * y nadie la mantendría. Por eso estos campos llegan como sugerencia
 * editable en el formulario, nunca como el dato final sin que el cliente
 * lo confirme — el courier necesita la dirección correcta, no la que
 * "probablemente" es correcta.
 */

export interface DireccionNominatim {
  address?: {
    state?: string;
    county?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    city_district?: string;
    neighbourhood?: string;
    road?: string;
    house_number?: string;
  };
  display_name?: string;
}

export interface DivisionesSugeridas {
  provincia: string;
  canton: string;
  distrito: string;
  /** Calle y número, cuando OSM los tiene — punto de partida para "más
   * señas", nunca lo reemplaza. */
  viaSugerida: string;
}

export function extraerDivisionesCR(datos: DireccionNominatim): DivisionesSugeridas {
  const a = datos.address ?? {};
  return {
    provincia: a.state ?? "",
    canton: a.county ?? a.city ?? a.town ?? "",
    distrito: a.suburb ?? a.city_district ?? a.neighbourhood ?? a.village ?? "",
    viaSugerida: [a.road, a.house_number].filter(Boolean).join(" "),
  };
}

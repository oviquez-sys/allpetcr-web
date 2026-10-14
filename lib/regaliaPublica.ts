import "server-only";

/**
 * La regalía de bienvenida vigente, para anunciarla en todo el sitio (barra
 * de arriba, portada, /manada). Sale del ERP: si Oscar la cambia en el admin,
 * el sitio la refleja solo en unos minutos.
 *
 * Con caché de 5 minutos: la barra de arriba sale en TODAS las páginas y no
 * vale la pena preguntarle al ERP en cada visita por algo que cambia una vez
 * al mes. Si el ERP no responde, devuelve null y los avisos no prometen un
 * porcentaje que no se puede confirmar.
 */
export interface Regalia {
  activa: boolean;
  porcentaje?: string;
  texto?: string;
  dias_vigencia?: number;
}

export async function regaliaVigente(): Promise<Regalia | null> {
  const url = process.env.ERP_API_URL;
  const token = process.env.ERP_API_TOKEN;
  if (!url || !token) return null;
  try {
    const r = await fetch(new URL("/api/manada/regalia/", url).toString(), {
      headers: { Authorization: `Token ${token}`, Accept: "application/json" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return null;
    return (await r.json()) as Regalia;
  } catch {
    return null;
  }
}

/** "10" → "10 % en tu primera compra"; sin regalía activa, null. */
export function frasePorcentaje(r: Regalia | null): string | null {
  return r?.activa && r.porcentaje ? `${r.porcentaje} % en tu primera compra` : null;
}

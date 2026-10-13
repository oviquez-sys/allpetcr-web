import { NextResponse } from "next/server";
import { erpPost, ErpRespuestaError } from "@/lib/erpServidor";
import { ipDe, permitido } from "@/lib/manada";

// Hasta 5 mascotas con foto. El formulario achica cada foto a ~150 KB antes
// de mandarla; 4 MB deja margen sin abrir la puerta a archivos enormes.
const MAX_CUERPO_BYTES = 4 * 1024 * 1024;

/** "Tu peludo también es parte de la manada": una sola vez por cliente (lo controla el ERP
 * con la llave de un solo uso que va en `token`). */
export async function POST(request: Request) {
  let datos: { token?: unknown; mascotas?: unknown };
  try {
    const texto = await request.text();
    if (new TextEncoder().encode(texto).byteLength > MAX_CUERPO_BYTES) {
      return NextResponse.json({ error: "La solicitud es demasiado grande." }, { status: 413 });
    }
    datos = JSON.parse(texto);
  } catch {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  if (typeof datos?.token !== "string" || !Array.isArray(datos.mascotas)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  if (!permitido(`mascotas:${ipDe(request)}`, 10, 10 * 60_000)) {
    return NextResponse.json({ error: "Demasiados intentos. Esperá unos minutos." }, { status: 429 });
  }
  try {
    await erpPost("/api/manada/mascotas/", { token: datos.token, mascotas: datos.mascotas });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    if (e instanceof ErpRespuestaError && e.status === 400) {
      // El ERP explica qué falta ("Falta el nombre de la mascota 2"): se
      // muestra tal cual, porque está escrito para el cliente.
      const cuerpo = e.cuerpo;
      const mensaje = Array.isArray(cuerpo) && typeof cuerpo[0] === "string" ? cuerpo[0] : "Revisá los datos.";
      return NextResponse.json({ error: mensaje }, { status: 400 });
    }
    return NextResponse.json({ error: "No pudimos guardarlo en este momento. Probá de nuevo en un rato." }, { status: 502 });
  }
}

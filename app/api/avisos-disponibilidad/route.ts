import { NextResponse } from "next/server";
import { erpPost, ErpNoConfiguradoError, ErpRespuestaError } from "@/lib/erpServidor";

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_CUERPO_BYTES = 8_192;

function leerCampoTexto(datos: unknown, campo: string): string {
  if (typeof datos !== "object" || datos === null) return "";
  const valor = (datos as Record<string, unknown>)[campo];
  return typeof valor === "string" ? valor.trim() : "";
}

export async function POST(request: Request) {
  let datos: unknown;
  try {
    const texto = await request.text();
    if (new TextEncoder().encode(texto).byteLength > MAX_CUERPO_BYTES) {
      return NextResponse.json({ error: "La solicitud es demasiado grande." }, { status: 413 });
    }
    datos = JSON.parse(texto);
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const sku = leerCampoTexto(datos, "sku");
  const email = leerCampoTexto(datos, "email");
  if (!sku || sku.length > 100 || email.length > 254 || !CORREO_VALIDO.test(email)) {
    return NextResponse.json({ error: "Faltan datos o el correo no es válido." }, { status: 400 });
  }

  try {
    await erpPost("/api/catalogo/avisos-disponibilidad/", { sku, email });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    if (e instanceof ErpNoConfiguradoError) {
      return NextResponse.json({ error: "El sitio todavía no está conectado al ERP." }, { status: 503 });
    }
    if (e instanceof ErpRespuestaError) {
      return NextResponse.json({ error: "No se pudo registrar el aviso." }, { status: 502 });
    }
    return NextResponse.json({ error: "Error inesperado." }, { status: 500 });
  }
}

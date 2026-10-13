import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const SECRETO = "s".repeat(40);

function idToken(claims: Record<string, unknown>) {
  const b = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b({ alg: "RS256" })}.${b(claims)}.firma`;
}

describe("GET /api/manada/google/callback", () => {
  beforeEach(() => {
    vi.stubEnv("MANADA_SECRETO", SECRETO);
    vi.stubEnv("GOOGLE_CLIENT_ID", "cli");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "sec");
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "t");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  async function vuelta(params: string, cookie?: string) {
    const { GET } = await import("./route");
    return GET(new NextRequest(`https://www.allpetcr.com/api/manada/google/callback?${params}`, {
      headers: cookie ? { cookie: `manada_oauth=${cookie}` } : {},
    }));
  }

  it("sin la cookie de ida no registra a nadie", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const r = await vuelta("code=c&state=s");
    expect(r.headers.get("location")).toContain("/manada?error=sesion-vencida");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("con un state distinto tampoco", async () => {
    const { firmar } = await import("@/lib/manada");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const r = await vuelta("code=c&state=OTRO", firmar({ state: "s", nonce: "n" }, 600));
    expect(r.headers.get("location")).toContain("error=sesion-vencida");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("si canceló en Google, vuelve con un mensaje", async () => {
    const r = await vuelta("error=access_denied");
    expect(r.headers.get("location")).toContain("error=cancelado");
  });

  it("el camino completo: canjea, registra verificado y deja el cupón en la cookie de bienvenida", async () => {
    const { firmar, verificar } = await import("@/lib/manada");
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.startsWith("https://oauth2.googleapis.com")) {
        return new Response(JSON.stringify({ id_token: idToken({
          iss: "https://accounts.google.com", aud: "cli", exp: Math.floor(Date.now() / 1000) + 300,
          nonce: "n", sub: "g-77", email: "ana@gmail.com", email_verified: true, name: "Ana Pérez",
        }) }));
      }
      const cuerpo = JSON.parse(init!.body as string);
      expect(cuerpo).toMatchObject({ email: "ana@gmail.com", google_sub: "g-77", verificado: true,
        telefono: "88881234", acepta_promociones: true, fuente: "qr-tienda" });
      return new Response(JSON.stringify({
        nombre: "Ana Pérez", cliente_nuevo: true, correo_enviado: true, mascotas_pendientes: true,
        cupon: { codigo: "AP-7K3P9Q", porcentaje: "10", descripcion: "10 %", vence_en: null, estado: "DISPONIBLE", nuevo: true },
        token_mascotas: "llave-mascotas-larga-123456",
      }), { status: 201 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const ida = firmar({ state: "s", nonce: "n", telefono: "88881234", promos: true, fuente: "qr-tienda" }, 600);
    const r = await vuelta("code=c&state=s", ida);
    expect(r.headers.get("location")).toBe("https://www.allpetcr.com/manada/bienvenida");
    const galleta = r.cookies.get("manada_bienvenida");
    expect(galleta?.httpOnly).toBe(true);
    expect(verificar<{ codigo: string }>(galleta?.value)?.codigo).toBe("AP-7K3P9Q");
  });
});

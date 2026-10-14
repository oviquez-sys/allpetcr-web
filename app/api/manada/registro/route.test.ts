import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function pedido(cuerpo: unknown, ip = "1.1.1.1") {
  return new Request("http://localhost/api/manada/registro", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
    body: JSON.stringify(cuerpo),
  });
}

const valido = { nombre: "Doña Rosa", telefono: "8888-1234", acepto: true, promos: true, fuente: "qr-tienda" };

function erpResponde(cuerpo: unknown, status = 201) {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(cuerpo), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("POST /api/manada/registro", () => {
  beforeEach(() => {
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "token-secreto");
    vi.stubEnv("MANADA_SECRETO", "s".repeat(40));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("pide nombre y WhatsApp; el correo es opcional", async () => {
    const { POST } = await import("./route");
    expect((await POST(pedido({ ...valido, nombre: "" }))).status).toBe(400);
    expect((await POST(pedido({ ...valido, telefono: "123" }))).status).toBe(400);
    expect((await POST(pedido({ ...valido, email: "no-es-correo" }))).status).toBe(400);
  });

  it("registro nuevo: deja el código en la cookie y manda a la bienvenida", async () => {
    const fetchMock = erpResponde({
      nombre: "Doña Rosa", cliente_nuevo: true, ya_era_miembro: false, correo_enviado: false, mascotas_pendientes: true,
      cupon: { codigo: "AP-ROSA22", porcentaje: "10", descripcion: "10 %", vence_en: null, estado: "DISPONIBLE", nuevo: true },
      token_mascotas: "llave-larga-de-mascotas-1234567890",
    });
    const { POST } = await import("./route");
    const r = await POST(pedido({ ...valido, verificado: true }));
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true, ir: "/manada/bienvenida" });
    const { verificar } = await import("@/lib/manada");
    const galleta = r.headers.get("set-cookie") ?? "";
    const valor = galleta.match(/manada_bienvenida=([^;]+)/)?.[1];
    expect(verificar<{ codigo: string }>(valor)?.codigo).toBe("AP-ROSA22");
    const enviado = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(enviado.verificado).toBe(false);          // el sitio nunca se lo cree al navegador
    expect(enviado.telefono).toBe("88881234");
  });

  it("si ya era miembro no muestra ningún código", async () => {
    erpResponde({
      nombre: "Doña Rosa", cliente_nuevo: false, ya_era_miembro: true, correo_enviado: false, mascotas_pendientes: false,
      cupon: { porcentaje: "10", descripcion: "10 %", vence_en: null, estado: "DISPONIBLE", nuevo: false },
    }, 200);
    const { POST } = await import("./route");
    const r = await POST(pedido(valido, "2.2.2.2"));
    const cuerpo = await r.json();
    expect(cuerpo.yaEraMiembro).toBe(true);
    expect(r.headers.get("set-cookie") ?? "").not.toContain("manada_bienvenida");
    expect(r.headers.get("set-cookie") ?? "").toContain("manada_miembro=1");
  });

  it("frena el mismo número después de 3 intentos por hora", async () => {
    erpResponde({ nombre: "R", cliente_nuevo: false, ya_era_miembro: true, correo_enviado: false,
      mascotas_pendientes: true, cupon: null }, 200);
    const { POST } = await import("./route");
    for (let i = 0; i < 3; i++) expect((await POST(pedido(valido, `9.9.9.${i}`))).status).toBe(200);
    expect((await POST(pedido(valido, "9.9.9.99"))).status).toBe(429);
  });
});

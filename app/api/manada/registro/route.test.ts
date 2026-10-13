import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function pedido(cuerpo: unknown, ip = "1.1.1.1") {
  return new Request("http://localhost/api/manada/registro", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
    body: JSON.stringify(cuerpo),
  });
}

const valido = { nombre: "Ana", email: "Ana@Gmail.com", acepto: true, promos: true, telefono: "8888-1234", fuente: "qr-tienda" };

describe("POST /api/manada/registro", () => {
  beforeEach(() => {
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "token-secreto");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("sin consentimiento no registra", async () => {
    const { POST } = await import("./route");
    const r = await POST(pedido({ ...valido, acepto: false }));
    expect(r.status).toBe(400);
  });

  it("nunca dice al ERP que el correo está verificado, ni devuelve el código", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      nombre: "Ana", cliente_nuevo: true, correo_enviado: true, mascotas_pendientes: true,
      cupon: { codigo: "AP-NOVER1", porcentaje: "10", descripcion: "x", vence_en: null, estado: "DISPONIBLE", nuevo: true },
    }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");
    const r = await POST(pedido({ ...valido, verificado: true }));
    const cuerpo = await r.json();
    expect(r.status).toBe(200);
    expect(JSON.stringify(cuerpo)).not.toContain("AP-NOVER1");
    const enviado = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(enviado.verificado).toBe(false);
    expect(enviado.email).toBe("ana@gmail.com");
    expect(enviado.telefono).toBe("88881234");
    expect(enviado).not.toHaveProperty("google_sub");
  });

  it("frena el mismo correo después de 3 intentos por hora", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      nombre: "Ana", cliente_nuevo: false, correo_enviado: true, mascotas_pendientes: true, cupon: null,
    }), { status: 200 })));
    const { POST } = await import("./route");
    for (let i = 0; i < 3; i++) expect((await POST(pedido(valido, `9.9.9.${i}`))).status).toBe(200);
    expect((await POST(pedido(valido, "9.9.9.99"))).status).toBe(429);
  });
});

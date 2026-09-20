import { afterEach, describe, expect, it, vi } from "vitest";

function pedido(cuerpo: unknown) {
  return new Request("http://localhost/api/avisos-disponibilidad", {
    method: "POST",
    body: JSON.stringify(cuerpo),
  });
}

describe("POST /api/avisos-disponibilidad", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("rechaza sin sku", async () => {
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "t");
    const { POST } = await import("./route");
    const r = await POST(pedido({ email: "a@x.com" }));
    expect(r.status).toBe(400);
  });

  it("rechaza correo con formato inválido", async () => {
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "t");
    const { POST } = await import("./route");
    const r = await POST(pedido({ sku: "X1", email: "no-es-un-correo" }));
    expect(r.status).toBe(400);
  });

  it("con datos válidos, llama al ERP con el token y no lo expone", async () => {
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "token-secreto");
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      new Response(JSON.stringify({ ok: true }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await import("./route");
    const r = await POST(pedido({ sku: "X1", email: "a@x.com" }));
    const cuerpo = await r.json();

    expect(r.status).toBe(201);
    expect(cuerpo).toEqual({ ok: true });
    expect(JSON.stringify(cuerpo)).not.toContain("token-secreto");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://erp-de-prueba/api/catalogo/avisos-disponibilidad/");
    expect(init?.headers).toMatchObject({ Authorization: "Token token-secreto" });
  });

  it("si el ERP no está configurado, responde 503 (no un 500 genérico)", async () => {
    vi.stubEnv("ERP_API_URL", "");
    vi.stubEnv("ERP_API_TOKEN", "");
    const { POST } = await import("./route");
    const r = await POST(pedido({ sku: "X1", email: "a@x.com" }));
    expect(r.status).toBe(503);
  });

  it("si el ERP rechaza (ej. sku inexistente), no revienta con 500", async () => {
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "t");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ sku: ["no existe"] }), { status: 400 })));

    const { POST } = await import("./route");
    const r = await POST(pedido({ sku: "NO-EXISTE", email: "a@x.com" }));
    expect(r.status).toBe(502);
  });

  it("JSON inválido en el body no revienta el servidor", async () => {
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "t");
    const { POST } = await import("./route");
    const r = await POST(new Request("http://localhost/api/avisos-disponibilidad", { method: "POST", body: "{no-es-json" }));
    expect(r.status).toBe(400);
  });

  it("rechaza cuerpos demasiado grandes antes de llamar al ERP", async () => {
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "t");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");
    const r = await POST(pedido({ sku: "X1", email: `${"a".repeat(8_200)}@x.com` }));

    expect(r.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rechaza sku y correo que exceden sus límites", async () => {
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "t");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");

    const skuLargo = await POST(pedido({ sku: "X".repeat(101), email: "a@x.com" }));
    const correoLargo = await POST(pedido({ sku: "X1", email: `${"a".repeat(250)}@x.com` }));

    expect(skuLargo.status).toBe(400);
    expect(correoLargo.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

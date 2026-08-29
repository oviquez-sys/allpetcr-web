import { afterEach, describe, expect, it, vi } from "vitest";

function pedido(url: string) {
  return new Request(url);
}

function params(numero: string) {
  return { params: Promise.resolve({ numero }) };
}

describe("GET /api/pedidos/[numero]/estado", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("@/lib/erpServidor");
  });

  it("sin teléfono, 400", async () => {
    vi.doMock("@/lib/erpServidor", () => ({
      erpGet: vi.fn(), ErpNoConfiguradoError: class extends Error {}, ErpRespuestaError: class extends Error {},
    }));
    const { GET } = await import("./route");
    const r = await GET(pedido("http://localhost/api/pedidos/PED-1/estado"), params("PED-1"));
    expect(r.status).toBe(400);
  });

  it("con teléfono, pide al ERP la ruta con numero y telefono", async () => {
    const erpGet = vi.fn(async () => ({ numero: "PED-1", estado: "PAG", estado_display: "Pago confirmado", creado_en: "2026-08-29T00:00:00Z", total: 5000, lineas: [] }));
    vi.doMock("@/lib/erpServidor", () => ({
      erpGet, ErpNoConfiguradoError: class extends Error {}, ErpRespuestaError: class extends Error {},
    }));
    const { GET } = await import("./route");
    const r = await GET(pedido("http://localhost/api/pedidos/PED-1/estado?telefono=8888-1234"), params("PED-1"));
    const cuerpo = await r.json();

    expect(r.status).toBe(200);
    expect(cuerpo.numero).toBe("PED-1");
    expect(erpGet).toHaveBeenCalledWith("/api/pedidos/PED-1/estado/?telefono=8888-1234");
  });

  it("si el ERP da 404 (número o teléfono no coinciden), se propaga 404, no 500", async () => {
    class ErpRespuestaError extends Error { status = 404; cuerpo = {}; }
    vi.doMock("@/lib/erpServidor", () => ({
      erpGet: vi.fn(async () => { throw new ErpRespuestaError(); }),
      ErpNoConfiguradoError: class extends Error {},
      ErpRespuestaError,
    }));
    const { GET } = await import("./route");
    const r = await GET(pedido("http://localhost/api/pedidos/PED-1/estado?telefono=0000"), params("PED-1"));
    expect(r.status).toBe(404);
  });
});

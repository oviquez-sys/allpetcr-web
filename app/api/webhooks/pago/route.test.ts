import { afterEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";

const SECRETO = "secreto-de-prueba";

function firmar(cuerpo: string) {
  return createHmac("sha256", SECRETO).update(cuerpo).digest("hex");
}

function pedidoFirmado(cuerpoObjeto: unknown, opciones: { secreto?: string; sinFirma?: boolean } = {}) {
  const cuerpo = JSON.stringify(cuerpoObjeto);
  const headers: Record<string, string> = {};
  if (!opciones.sinFirma) {
    headers["x-firma-pago"] = firmar(cuerpo);
    if (opciones.secreto) headers["x-firma-pago"] = createHmac("sha256", opciones.secreto).update(cuerpo).digest("hex");
  }
  return new Request("http://localhost/api/webhooks/pago", { method: "POST", body: cuerpo, headers });
}

describe("POST /api/webhooks/pago", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.doUnmock("@/lib/erpServidor");
  });

  it("sin firma, 401 y ni siquiera llama al ERP", async () => {
    vi.stubEnv("PAGO_WEBHOOK_SECRET", SECRETO);
    const erpPost = vi.fn();
    vi.doMock("@/lib/erpServidor", () => ({
      erpPost, ErpNoConfiguradoError: class extends Error {}, ErpRespuestaError: class extends Error {},
    }));
    const { POST } = await import("./route");

    const r = await POST(pedidoFirmado({ referencia_pago: "p1" }, { sinFirma: true }));

    expect(r.status).toBe(401);
    expect(erpPost).not.toHaveBeenCalled();
  });

  it("con firma de otro secreto, 401", async () => {
    vi.stubEnv("PAGO_WEBHOOK_SECRET", SECRETO);
    vi.doMock("@/lib/erpServidor", () => ({
      erpPost: vi.fn(), ErpNoConfiguradoError: class extends Error {}, ErpRespuestaError: class extends Error {},
    }));
    const { POST } = await import("./route");

    const r = await POST(pedidoFirmado({ referencia_pago: "p1" }, { secreto: "otro-secreto" }));
    expect(r.status).toBe(401);
  });

  it("con firma correcta, reenvía el body tal cual al ERP", async () => {
    vi.stubEnv("PAGO_WEBHOOK_SECRET", SECRETO);
    const erpPost = vi.fn(async () => ({ numero: "PED-00000001", estado: "PAG", total: 5000 }));
    vi.doMock("@/lib/erpServidor", () => ({
      erpPost, ErpNoConfiguradoError: class extends Error {}, ErpRespuestaError: class extends Error {},
    }));
    const { POST } = await import("./route");

    const cuerpo = { referencia_pago: "pago-abc", lineas: [{ sku: "A1", cantidad: 1 }] };
    const r = await POST(pedidoFirmado(cuerpo));
    const respuesta = await r.json();

    expect(r.status).toBe(201);
    expect(respuesta.numero).toBe("PED-00000001");
    expect(erpPost).toHaveBeenCalledWith("/api/pedidos/", cuerpo);
  });

  it("idempotencia: el mismo webhook reenviado dos veces llama al ERP las dos veces "
    + "-la deduplicación real la hace el ERP por referencia_pago, no esta ruta-, "
    + "y ninguna de las dos falla", async () => {
    vi.stubEnv("PAGO_WEBHOOK_SECRET", SECRETO);
    // Simula lo que el ERP YA garantiza (probado en pedidos/tests.py bajo
    // concurrencia real): la segunda llamada con la misma referencia_pago
    // devuelve el MISMO pedido, no crea uno nuevo.
    const erpPost = vi.fn(async () => ({ numero: "PED-00000001", estado: "PAG", total: 5000 }));
    vi.doMock("@/lib/erpServidor", () => ({
      erpPost, ErpNoConfiguradoError: class extends Error {}, ErpRespuestaError: class extends Error {},
    }));
    const { POST } = await import("./route");

    const cuerpo = { referencia_pago: "pago-duplicado", lineas: [{ sku: "A1", cantidad: 1 }] };
    const r1 = await POST(pedidoFirmado(cuerpo));
    const r2 = await POST(pedidoFirmado(cuerpo));

    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    expect((await r1.json()).numero).toBe((await r2.json()).numero);
  });

  it("si el ERP rechaza el pedido, no revienta con 500", async () => {
    vi.stubEnv("PAGO_WEBHOOK_SECRET", SECRETO);
    class ErpRespuestaError extends Error {
      status = 400; cuerpo = { error: "sku inválido" };
    }
    vi.doMock("@/lib/erpServidor", () => ({
      erpPost: vi.fn(async () => { throw new ErpRespuestaError(); }),
      ErpNoConfiguradoError: class extends Error {},
      ErpRespuestaError,
    }));
    const { POST } = await import("./route");

    const r = await POST(pedidoFirmado({ referencia_pago: "p1" }));
    expect(r.status).toBe(502);
  });

  it("sin PAGO_WEBHOOK_SECRET configurado, 401 (nunca deja pasar sin firma verificable)", async () => {
    vi.stubEnv("PAGO_WEBHOOK_SECRET", "");
    vi.doMock("@/lib/erpServidor", () => ({
      erpPost: vi.fn(), ErpNoConfiguradoError: class extends Error {}, ErpRespuestaError: class extends Error {},
    }));
    const { POST } = await import("./route");
    const r = await POST(pedidoFirmado({ referencia_pago: "p1" }));
    expect(r.status).toBe(401);
  });
});

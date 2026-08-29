import { afterEach, describe, expect, it, vi } from "vitest";

function pedido(cuerpo: unknown) {
  return new Request("http://localhost/api/checkout", { method: "POST", body: JSON.stringify(cuerpo) });
}

describe("POST /api/checkout", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("@/lib/data");
  });

  it("ignora el precio que manda el cliente y usa el del catálogo (ítem 30)", async () => {
    vi.doMock("@/lib/data", () => ({
      getProductos: async () => [
        { sku: "A1", nombre: "Alimento perro", categoria_id: 1, presentacion: "",
          descripcion: "", mascota: "Perro", imagen: "", precio_venta: 10000, disponible: true },
      ],
    }));
    const { POST } = await import("./route");

    // El cliente manda un precio manipulado (1 colón) además de sku/cantidad.
    const r = await POST(pedido({ lineas: [{ sku: "A1", cantidad: 3, precio_venta: 1 }] }));
    const cuerpo = await r.json();

    expect(r.status).toBe(200);
    expect(cuerpo.total).toBe(30000); // 3 × 10000 real, no 3 × 1
  });

  it("sin líneas responde 400", async () => {
    vi.doMock("@/lib/data", () => ({ getProductos: async () => [] }));
    const { POST } = await import("./route");
    const r = await POST(pedido({ lineas: [] }));
    expect(r.status).toBe(400);
  });

  it("JSON inválido no revienta el servidor", async () => {
    vi.doMock("@/lib/data", () => ({ getProductos: async () => [] }));
    const { POST } = await import("./route");
    const r = await POST(new Request("http://localhost/api/checkout", { method: "POST", body: "{no-json" }));
    expect(r.status).toBe(400);
  });
});

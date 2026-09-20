import { afterEach, describe, expect, it, vi } from "vitest";

function pedido(cuerpo: unknown) {
  return new Request("http://localhost/api/checkout", { method: "POST", body: JSON.stringify(cuerpo) });
}

describe("POST /api/checkout", () => {
  it("devuelve un error recuperable sin exponer detalles del ERP", async () => {
    vi.doMock("@/lib/data", () => ({ getProductos: async () => { throw new Error("detalle privado"); } }));
    const { POST } = await import("./route");
    const respuesta = await POST(pedido({ lineas: [{ sku: "A1", cantidad: 1 }] }));
    expect(respuesta.status).toBe(503);
    const texto = JSON.stringify(await respuesta.json());
    expect(texto).toContain("carrito se conserva");
    expect(texto).not.toContain("detalle privado");
  });
  it("rechaza líneas duplicadas antes de consultar el ERP", async () => {
    const getProductos = vi.fn();
    vi.doMock("@/lib/data", () => ({ getProductos }));
    const { POST } = await import("./route");
    const respuesta = await POST(pedido({ lineas: [{ sku: "A1", cantidad: 60 }, { sku: "A1", cantidad: 60 }] }));
    expect(respuesta.status).toBe(400);
    expect(getProductos).not.toHaveBeenCalled();
  });
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
    expect(cuerpo.items[0].presentacion).toBe("");
  });

  it("sin líneas responde 400", async () => {
    vi.doMock("@/lib/data", () => ({ getProductos: async () => [] }));
    const { POST } = await import("./route");
    const r = await POST(pedido({ lineas: [] }));
    expect(r.status).toBe(400);
  });

  it("rechaza el pedido completo si contiene una línea mal formada", async () => {
    const getProductos = vi.fn();
    vi.doMock("@/lib/data", () => ({ getProductos }));
    const { POST } = await import("./route");
    const r = await POST(pedido({ lineas: [
      { sku: "A1", cantidad: 1 },
      { sku: "", cantidad: 1 },
    ] }));
    expect(r.status).toBe(400);
    expect(getProductos).not.toHaveBeenCalled();
  });

  it("rechaza cantidades enviadas como texto", async () => {
    vi.doMock("@/lib/data", () => ({ getProductos: vi.fn() }));
    const { POST } = await import("./route");
    const r = await POST(pedido({ lineas: [{ sku: "A1", cantidad: "1" }] }));
    expect(r.status).toBe(400);
  });

  it("limita el tamaño del cuerpo antes de consultar el ERP", async () => {
    vi.doMock("@/lib/data", () => ({ getProductos: vi.fn() }));
    const { POST } = await import("./route");
    const r = await POST(new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ lineas: [{ sku: "A".repeat(33_000), cantidad: 1 }] }),
    }));
    expect(r.status).toBe(413);
  });

  it("JSON inválido no revienta el servidor", async () => {
    vi.doMock("@/lib/data", () => ({ getProductos: async () => [] }));
    const { POST } = await import("./route");
    const r = await POST(new Request("http://localhost/api/checkout", { method: "POST", body: "{no-json" }));
    expect(r.status).toBe(400);
  });
});

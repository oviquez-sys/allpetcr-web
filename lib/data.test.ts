import { afterEach, describe, expect, it, vi } from "vitest";
import productosJson from "@/data/productos.json";
import categoriasJson from "@/data/categorias.json";

/**
 * lib/data.ts (Bloque 5, 2026-08-29): capa única de acceso al catálogo.
 * Sin ERP_API_URL/ERP_API_TOKEN cae a los JSON estáticos (comportamiento
 * de siempre); con ambas, pide el catálogo en vivo al ERP.
 */
describe("getProductos / getCategorias", () => {
  it("consulta directamente una ficha agotada y distingue un 404 de una falla del ERP", async () => {
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "token-prueba");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ sku: "A1", disponible: false })))
      .mockResolvedValueOnce(new Response("", { status: 404 }))
      .mockResolvedValueOnce(new Response("", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getProductoPorSku } = await import("./data");
    await expect(getProductoPorSku("A1")).resolves.toEqual({ sku: "A1", disponible: false });
    expect(fetchMock.mock.calls[0][0]).toBe("http://erp-de-prueba/api/catalogo/productos/A1/");
    await expect(getProductoPorSku("NO-EXISTE")).resolves.toBeUndefined();
    await expect(getProductoPorSku("A2")).rejects.toThrow("503");
  });
  it("no publica el catálogo estático si falta el ERP en producción", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ERP_API_URL", "");
    vi.stubEnv("ERP_API_TOKEN", "");
    const { getProductos } = await import("./data");
    await expect(getProductos()).rejects.toThrow("requiere configurar");
  });

  it("no envía el token al origen indicado por un next externo", async () => {
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "token-prueba");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ results: [], next: "https://externo.invalid/productos" })));
    vi.stubGlobal("fetch", fetchMock);
    const { getProductos } = await import("./data");
    await expect(getProductos()).rejects.toThrow("Origen");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]).toEqual(expect.arrayContaining([expect.objectContaining({ cache: "no-store", redirect: "error" })]));
  });

  it("interrumpe una paginación cíclica", async () => {
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "token-prueba");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ results: [], next: "/api/catalogo/productos/" }))));
    const { getProductos } = await import("./data");
    await expect(getProductos()).rejects.toThrow("Paginación");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("sin ERP_API_URL usa el JSON estático (comportamiento por defecto)", async () => {
    vi.stubEnv("ERP_API_URL", "");
    vi.stubEnv("ERP_API_TOKEN", "");
    const { getProductos, getCategorias } = await import("./data");
    await expect(getProductos()).resolves.toEqual(productosJson);
    await expect(getCategorias()).resolves.toEqual(categoriasJson);
  });

  it("con ERP configurado, pide el catálogo en vivo con el token", async () => {
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "token-123");
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      new Response(
        JSON.stringify({
          count: 1, next: null, previous: null,
          results: [{ sku: "X1", nombre: "Producto de prueba" }],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { getProductos } = await import("./data");
    const productos = await getProductos();

    expect(productos).toEqual([{ sku: "X1", nombre: "Producto de prueba" }]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://erp-de-prueba/api/catalogo/productos/");
    expect(init?.headers).toMatchObject({ Authorization: "Token token-123" });
  });

  it("sigue el link 'next' hasta traer todas las páginas", async () => {
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "token-123");
    const paginas = [
      { count: 2, next: "http://erp-de-prueba/api/catalogo/productos/?page=2", previous: null, results: [{ sku: "A" }] },
      { count: 2, next: null, previous: "x", results: [{ sku: "B" }] },
    ];
    let llamada = 0;
    const fetchMock = vi.fn(async () => {
      const pagina = paginas[llamada];
      llamada += 1;
      return new Response(JSON.stringify(pagina), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getProductos } = await import("./data");
    const productos = await getProductos();

    expect(productos).toEqual([{ sku: "A" }, { sku: "B" }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("si el ERP responde con error, propaga la falla en vez de devolver un catálogo vacío en silencio", async () => {
    vi.stubEnv("ERP_API_URL", "http://erp-de-prueba");
    vi.stubEnv("ERP_API_TOKEN", "token-123");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 500 })));

    const { getProductos } = await import("./data");
    await expect(getProductos()).rejects.toThrow();
  });
});

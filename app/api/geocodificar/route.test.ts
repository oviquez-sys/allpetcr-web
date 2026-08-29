import { afterEach, describe, expect, it, vi } from "vitest";

describe("GET /api/geocodificar", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sin lat/lng, 400", async () => {
    const { GET } = await import("./route");
    const r = await GET(new Request("http://localhost/api/geocodificar"));
    expect(r.status).toBe(400);
  });

  it("con coordenadas no numéricas, 400", async () => {
    const { GET } = await import("./route");
    const r = await GET(new Request("http://localhost/api/geocodificar?lat=abc&lng=def"));
    expect(r.status).toBe(400);
  });

  it("con coordenadas válidas, pide a Nominatim con User-Agent identificable y devuelve las divisiones", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect((init?.headers as Record<string, string>)["User-Agent"]).toContain("AllPetCR");
      return new Response(
        JSON.stringify({ address: { state: "Heredia", county: "Heredia", suburb: "Mercedes Norte" } }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const { GET } = await import("./route");
    const r = await GET(new Request("http://localhost/api/geocodificar?lat=10.0&lng=-84.1"));
    const cuerpo = await r.json();

    expect(r.status).toBe(200);
    expect(cuerpo).toEqual({ provincia: "Heredia", canton: "Heredia", distrito: "Mercedes Norte", viaSugerida: "" });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("lat=10.0");
    expect(url).toContain("lon=-84.1");
  });

  it("si Nominatim falla, 502 en vez de reventar", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 500 })));
    const { GET } = await import("./route");
    const r = await GET(new Request("http://localhost/api/geocodificar?lat=10&lng=-84"));
    expect(r.status).toBe(502);
  });
});

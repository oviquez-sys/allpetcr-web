import { afterEach, describe, expect, it, vi } from "vitest";

describe("erpServidor", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("no envía el token a una ruta de otro origen", async () => {
    vi.stubEnv("ERP_API_URL", "https://erp.example");
    vi.stubEnv("ERP_API_TOKEN", "secreto");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { erpGet } = await import("./erpServidor");
    await expect(erpGet("https://externo.invalid/robo")).rejects.toThrow("origen permitido");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envía las consultas válidas al ERP con caché desactivada", async () => {
    vi.stubEnv("ERP_API_URL", "https://erp.example");
    vi.stubEnv("ERP_API_TOKEN", "secreto");
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(JSON.stringify({ ok: true })),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { erpGet } = await import("./erpServidor");
    await expect(erpGet("/api/prueba/")).resolves.toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://erp.example/api/prueba/");
    expect(init).toMatchObject({ cache: "no-store", redirect: "error" });
    expect((init?.headers as Record<string, string>).Authorization).toBe("Token secreto");
  });
});

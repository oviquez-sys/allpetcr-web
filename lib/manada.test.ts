import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SECRETO = "s".repeat(40);

function idToken(claims: Record<string, unknown>) {
  const b = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b({ alg: "RS256" })}.${b(claims)}.firma`;
}

describe("lib/manada", () => {
  beforeEach(() => {
    vi.stubEnv("MANADA_SECRETO", SECRETO);
    vi.stubEnv("GOOGLE_CLIENT_ID", "cliente-123.apps.googleusercontent.com");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "secreto-google");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("firma y verifica; rechaza lo alterado y lo vencido", async () => {
    const { firmar, verificar } = await import("./manada");
    const t = firmar({ codigo: "AP-7K3P9Q" }, 60);
    expect(verificar<{ codigo: string }>(t)?.codigo).toBe("AP-7K3P9Q");

    const [cuerpo, firma] = t.split(".");
    const alterado = Buffer.from(JSON.stringify({ codigo: "AP-GRATIS", exp: 9e9 })).toString("base64url");
    expect(verificar(`${alterado}.${firma}`)).toBeNull();
    expect(verificar(`${cuerpo}.x`)).toBeNull();
    expect(verificar(firmar({ a: 1 }, -1))).toBeNull();
    expect(verificar(undefined)).toBeNull();
  });

  it("con un secreto corto, Google queda apagado", async () => {
    vi.stubEnv("MANADA_SECRETO", "corto");
    const { googleConfigurado } = await import("./manada");
    expect(googleConfigurado()).toBe(false);
  });

  it("acepta un id_token correcto", async () => {
    const { leerIdToken } = await import("./manada");
    const c = leerIdToken(idToken({
      iss: "https://accounts.google.com", aud: "cliente-123.apps.googleusercontent.com",
      exp: Math.floor(Date.now() / 1000) + 300, nonce: "n1", sub: "1098", email: "ana@gmail.com",
      email_verified: true, name: "Ana Pérez",
    }), "n1");
    expect(c).toEqual({ sub: "1098", email: "ana@gmail.com", nombre: "Ana Pérez" });
  });

  it.each([
    ["otro emisor", { iss: "https://malo.com" }],
    ["otra aplicación", { aud: "otra-app" }],
    ["vencido", { exp: 1 }],
    ["otro nonce", { nonce: "n2" }],
    ["correo sin verificar", { email_verified: false }],
  ])("rechaza un id_token con %s", async (_caso, cambio) => {
    const { leerIdToken } = await import("./manada");
    const base = {
      iss: "accounts.google.com", aud: "cliente-123.apps.googleusercontent.com",
      exp: Math.floor(Date.now() / 1000) + 300, nonce: "n1", sub: "1", email: "a@b.com", email_verified: true,
    };
    expect(() => leerIdToken(idToken({ ...base, ...cambio }), "n1")).toThrow();
  });

  it("la URL de Google lleva state, nonce y vuelve a nuestro sitio", async () => {
    const { urlAutorizacionGoogle } = await import("./manada");
    const u = new URL(urlAutorizacionGoogle("st", "no"));
    expect(u.origin).toBe("https://accounts.google.com");
    expect(u.searchParams.get("state")).toBe("st");
    expect(u.searchParams.get("nonce")).toBe("no");
    expect(u.searchParams.get("redirect_uri")).toBe("https://www.allpetcr.com/api/manada/google/callback");
    expect(u.searchParams.get("scope")).toBe("openid email profile");
  });

  it("el freno deja pasar hasta el máximo por ventana", async () => {
    const { permitido } = await import("./manada");
    const t0 = 1_000_000;
    expect(permitido("k", 2, 1000, t0)).toBe(true);
    expect(permitido("k", 2, 1000, t0 + 1)).toBe(true);
    expect(permitido("k", 2, 1000, t0 + 2)).toBe(false);
    expect(permitido("k", 2, 1000, t0 + 1500)).toBe(true);
  });

  it("limpia la fuente y el teléfono", async () => {
    const { limpiarFuente, limpiarTelefono } = await import("./manada");
    expect(limpiarFuente("QR-Tienda<script>")).toBe("qr-tiendascript");
    expect(limpiarFuente(undefined)).toBe("");
    expect(limpiarTelefono("+506 8888-1234")).toBe("+50688881234");
  });
});

import { describe, expect, it } from "vitest";
import { interpretarBorrador } from "./borradorCheckout";

describe("interpretarBorrador", () => {
  it("recupera la modalidad de envío y la dirección escrita", () => {
    const b = interpretarBorrador(JSON.stringify({
      nombre: "Ana Mora", telefono: "8888-7777", entrega: "coordinar",
      direccion: { provincia: "Guanacaste", canton: "Liberia", distrito: "Liberia", senas: "Casa azul", lat: 10.6, lng: -85.4 },
      nota: "Tarde", codigoManada: "ABC123",
    }));
    expect(b?.entrega).toBe("coordinar");
    expect(b?.direccion.provincia).toBe("Guanacaste");
    expect(b?.direccion.lat).toBe(10.6);
    expect(b?.codigoManada).toBe("ABC123");
  });

  it("nunca guarda ni devuelve la aceptación de términos", () => {
    const b = interpretarBorrador(JSON.stringify({ nombre: "Ana", aceptaTerminos: true }));
    expect(b).not.toHaveProperty("aceptaTerminos");
  });

  it("descarta datos dañados en vez de romper el formulario", () => {
    expect(interpretarBorrador("{no es json")).toBeNull();
    expect(interpretarBorrador(null)).toBeNull();
    const b = interpretarBorrador(JSON.stringify({ entrega: "otra", direccion: { lat: "x" } }));
    expect(b?.entrega).toBe("retiro");
    expect(b?.direccion.lat).toBeNull();
  });
});

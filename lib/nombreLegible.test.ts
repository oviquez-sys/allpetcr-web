import { describe, expect, it } from "vitest";
import { nombreLegible } from "./nombreLegible";

describe("nombreLegible", () => {
  it("pasa un nombre entero en mayúsculas a mayúscula inicial", () => {
    expect(nombreLegible("ADORNO AMO LEYENDO CON PERRO")).toBe("Adorno amo leyendo con perro");
  });

  it("respeta un nombre que ya alguien escribió a mano", () => {
    expect(nombreLegible("Pelota KONG Classic")).toBe("Pelota KONG Classic");
    expect(nombreLegible("Arnés chaleco talla M")).toBe("Arnés chaleco talla M");
  });

  it("deja tallas y siglas en mayúscula", () => {
    expect(nombreLegible("CAMISA TALLA XL")).toBe("Camisa talla XL");
    expect(nombreLegible("COLLAR LED (M)")).toBe("Collar LED (M)");
  });

  it("escribe la marca como corresponde", () => {
    expect(nombreLegible("ROYAL CANIN MEDIUM ADULT 3KG", "ROYAL CANIN")).toBe("Royal Canin medium adult 3kg");
    expect(nombreLegible("JUGUETE KONG CLASSIC", "Kong")).toBe("Juguete Kong classic");
  });

  it("no toca palabras: mismas letras, solo cambia mayúsculas", () => {
    const original = "PECHERA ÑANDÚ ACOLCHADA 2KG";
    const legible = nombreLegible(original);
    expect(legible.toLocaleUpperCase("es")).toBe(original);
    expect(legible).toBe("Pechera ñandú acolchada 2kg");
  });

  it("no rompe nombres sin letras ni marcas que no aparecen", () => {
    expect(nombreLegible("12345")).toBe("12345");
    expect(nombreLegible("CAMA REDONDA", "Zee.Dog")).toBe("Cama redonda");
  });
});

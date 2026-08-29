import { describe, expect, it } from "vitest";
import { extraerDivisionesCR } from "./direccionCR";

describe("extraerDivisionesCR", () => {
  it("toma provincia de state y cantón de county cuando están", () => {
    const r = extraerDivisionesCR({
      address: { state: "Heredia", county: "Heredia", suburb: "Mercedes Norte", road: "Calle 5" },
    });
    expect(r.provincia).toBe("Heredia");
    expect(r.canton).toBe("Heredia");
    expect(r.distrito).toBe("Mercedes Norte");
    expect(r.viaSugerida).toBe("Calle 5");
  });

  it("cae a city/town si no hay county", () => {
    expect(extraerDivisionesCR({ address: { city: "Alajuela" } }).canton).toBe("Alajuela");
    expect(extraerDivisionesCR({ address: { town: "Grecia" } }).canton).toBe("Grecia");
  });

  it("cae a city_district, neighbourhood o village si no hay suburb", () => {
    expect(extraerDivisionesCR({ address: { city_district: "X" } }).distrito).toBe("X");
    expect(extraerDivisionesCR({ address: { neighbourhood: "Y" } }).distrito).toBe("Y");
    expect(extraerDivisionesCR({ address: { village: "Z" } }).distrito).toBe("Z");
  });

  it("sin datos, todo queda vacío en vez de reventar", () => {
    expect(extraerDivisionesCR({})).toEqual({ provincia: "", canton: "", distrito: "", viaSugerida: "" });
  });

  it("via sugerida junta calle y número solo si ambos existen, sin espacios de más", () => {
    expect(extraerDivisionesCR({ address: { road: "Avenida 3" } }).viaSugerida).toBe("Avenida 3");
    expect(extraerDivisionesCR({}).viaSugerida).toBe("");
  });
});

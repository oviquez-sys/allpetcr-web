import { describe, expect, it } from "vitest";
import { formatoNumero, idealPara, pesoEnKg, precioPorKg } from "./alimentos";
import type { FichaAlimento } from "./types";

describe("precio por kilo", () => {
  it("convierte libras, gramos y kilos", () => {
    expect(pesoEnKg({ peso_valor: "12", peso_unidad: "lb" })).toBeCloseTo(5.443, 3);
    expect(pesoEnKg({ peso_valor: 85, peso_unidad: "g" })).toBeCloseTo(0.085, 5);
    expect(precioPorKg({ precio_venta: 8675, peso_valor: "5.000", peso_unidad: "kg" })).toBe(1735);
  });

  it("sin peso o con unidad que no es masa, no inventa un precio por kilo", () => {
    expect(precioPorKg({ precio_venta: 1000, peso_valor: null, peso_unidad: "" })).toBeNull();
    expect(precioPorKg({ precio_venta: 1000, peso_valor: "1", peso_unidad: "l" })).toBeNull();
    expect(precioPorKg({ precio_venta: 1000, peso_valor: "0", peso_unidad: "kg" })).toBeNull();
  });
});

describe("idealPara", () => {
  it("ordena y no repite", () => {
    const ficha = {
      especie: { clave: "perro", etiqueta: "Perro" },
      etapas: [{ clave: "adulto", etiqueta: "Adulto" }],
      tamanos_raza: [{ clave: "pequena", etiqueta: "Raza pequeña" }],
      necesidades: [{ clave: "control_peso", etiqueta: "Control de peso" }],
      proteina_principal: "Pollo",
    } as unknown as FichaAlimento;
    expect(idealPara(ficha)).toEqual(["Perro", "Adulto", "Raza pequeña", "Control de peso", "Con pollo"]);
  });
});

describe("formatoNumero", () => {
  it("usa el formato de Costa Rica", () => {
    expect(formatoNumero(4020)).toMatch(/^4\s?\.?020$|^4 020$|^4 020$/);
    expect(formatoNumero(null)).toBe("");
  });
});

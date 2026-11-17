import { describe, expect, it } from "vitest";
import { marcaVisible } from "./marcaVisible";

describe("marcaVisible", () => {
  it("muestra la marca cuando el nombre no la dice", () => {
    expect(marcaVisible({ nombre: "Arnés Flyharness Galaxy", marca: "Zee.Dog" })).toBe("Zee.Dog");
  });
  it("no repite la marca que ya abre el nombre", () => {
    expect(marcaVisible({ nombre: "Balance Ad Cat Chicken 10 kg", marca: "Balance" })).toBeNull();
    expect(marcaVisible({ nombre: "ZeeDog Plato", marca: "Zee.Dog" })).toBeNull();
  });
  it("sin marca, nada", () => {
    expect(marcaVisible({ nombre: "Collar de nylon", marca: "" })).toBeNull();
    expect(marcaVisible({ nombre: "Collar de nylon" })).toBeNull();
  });
});

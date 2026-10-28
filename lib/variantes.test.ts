import { describe, expect, it } from "vitest";
import { agruparTallas, separarTalla, tallasDe } from "./variantes";
import type { Producto } from "./types";

const base: Producto = { sku: "X", nombre: "X", categoria_id: 1, presentacion: "", descripcion: "", mascota: "", imagen: "/a.jpg", precio_venta: 1000, disponible: true };
const p = (sku: string, nombre: string, extra: Partial<Producto> = {}): Producto => ({ ...base, sku, nombre, ...extra });

describe("separarTalla", () => {
  it("reconoce la talla al final del nombre", () => {
    expect(separarTalla("Arnés Flyharness Slam talla 2")).toEqual({ base: "Arnés Flyharness Slam", talla: "2" });
    expect(separarTalla("Arnés acolchado reflectivo talla L")).toEqual({ base: "Arnés acolchado reflectivo", talla: "L" });
    expect(separarTalla("Collar isabelino talla 42.7 cm")).toEqual({ base: "Collar isabelino", talla: "42.7 cm" });
  });
  it("no inventa talla donde no la hay", () => {
    expect(separarTalla("Cama redonda acolchada 60 cm")).toBeNull();
    expect(separarTalla("Talla L")).toBeNull();
  });
});

describe("agruparTallas", () => {
  const lista = [
    p("3", "Arnés Slam talla 3", { precio_venta: 28500 }),
    p("9", "Pelota"),
    p("2", "Arnés Slam talla 2", { precio_venta: 26900 }),
    p("4", "Arnés Slam talla 4", { precio_venta: 29900, disponible: false }),
    p("L", "Arnés Slam talla L", { categoria_id: 2 }), // otra categoría: no se mezcla
  ];

  it("junta las tallas en una tarjeta, en el lugar de la primera", () => {
    const items = agruparTallas(lista);
    expect(items.map((i) => i.principal.sku)).toEqual(["2", "9", "L"]);
    expect(items[0].tallas.map((t) => t.sku)).toEqual(["2", "3", "4"]);
  });

  it("si queda una sola talla se muestra normal", () => {
    const items = agruparTallas([lista[0], lista[1]]);
    expect(items.every((i) => i.tallas.length === 1)).toBe(true);
  });

  it("ordena letras S M L XL de forma natural", () => {
    const items = agruparTallas([p("a", "Buzo talla XL"), p("b", "Buzo talla S"), p("c", "Buzo talla M")]);
    expect(items[0].tallas.map((t) => t.sku)).toEqual(["b", "c", "a"]);
  });

  it("tallasDe devuelve las hermanas de una ficha", () => {
    expect(tallasDe(lista[0], lista).map((t) => t.sku)).toEqual(["2", "3", "4"]);
    expect(tallasDe(lista[1], lista)).toEqual([]);
  });
});

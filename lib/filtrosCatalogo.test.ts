import { describe, expect, it } from "vitest";
import { claveMarca, opcionesMarca, opcionesSubcategoria } from "./filtrosCatalogo";
import type { Categoria, Producto } from "./types";

const prod = (sku: string, extra: Partial<Producto> = {}): Producto =>
  ({
    sku,
    nombre: `Producto ${sku}`,
    marca: "",
    categoria_id: null,
    presentacion: "",
    descripcion: "",
    precio_venta: 1000,
    disponible: true,
    imagen: "",
    ...extra,
  }) as Producto;

describe("claveMarca", () => {
  it("junta escrituras que solo cambian en signos o mayúsculas", () => {
    expect(claveMarca("Zee.Dog")).toBe(claveMarca("zeedog"));
    expect(claveMarca("Buen Amigo")).toBe(claveMarca("buen amigo"));
    expect(claveMarca("P.L.A.Y.")).toBe("play");
  });
  it("no adivina typos", () => {
    expect(claveMarca("Gosby")).not.toBe(claveMarca("Gosbi"));
  });
});

describe("opcionesMarca", () => {
  const lista = [
    prod("1", { marca: "Zee.Dog" }),
    prod("2", { marca: "Zee.Dog" }),
    prod("3", { marca: "zee dog" }),
    prod("4", { marca: "Buen Amigo" }),
    prod("5", { marca: "buen amigo" }),
    prod("6", { marca: "Sola" }),
    prod("7", { marca: "" }),
  ];
  it("ordena por cantidad, usa la escritura más común y omite marcas de 1", () => {
    expect(opcionesMarca(lista)).toEqual([
      { clave: "zeedog", nombre: "Zee.Dog", cuantos: 3 },
      { clave: "buenamigo", nombre: "Buen Amigo", cuantos: 2 },
    ]);
  });
  it("conserva una marca elegida aunque tenga 1 producto", () => {
    expect(opcionesMarca(lista, ["sola"]).map((m) => m.clave)).toContain("sola");
  });
});

describe("opcionesSubcategoria", () => {
  const cats: Categoria[] = [
    { id: 1, nombre: "Alimento", padre_id: null, orden: 1 },
    { id: 2, nombre: "Seco", padre_id: 1, orden: 1 },
    { id: 3, nombre: "Húmedo", padre_id: 1, orden: 2 },
    { id: 4, nombre: "Vacía", padre_id: 1, orden: 3 },
  ];
  it("se ofrecen cuando al menos 90 % está en subcategoría", () => {
    const ps = [
      ...Array.from({ length: 9 }, (_, i) => prod(`s${i}`, { categoria_id: 2 })),
      prod("h", { categoria_id: 3 }),
    ];
    expect(opcionesSubcategoria(cats, ps, 1)).toEqual([
      { id: 2, nombre: "Seco", cuantos: 9 },
      { id: 3, nombre: "Húmedo", cuantos: 1 },
    ]);
  });
  it("no se ofrecen si muchos productos quedaron en la raíz", () => {
    const ps = [
      ...Array.from({ length: 8 }, (_, i) => prod(`s${i}`, { categoria_id: 2 })),
      prod("h", { categoria_id: 3 }),
      prod("r1", { categoria_id: 1 }),
      prod("r2", { categoria_id: 1 }),
    ];
    expect(opcionesSubcategoria(cats, ps, 1)).toEqual([]);
  });
  it("una sola subcategoría con productos no es una elección", () => {
    const ps = [prod("a", { categoria_id: 2 }), prod("b", { categoria_id: 2 })];
    expect(opcionesSubcategoria(cats, ps, 1)).toEqual([]);
  });
});

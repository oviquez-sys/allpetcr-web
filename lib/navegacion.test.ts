import { describe, expect, it } from "vitest";
import { construirNavegacion, idsRama } from "./navegacion";
import type { Categoria, Producto } from "./types";

const categorias: Categoria[] = [
  { id: 901, nombre: "Familia nueva", padre_id: null, orden: 1 },
  { id: 902, nombre: "Subcategoría", padre_id: 901, orden: 1 },
  { id: 903, nombre: "Tercer nivel", padre_id: 902, orden: 1 },
];
const producto: Producto = { sku: "nuevo", nombre: "Producto", categoria_id: 903, mascota: "Gato", disponible: true, precio_venta: 100, imagen: "", descripcion: "", presentacion: "" };
describe("navegación del catálogo recibido", () => {
  it("incorpora categorías nuevas y descendientes sin depender del JSON exportado", () => {
    const menu = construirNavegacion(categorias, [producto]);
    expect(menu.find((s) => s.id === "gato")?.grupos).toEqual([{ label: "Familia nueva", href: "/catalogo?cats=901&para=gato" }]);
    expect(menu.find((s) => s.id === "perro")?.grupos).toEqual([]);
  });
  it("no ofrece categorías sin productos disponibles", () => {
    expect(construirNavegacion(categorias, [{ ...producto, disponible: false }]).every((s) => s.grupos.length === 0)).toBe(true);
  });
  it("termina al encontrar un ciclo", () => {
    expect(idsRama([{ ...categorias[0], padre_id: 903 }, ...categorias.slice(1)], 901)).toEqual([901, 902, 903]);
  });
});

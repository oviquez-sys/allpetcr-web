import { describe, expect, it } from "vitest";
import { construirAlimentos, construirNavegacion, idsRama } from "./navegacion";
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

describe("división de alimentos", () => {
  const cats: Categoria[] = [
    { id: 10, nombre: "Alimento", padre_id: null, orden: 10 },
    { id: 11, nombre: "Alimento seco", padre_id: 10, orden: 11 },
    { id: 12, nombre: "Alimento húmedo", padre_id: 10, orden: 12 },
    { id: 20, nombre: "Snacks y premios", padre_id: null, orden: 20 },
    { id: 30, nombre: "Juguetes", padre_id: null, orden: 30 },
  ];
  const p = (sku: string, categoria_id: number, mascota: string): Producto =>
    ({ ...producto, sku, categoria_id, mascota });
  const productos = [p("a", 11, "Perro"), p("b", 11, "Gato"), p("c", 12, "Gato"), p("d", 20, "Perro"), p("e", 30, "Perro")];

  it("separa cada formato por especie y solo muestra lo que tiene existencia", () => {
    const s = construirAlimentos(cats, productos)!;
    expect(s.href).toBe("/catalogo?cats=10,20");
    expect(s.grupos).toEqual([
      { label: "Alimento seco para perro", href: "/catalogo?cats=11&para=perro" },
      { label: "Snacks y premios para perro", href: "/catalogo?cats=20&para=perro" },
      { label: "Alimento seco para gato", href: "/catalogo?cats=11&para=gato" },
      { label: "Alimento húmedo para gato", href: "/catalogo?cats=12&para=gato" },
    ]);
  });

  it("va primero en el menú y desaparece si no hay alimento", () => {
    expect(construirNavegacion(cats, productos)[0].id).toBe("alimentos");
    expect(construirNavegacion(cats, [p("e", 30, "Perro")]).some((s) => s.id === "alimentos")).toBe(false);
  });

  it("un alimento para perro y gato aparece en las dos especies", () => {
    const s = construirAlimentos(cats, [p("x", 12, "Perro y gato")])!;
    expect(s.grupos.map((g) => g.label)).toEqual(["Alimento húmedo para perro", "Alimento húmedo para gato"]);
  });
});

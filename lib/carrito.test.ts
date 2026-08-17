import { describe, it, expect } from "vitest";
import { resolverCarrito, type LineaCarrito } from "./carrito";
import type { Producto } from "./types";

const catalogo: Producto[] = [
  { sku: "A1", nombre: "Alimento perro", categoria_id: 1, presentacion: "2 kg",
    descripcion: "Alimento seco para perro adulto.", mascota: "Perro",
    imagen: "", precio_venta: 10000, disponible: true },
  // A2 sigue con `disponible: false` a propósito: aunque el exportador del ERP
  // ya solo publica lo que hay en existencia, el carrito vive en el navegador
  // y guarda SKU entre visitas. Un producto que se agotó entre dos
  // exportaciones es justo el caso que estas pruebas cubren.
  { sku: "A2", nombre: "Arena gato", categoria_id: 2, presentacion: "5 L",
    descripcion: "Arena aglomerante para gato.", mascota: "Gato",
    imagen: "", precio_venta: 4000, disponible: false },
];

function linea(sku: string, cantidad: number, precioGuardado = 0): LineaCarrito {
  return { sku, cantidad, nombreGuardado: sku, precioGuardado };
}

describe("resolverCarrito", () => {
  it("calcula el total con el precio VIGENTE, no con el guardado", () => {
    // El cliente agregó cuando costaba 8000; hoy cuesta 10000.
    const { items, total } = resolverCarrito([linea("A1", 2, 8000)], catalogo);
    expect(total).toBe(20000);
    expect(items[0].precioCambio).toBe(true);
    expect(items[0].precioAnterior).toBe(8000);
  });

  it("no cobra por productos sin existencias", () => {
    const { total } = resolverCarrito([linea("A2", 3, 4000)], catalogo);
    expect(total).toBe(0);
  });

  it("marca como descatalogado un producto que ya no está", () => {
    const { items, hayProblemas } = resolverCarrito([linea("ZZ", 1)], catalogo);
    expect(items[0].descatalogado).toBe(true);
    expect(items[0].producto).toBeNull();
    expect(hayProblemas).toBe(true);
  });

  it("no marca problema cuando todo está normal", () => {
    const { hayProblemas, total } = resolverCarrito([linea("A1", 1, 10000)], catalogo);
    expect(hayProblemas).toBe(false);
    expect(total).toBe(10000);
  });

  it("suma varias líneas", () => {
    const { total } = resolverCarrito(
      [linea("A1", 2, 10000), linea("A2", 1, 4000)],
      catalogo,
    );
    // A2 está agotado: no suma.
    expect(total).toBe(20000);
  });

  it("carrito vacío da total cero sin reventar", () => {
    const { items, total, hayProblemas } = resolverCarrito([], catalogo);
    expect(items).toHaveLength(0);
    expect(total).toBe(0);
    expect(hayProblemas).toBe(false);
  });
});

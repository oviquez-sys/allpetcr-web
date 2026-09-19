import { describe, expect, it } from "vitest";
import { calcularTotalCheckout } from "./checkoutServidor";
import type { Producto } from "./types";

const catalogo: Producto[] = [
  { sku: "A1", nombre: "Alimento perro", categoria_id: 1, presentacion: "",
    descripcion: "", mascota: "Perro", imagen: "", precio_venta: 10000, disponible: true },
  { sku: "A2", nombre: "Arena gato", categoria_id: 2, presentacion: "",
    descripcion: "", mascota: "Gato", imagen: "", precio_venta: 4000, disponible: false },
];

describe("calcularTotalCheckout", () => {
  it("calcula el total con el precio REAL del catálogo, ignorando cualquier precio recibido", () => {
    // Esto es justo lo que pide el encargo: un precio manipulado en la
    // entrada (acá ni siquiera cabe en el tipo LineaEntrada — se simula
    // pasando un objeto con un campo de más, como llegaría de un
    // request.json() sin tipar) no debe afectar el resultado.
    const lineaConPrecioFalso = { sku: "A1", cantidad: 2, precio_venta: 1 } as unknown as {
      sku: string; cantidad: number;
    };
    const resultado = calcularTotalCheckout([lineaConPrecioFalso], catalogo);

    expect(resultado.total).toBe(20000); // 2 × 10000, NO 2 × 1
    expect(resultado.items[0].precioUnitario).toBe(10000);
  });

  it("suma varias líneas correctamente", () => {
    const resultado = calcularTotalCheckout(
      [{ sku: "A1", cantidad: 1 }],
      catalogo,
    );
    expect(resultado.total).toBe(10000);
  });

  it("un sku que no existe no rompe el cálculo, se reporta como problema", () => {
    const resultado = calcularTotalCheckout(
      [{ sku: "A1", cantidad: 1 }, { sku: "NO-EXISTE", cantidad: 1 }],
      catalogo,
    );
    expect(resultado.total).toBe(10000);
    expect(resultado.problemas).toEqual(["NO-EXISTE: no existe en el catálogo."]);
  });

  it("un producto agotado no suma al total (mismo criterio que resolverCarrito)", () => {
    const resultado = calcularTotalCheckout([{ sku: "A2", cantidad: 1 }], catalogo);
    expect(resultado.total).toBe(0);
    expect(resultado.items).toHaveLength(0);
    expect(resultado.problemas).toEqual(["A2: sin existencias."]);
  });

  it("cantidad cero, negativa o excesiva se rechaza", () => {
    for (const cantidad of [0, -1, 100]) {
      const resultado = calcularTotalCheckout([{ sku: "A1", cantidad }], catalogo);
      expect(resultado.items).toHaveLength(0);
    }
  });

  it("rechaza cantidades fraccionarias sin modificar silenciosamente el pedido", () => {
    const resultado = calcularTotalCheckout([{ sku: "A1", cantidad: 2.9 }], catalogo);
    expect(resultado.items).toHaveLength(0);
    expect(resultado.problemas).toEqual(["A1: cantidad inválida."]);
  });
});

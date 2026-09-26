import { describe, expect, it } from "vitest";
import { armarVitrina } from "./vitrina";
import type { Producto } from "./types";

function p(sku: string, cambios: Partial<Producto> = {}): Producto {
  return {
    sku, nombre: `Producto ${sku}`, categoria_id: 1, presentacion: "",
    descripcion: "", mascota: "Perro", imagen: "/productos/x.jpg",
    precio_venta: 1000, disponible: true, ...cambios,
  };
}

describe("armarVitrina", () => {
  it("pone primero los destacados, en el orden de orden_home y no el del catálogo", () => {
    const disponibles = [
      p("C", { destacado_home: true, orden_home: 3 }),
      p("A", { destacado_home: true, orden_home: 1 }),
      p("B", { destacado_home: true, orden_home: 2 }),
    ];
    const vitrina = armarVitrina(disponibles, 3);
    expect(vitrina.map((x) => x.sku)).toEqual(["A", "B", "C"]);
  });

  it("nunca ordena alfabéticamente: un destacado con orden_home bajo gana aunque su nombre venga después", () => {
    const disponibles = [
      p("Z", { nombre: "Zebra", destacado_home: true, orden_home: 1 }),
      p("A", { nombre: "Ave", destacado_home: true, orden_home: 2 }),
    ];
    const vitrina = armarVitrina(disponibles, 2);
    expect(vitrina.map((x) => x.sku)).toEqual(["Z", "A"]);
  });

  it("completa con el relleno automático cuando faltan destacados para llenar la sección", () => {
    const disponibles = [
      p("DEST", { destacado_home: true, orden_home: 1 }),
      p("RELLENO-1", { categoria_id: 2 }),
      p("RELLENO-2", { categoria_id: 3 }),
    ];
    const vitrina = armarVitrina(disponibles, 3);
    expect(vitrina).toHaveLength(3);
    expect(vitrina[0].sku).toBe("DEST"); // el destacado sigue primero
    expect(vitrina.map((x) => x.sku)).toEqual(expect.arrayContaining(["RELLENO-1", "RELLENO-2"]));
  });

  it("un destacado sin foto no entra a la vitrina (es una vidriera visual)", () => {
    const disponibles = [
      p("SIN-FOTO", { destacado_home: true, orden_home: 1, imagen: "" }),
      p("CON-FOTO", { categoria_id: 2 }),
    ];
    const vitrina = armarVitrina(disponibles, 2);
    expect(vitrina.map((x) => x.sku)).not.toContain("SIN-FOTO");
    expect(vitrina.map((x) => x.sku)).toContain("CON-FOTO");
  });

  it("un producto sin inventario no aparece aunque esté destacado (lo filtra quien llama, con `disponible`)", () => {
    // armarVitrina recibe SOLO productos ya disponibles — la regla de
    // negocio "sin stock no sale" vive en cómo se arma ese arreglo (ver
    // page.tsx: `disponibles = productos.filter(p => p.disponible)`), no
    // acá. Esta prueba deja constancia de ese contrato: si el agotado ni
    // siquiera llega en la lista, jamás puede colarse en la vitrina.
    const disponibles = [p("EN-STOCK", { categoria_id: 2 })]; // el agotado ya se filtró antes de llamar
    const vitrina = armarVitrina(disponibles, 3);
    expect(vitrina.map((x) => x.sku)).toEqual(["EN-STOCK"]);
  });

  it("sin ningún destacado, se comporta como el reparto automático de siempre (por categoría, más surtida primero)", () => {
    const disponibles = [
      p("J1", { categoria_id: 30, nombre: "Pelota" }),
      p("J2", { categoria_id: 30, nombre: "Cuerda" }),
      p("J3", { categoria_id: 30, nombre: "Mordedor" }),
      p("A1", { categoria_id: 10, nombre: "Bolsa" }),
    ];
    const vitrina = armarVitrina(disponibles, 4);
    // La categoría 30 (3 productos) reparte antes que la 10 (1 producto),
    // pero se alternan en vez de agotar una categoría antes de pasar a otra.
    expect(vitrina.map((x) => x.categoria_id)).toEqual([30, 10, 30, 30]);
  });

  it("no repite nombre de producto, ni entre destacados ni en el relleno", () => {
    const disponibles = [
      p("DEST", { nombre: "Arnés chaleco", destacado_home: true, orden_home: 1 }),
      p("OTRO-MISMO-NOMBRE", { nombre: "Arnés chaleco", categoria_id: 2 }),
      p("DISTINTO", { nombre: "Correa", categoria_id: 3 }),
    ];
    const vitrina = armarVitrina(disponibles, 3);
    const nombres = vitrina.map((x) => x.nombre);
    expect(new Set(nombres).size).toBe(nombres.length);
    expect(vitrina.map((x) => x.sku)).not.toContain("OTRO-MISMO-NOMBRE");
  });

  it("productos sin destacado_home ni orden_home (JSON viejo) no rompen nada", () => {
    const disponibles = [p("SIN-CAMPO"), p("OTRO", { categoria_id: 2 })];
    const vitrina = armarVitrina(disponibles, 2);
    expect(vitrina).toHaveLength(2);
  });

  it("es determinista: mismo catálogo, misma vitrina", () => {
    const disponibles = [
      p("A", { destacado_home: true, orden_home: 2 }),
      p("B", { destacado_home: true, orden_home: 1 }),
      p("C", { categoria_id: 2 }),
    ];
    expect(armarVitrina(disponibles, 3)).toEqual(armarVitrina(disponibles, 3));
  });
});

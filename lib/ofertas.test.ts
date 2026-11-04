import { describe, expect, it } from "vitest";
import { ahorro, enOferta, fechaCorta, finDeOferta, normalizarOferta, resumenOfertas } from "./ofertas";
import { construirNavegacion } from "./navegacion";
import type { Producto } from "./types";

function p(sku: string, cambios: Partial<Producto> = {}): Producto {
  return {
    sku, nombre: `Producto ${sku}`, categoria_id: 1, presentacion: "", descripcion: "",
    mascota: "Perro", imagen: "", precio_venta: 1000, disponible: true, ...cambios,
  };
}
const oferta = { pct: 40, nombre: "Black Friday", hasta: "2026-11-30", en_ofertas: true };

describe("ofertas", () => {
  it("reconoce una oferta solo si el precio de antes es mayor", () => {
    expect(enOferta(p("A", { precio_venta: 16090, precio_antes: 26900, oferta }))).toBe(true);
    expect(enOferta(p("B", { precio_venta: 16090, precio_antes: 16090, oferta }))).toBe(false);
    expect(enOferta(p("C"))).toBe(false);
    expect(ahorro(p("A", { precio_venta: 16090, precio_antes: 26900, oferta }))).toBe(10810);
  });

  it("descarta una oferta mal formada en vez de romper", () => {
    const mala = normalizarOferta(p("A", { precio_antes: 900, oferta: { ...oferta, hasta: "mañana" } }));
    expect(mala.oferta).toBeNull();
    expect(mala.precio_antes).toBeNull();
    const buena = normalizarOferta(p("B", { precio_venta: 600, precio_antes: 1000, oferta }));
    expect(buena.oferta?.pct).toBe(40);
  });

  it("fecha corta y fin del día en hora de Costa Rica", () => {
    expect(fechaCorta("2026-11-30")).toBe("lun 30/11");
    expect(finDeOferta("2026-11-30").toISOString()).toBe("2026-12-01T05:59:59.000Z");
  });

  it("resumen para la franja: la promo con más productos, el mayor % y el último día", () => {
    const productos = [
      p("A", { precio_venta: 600, precio_antes: 1000, oferta }),
      p("B", { precio_venta: 500, precio_antes: 1000, oferta: { ...oferta, pct: 50, hasta: "2026-12-02" } }),
      p("C", { precio_venta: 900, precio_antes: 1000, oferta: { ...oferta, nombre: "Otra", pct: 10 } }),
      p("D", { precio_venta: 100, precio_antes: 1000, oferta: { ...oferta, pct: 90, en_ofertas: false } }),
      p("E", { precio_venta: 100, precio_antes: 1000, oferta, disponible: false }),
    ];
    expect(resumenOfertas(productos)).toEqual({ nombre: "Black Friday", pctMax: 50, hasta: "2026-12-02", cantidad: 3 });
    expect(resumenOfertas([p("Z")])).toBeNull();
  });

  it("el menú lleva «Ofertas» primero solo mientras hay ofertas", () => {
    const cats = [{ id: 1, nombre: "Juguetes", padre_id: null, orden: 1 }];
    expect(construirNavegacion(cats, [p("A")]).some((s) => s.id === "ofertas")).toBe(false);
    const nav = construirNavegacion(cats, [p("A", { precio_venta: 600, precio_antes: 1000, oferta })]);
    expect(nav[0]).toMatchObject({ id: "ofertas", href: "/catalogo?ofertas=1" });
  });
});

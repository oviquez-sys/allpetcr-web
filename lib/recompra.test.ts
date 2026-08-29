import { describe, it, expect } from "vitest";
import {
  sanear,
  vigente,
  hayQueRecordar,
  diasDesde,
  type Recompra,
} from "./recompra";

const MS_DIA = 86_400_000;
const AHORA = Date.UTC(2026, 7, 26, 12, 0, 0);

function estado(parcial: Partial<Recompra> = {}): Recompra {
  return {
    lineas: [{ sku: "A1", cantidad: 2, nombreGuardado: "Alimento perro", precioGuardado: 10000 }],
    hecho: AHORA - 30 * MS_DIA,
    dias: null,
    ocultoHasta: null,
    ...parcial,
  };
}

describe("sanear", () => {
  it("acepta un estado bien formado", () => {
    const r = sanear(JSON.parse(JSON.stringify(estado({ dias: 30 }))));
    expect(r?.lineas).toHaveLength(1);
    expect(r?.dias).toBe(30);
  });

  it("descarta lo que no es un estado", () => {
    for (const basura of [null, undefined, 7, "x", {}, { lineas: [] }, []]) {
      expect(sanear(basura)).toBeNull();
    }
  });

  it("filtra líneas corruptas y descarta el estado si no queda ninguna", () => {
    expect(sanear({ ...estado(), lineas: [{ sku: "", cantidad: 1 }] })).toBeNull();
    expect(sanear({ ...estado(), lineas: [{ sku: "A1", cantidad: -3 }] })).toBeNull();
    expect(sanear({ ...estado(), lineas: [{ sku: "A1", cantidad: "muchas" }] })).toBeNull();
  });

  it("rellena los campos opcionales que falten en la copia guardada", () => {
    const r = sanear({ ...estado(), lineas: [{ sku: "A1", cantidad: 3 }] });
    expect(r?.lineas[0]).toEqual({
      sku: "A1", cantidad: 3, nombreGuardado: "", precioGuardado: 0,
    });
  });

  // Un plazo absurdo guardado a mano no debe convertirse en un aviso que
  // aparece cada vez que la persona entra, ni en uno que no aparece nunca.
  it("ignora plazos de recordatorio fuera de rango", () => {
    expect(sanear({ ...estado(), dias: 0 })?.dias).toBeNull();
    expect(sanear({ ...estado(), dias: 5000 })?.dias).toBeNull();
    expect(sanear({ ...estado(), dias: 45 })?.dias).toBe(45);
  });
});

describe("vigente", () => {
  it("un pedido reciente sirve de referencia", () => {
    expect(vigente(estado({ hecho: AHORA - 10 * MS_DIA }), AHORA)).toBe(true);
  });

  it("uno de hace más de seis meses ya no", () => {
    expect(vigente(estado({ hecho: AHORA - 200 * MS_DIA }), AHORA)).toBe(false);
  });
});

describe("hayQueRecordar", () => {
  it("no avisa si el cliente nunca pidió recordatorio", () => {
    expect(hayQueRecordar(estado({ dias: null }), AHORA)).toBe(false);
  });

  it("no avisa antes de cumplirse el plazo", () => {
    expect(hayQueRecordar(estado({ hecho: AHORA - 10 * MS_DIA, dias: 30 }), AHORA)).toBe(false);
  });

  it("avisa una vez cumplido el plazo", () => {
    expect(hayQueRecordar(estado({ hecho: AHORA - 31 * MS_DIA, dias: 30 }), AHORA)).toBe(true);
  });

  it("respeta el 'recordámelo después'", () => {
    const pospuesto = estado({
      hecho: AHORA - 31 * MS_DIA,
      dias: 30,
      ocultoHasta: AHORA + 3 * MS_DIA,
    });
    expect(hayQueRecordar(pospuesto, AHORA)).toBe(false);
    expect(hayQueRecordar(pospuesto, AHORA + 4 * MS_DIA)).toBe(true);
  });

  // Sin esto, alguien que dejó de comprar hace un año se encontraría el aviso
  // intacto al volver, con un pedido que ya no significa nada.
  it("no avisa sobre un pedido caducado", () => {
    expect(hayQueRecordar(estado({ hecho: AHORA - 200 * MS_DIA, dias: 30 }), AHORA)).toBe(false);
  });

  it("sin nada guardado no hay aviso", () => {
    expect(hayQueRecordar(null, AHORA)).toBe(false);
  });
});

describe("diasDesde", () => {
  it("cuenta días enteros", () => {
    expect(diasDesde(AHORA - 3 * MS_DIA - 1000, AHORA)).toBe(3);
  });

  it("nunca devuelve negativos con un reloj adelantado", () => {
    expect(diasDesde(AHORA + 5 * MS_DIA, AHORA)).toBe(0);
  });
});

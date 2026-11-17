import { describe, expect, it } from "vitest";
import { ajustarAZona, estadoCampana, resumirBeneficios, zonasLegibles, type BeneficiosErp } from "./campana";

const t = (iso: string) => Date.parse(iso);
const ZONAS = ["Heredia / Heredia", "Heredia / Mercedes", "Heredia / San Francisco", "Heredia / Ulloa"];

describe("estadoCampana", () => {
  const activa = { activa: true, inscripcion_abierta: true, sorteo_en: "2026-12-24T12:00:00-06:00" };
  it("abierta mientras el ERP acepta inscripciones", () => {
    expect(estadoCampana({ conectado: true, erp: activa }, t("2026-11-20T10:00:00-06:00"))).toBe("abierta");
  });
  it("cerrada después del cierre y antes del sorteo", () => {
    expect(estadoCampana({ conectado: true, erp: { ...activa, inscripcion_abierta: false } }, t("2026-12-24T09:00:00-06:00"))).toBe("cerrada");
  });
  it("finalizada después del sorteo, aunque el ERP ya no la tenga activa", () => {
    expect(estadoCampana({ conectado: true, erp: { activa: false } }, t("2026-12-26T09:00:00-06:00"))).toBe("finalizada");
  });
  it("la tarjeta sigue llevando a «finalizó» hasta fin de enero, y después a la portada normal", () => {
    expect(estadoCampana({ conectado: true, erp: { activa: false } }, t("2027-01-31T20:00:00-06:00"))).toBe("finalizada");
    expect(estadoCampana({ conectado: true, erp: { activa: false } }, t("2027-02-01T08:00:00-06:00"))).toBe("ninguna");
  });
  it("antes de activarla en el ERP no se promete nada", () => {
    expect(estadoCampana({ conectado: true, erp: { activa: false } }, t("2026-11-17T10:00:00-06:00"))).toBe("ninguna");
  });
  it("con el ERP caído en plena campaña se sigue invitando (el formulario permite reintentar)", () => {
    expect(estadoCampana({ conectado: false, erp: null }, t("2026-11-20T10:00:00-06:00"))).toBe("abierta");
  });
});

describe("resumirBeneficios: el bono es por SUPERAR ₡20.000", () => {
  const base = (monto: number, extra: Partial<BeneficiosErp> = {}): BeneficiosErp => {
    const supera = monto > 20000;
    return {
      activa: true, umbral: "20000.00", monto_evaluado: monto.toFixed(2), supera_umbral: supera,
      falta_para_bono: (supera ? 0 : 20000 - monto + 1).toFixed(2), participa: true, da_numeros: true,
      numeros: { habituales: 1, bono: supera ? 1 : 0, total: supera ? 2 : 1 },
      envio: { aplica: false, gratis: false, motivo: "" }, ...extra,
    };
  };
  it("₡20.000 exactos: 1 número y falta ₡1", () => {
    const r = resumirBeneficios(base(20000))!;
    expect(r.numeros).toMatch(/te suma 1 número para el sorteo\.$/);
    expect(r.faltante).toMatch(/Te faltan ₡\s?1 para superar/);
  });
  it("₡20.001: 2 números, con el bono explicado", () => {
    const r = resumirBeneficios(base(20001))!;
    expect(r.numeros).toMatch(/2 números .*1 por la compra \+ 1 de bono/);
    expect(r.faltante).toBeNull();
  });
  it("quien no se sabe inscrito lee «si estás inscrito»", () => {
    expect(resumirBeneficios(base(5000, { participa: false }))!.numeros).toMatch(/^Si estás inscrito/);
    expect(resumirBeneficios(base(5000, { participa: false }), true)!.numeros).toMatch(/^Esta compra te suma/);
  });
  it("sin campaña no dice nada", () => {
    expect(resumirBeneficios({ activa: false })).toBeNull();
    expect(resumirBeneficios(null)).toBeNull();
  });
});

describe("ajustarAZona", () => {
  it("acerca lo que sugiere el mapa al nombre de la zona", () => {
    expect(ajustarAZona("Heredia Central", "Mercedes Norte", ZONAS)).toEqual({ canton: "Heredia", distrito: "Mercedes" });
    expect(ajustarAZona("heredia", "San Francisco", ZONAS)).toEqual({ canton: "Heredia", distrito: "San Francisco" });
    expect(ajustarAZona("Heredia", "Centro", ZONAS)).toEqual({ canton: "Heredia", distrito: "Heredia" });
  });
  it("lo que no es la zona se manda tal cual", () => {
    expect(ajustarAZona("Barva", "San Pablo", ZONAS)).toEqual({ canton: "Barva", distrito: "San Pablo" });
    expect(ajustarAZona("Heredia", "Varablanca", ZONAS)).toEqual({ canton: "Heredia", distrito: "Varablanca" });
  });
  it("zonas en palabras", () => {
    expect(zonasLegibles(ZONAS)).toBe("Heredia, Mercedes, San Francisco y Ulloa");
  });
});

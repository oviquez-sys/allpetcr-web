import { describe, expect, it } from "vitest";
import { camposPendientes, negocio } from "./negocio";

describe("datos del negocio", () => {
  it("no tiene campos obligatorios pendientes", () => {
    // Si alguien enciende el pago en línea sin llenar tarjetas, seguridad y
    // certificadora (Reglamento 37899-MEIC art. 192), esta prueba falla.
    expect(camposPendientes()).toEqual([]);
  });

  it("la razón social es la de la cédula jurídica", () => {
    expect(negocio.razonSocial.startsWith(negocio.cedulaJuridica)).toBe(true);
  });
});

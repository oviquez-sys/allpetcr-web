import { describe, expect, it } from "vitest";
import { calcularFirma, firmaValida } from "./firmaWebhook";

describe("firmaValida", () => {
  const secreto = "secreto-de-prueba";
  const cuerpo = '{"referencia_pago":"pago-123","monto":1000}';

  it("acepta la firma correcta", () => {
    const firma = calcularFirma(secreto, cuerpo);
    expect(firmaValida(secreto, cuerpo, firma)).toBe(true);
  });

  it("rechaza una firma incorrecta", () => {
    const firmaAjena = calcularFirma("otro-secreto", cuerpo);
    expect(firmaValida(secreto, cuerpo, firmaAjena)).toBe(false);
  });

  it("rechaza si el cuerpo cambió después de firmarlo (integridad)", () => {
    const firma = calcularFirma(secreto, cuerpo);
    const cuerpoAlterado = cuerpo.replace("1000", "1"); // alguien bajó el monto
    expect(firmaValida(secreto, cuerpoAlterado, firma)).toBe(false);
  });

  it("rechaza sin firma", () => {
    expect(firmaValida(secreto, cuerpo, null)).toBe(false);
  });

  it("rechaza sin secreto configurado", () => {
    const firma = calcularFirma(secreto, cuerpo);
    expect(firmaValida("", cuerpo, firma)).toBe(false);
  });

  it("no revienta con una firma de largo distinto o con caracteres no-hex", () => {
    expect(firmaValida(secreto, cuerpo, "corta")).toBe(false);
    expect(firmaValida(secreto, cuerpo, "no-es-hexadecimal-esto-zzzz")).toBe(false);
  });
});

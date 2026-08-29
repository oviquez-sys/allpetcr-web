import { describe, expect, it } from "vitest";
import { coincideAproximado, distanciaLevenshtein, normalizar } from "./busqueda";

describe("normalizar", () => {
  it("pasa a minúsculas y saca tildes", () => {
    expect(normalizar("Arnés Acolchado")).toBe("arnes acolchado");
    expect(normalizar("Peña")).toBe("pena");
  });

  it("recorta espacios de los extremos", () => {
    expect(normalizar("  Correa  ")).toBe("correa");
  });

  it("no revienta con null/undefined (defensivo: ya rompió una vez con un campo faltante de la API)", () => {
    expect(normalizar(null)).toBe("");
    expect(normalizar(undefined)).toBe("");
  });
});

describe("distanciaLevenshtein", () => {
  it("0 para textos iguales", () => {
    expect(distanciaLevenshtein("collar", "collar")).toBe(0);
  });

  it("cuenta una sustitución", () => {
    expect(distanciaLevenshtein("collar", "colear")).toBe(1);
  });

  it("cuenta una letra de más o de menos", () => {
    expect(distanciaLevenshtein("correa", "corea")).toBe(1);
    expect(distanciaLevenshtein("arnes", "arnes1")).toBe(1);
  });
});

describe("coincideAproximado", () => {
  it("coincidencia exacta (comportamiento de siempre)", () => {
    expect(coincideAproximado("Correa Retráctil 5m", "correa")).toBe(true);
  });

  it("término vacío coincide con todo", () => {
    expect(coincideAproximado("Cualquier cosa", "")).toBe(true);
    expect(coincideAproximado("Cualquier cosa", "   ")).toBe(true);
  });

  it("tolera un error de tipeo (el ejemplo del encargo: 'coyar' -> 'collar')", () => {
    expect(coincideAproximado("Collar Isabelino 30 cm", "coyar")).toBe(true);
  });

  it("tolera una letra de más o de menos", () => {
    expect(coincideAproximado("Arnés Chaleco con Correa", "corea")).toBe(true);
    expect(coincideAproximado("Rascador de Cartón Ovalado", "rascadorr")).toBe(true);
  });

  it("ignora acentos", () => {
    expect(coincideAproximado("Arnés Acolchado", "arnes")).toBe(true);
    expect(coincideAproximado("Rascador de Cartón", "carton")).toBe(true);
  });

  it("varias palabras: TODAS tienen que aparecer (AND, no OR)", () => {
    expect(coincideAproximado("Arnés Chaleco con Correa Talla M", "arnes gato")).toBe(false);
    expect(coincideAproximado("Arnés Chaleco con Correa Talla M", "arnes correa")).toBe(true);
  });

  it("no confunde palabras completamente distintas", () => {
    expect(coincideAproximado("Shampoo para Perro", "gato")).toBe(false);
    expect(coincideAproximado("Pelota de Goma", "collar")).toBe(false);
  });

  it("texto faltante (undefined/null) no revienta, simplemente no coincide", () => {
    expect(coincideAproximado(undefined, "correa")).toBe(false);
    expect(coincideAproximado(null, "correa")).toBe(false);
  });

  it("palabras muy cortas no activan el difuso (evita falsos positivos)", () => {
    // "de" (2 letras) no debería "encontrar" cualquier palabra de 2-3 letras
    // por variación de 0 tolerada; sigue exigiendo coincidencia real.
    expect(coincideAproximado("Cama para Perro", "de")).toBe(false);
  });
});

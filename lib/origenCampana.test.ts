import { describe, expect, it } from "vitest";
import { origenDesdeUrl } from "./origenCampana";

describe("origenDesdeUrl", () => {
  it("arma el origen del enlace de la biografía de Instagram", () => {
    expect(origenDesdeUrl("?utm_source=instagram&utm_medium=social&utm_campaign=lanzamiento_20261019&utm_content=bio"))
      .toBe("instagram / lanzamiento_20261019 / bio");
  });

  it("sin utm_source no marca nada: no toda visita es de una campaña", () => {
    expect(origenDesdeUrl("?utm_campaign=algo")).toBeNull();
    expect(origenDesdeUrl("")).toBeNull();
    expect(origenDesdeUrl("?q=arena")).toBeNull();
  });

  it("descarta valores con caracteres raros en vez de copiarlos al mensaje", () => {
    expect(origenDesdeUrl("?utm_source=insta<script>")).toBeNull();
    expect(origenDesdeUrl("?utm_source=instagram&utm_campaign=hola mundo")).toBe("instagram");
  });

  it("sin UTM usa el código corto ?o= de los enlaces del plan (24/11/2026)", () => {
    expect(origenDesdeUrl("?o=ig-anuncio3")).toBe("ig-anuncio3");
    expect(origenDesdeUrl("?o=whatsapp-catalogo")).toBe("whatsapp-catalogo");
    expect(origenDesdeUrl("?o=mal<script>")).toBeNull();
  });

  it("si vienen los dos, manda la UTM", () => {
    expect(origenDesdeUrl("?utm_source=google&utm_campaign=novedad&o=qr-caja")).toBe("google / novedad");
  });
});

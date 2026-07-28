import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import categorias from "@/data/categorias.json";

/**
 * Esta prueba existe por un defecto real: la barra de navegación enlazaba a
 * /carrito, que no existía, y el pie a /catalogo?c=alimento, categoría que
 * tampoco existe — el filtro se ignoraba en silencio. Ninguna de las dos cosas
 * se detectó hasta la auditoría.
 *
 * Un enlace roto en un componente presente en TODAS las páginas es un defecto
 * caro y trivialmente detectable. Esta prueba lo detecta.
 */

const raiz = join(__dirname, "..");
const RUTAS_VALIDAS = [
  "/", "/catalogo", "/contacto", "/sobre-nosotros", "/carrito", "/checkout",
];

function enlacesDe(archivo: string): string[] {
  const src = readFileSync(join(raiz, archivo), "utf8");
  return [...src.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]);
}

function rutaBase(href: string): string {
  return href.split("?")[0];
}

describe("enlaces de navegación", () => {
  const archivos = ["components/NavBar.tsx", "components/Footer.tsx"];

  for (const archivo of archivos) {
    it(`${archivo}: todas las rutas existen`, () => {
      for (const href of enlacesDe(archivo)) {
        const base = rutaBase(href);
        const esDinamica = base.startsWith("/producto/");
        expect(
          RUTAS_VALIDAS.includes(base) || esDinamica,
          `${archivo} enlaza a "${href}", que no corresponde a ninguna ruta`,
        ).toBe(true);
      }
    });

    it(`${archivo}: los filtros ?c= apuntan a categorías que existen`, () => {
      const nombres = categorias.map((c) => c.nombre.toLowerCase());
      for (const href of enlacesDe(archivo)) {
        const query = href.split("?")[1];
        if (!query) continue;
        const c = new URLSearchParams(query).get("c");
        if (!c) continue;
        expect(
          nombres.includes(c.toLowerCase()),
          `${archivo} filtra por "${c}", que no existe en categorias.json ` +
            `(disponibles: ${nombres.join(", ")})`,
        ).toBe(true);
      }
    });
  }

  it("cada ruta enlazada tiene su archivo de página", () => {
    for (const ruta of RUTAS_VALIDAS) {
      const archivo = ruta === "/" ? "app/page.tsx" : `app${ruta}/page.tsx`;
      expect(existsSync(join(raiz, archivo)), `Falta ${archivo}`).toBe(true);
    }
  });

  it("existe la página 404 personalizada", () => {
    expect(existsSync(join(raiz, "app/not-found.tsx"))).toBe(true);
  });
});

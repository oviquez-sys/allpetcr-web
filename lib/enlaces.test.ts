import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import categorias from "@/data/categorias.json";
import productos from "@/data/productos.json";
import { construirNavegacion, ESPECIES, esParaEspecie } from "./navegacion";
const navegacion = construirNavegacion(categorias, productos);

/**
 * Esta prueba existe por un defecto real: la barra de navegación enlazaba a
 * /carrito, que no existía, y el pie a /catalogo?c=alimento, categoría que
 * tampoco existe — el filtro se ignoraba en silencio.
 *
 * ── POR QUÉ LA VERSIÓN ANTERIOR NO SERVÍA
 * Extraía los enlaces con una expresión regular sobre `href="..."`. Pero la
 * navegación estaba declarada en un array como `{ href: "/catalogo?c=perros" }`
 * —con dos puntos, no con igual— así que la regex NUNCA los veía. La prueba
 * pasaba en verde mientras los ocho enlaces principales del sitio filtraban
 * por categorías inexistentes.
 *
 * Una prueba que no puede fallar es peor que ninguna: da seguridad falsa.
 *
 * Ahora se validan los datos de navegación importándolos de verdad, no
 * rascando el texto del archivo. Si un enlace apunta a una categoría que no
 * existe, esto falla.
 */

const raiz = join(__dirname, "..");
const RUTAS_VALIDAS = [
  "/", "/catalogo", "/contacto", "/sobre-nosotros", "/carrito", "/checkout",
  "/recompra", "/envios",
];

const idsValidos = new Set(categorias.map((c) => c.id));

/** Ids que tienen al menos un producto asignado DIRECTAMENTE. */
const idsConProductoPropio = new Set(
  productos.map((p) => p.categoria_id).filter((x): x is number => x !== null),
);

/**
 * Ids que muestran al menos un producto, contando los de sus subcategorías.
 *
 * Desde el 02/08/2026 el catálogo es un árbol de dos niveles: los productos
 * cuelgan de la subcategoría ("Pelotas"), nunca de la raíz ("Juguetes"). Una
 * raíz con 75 productos tiene CERO productos propios.
 *
 * La versión anterior de esta prueba miraba solo la asignación directa y por
 * eso marcó "Juguetes" como sección vacía cuando es la más grande del sitio.
 * El enlace siempre funcionó —`idsConHijos` en CatalogoCliente expande la
 * raíz a sus hijas—; lo que estaba mal era el modelo que usaba la prueba.
 *
 * Se corrige recorriendo el árbol, no relajando la exigencia: sigue fallando
 * si una sección no muestra ni un solo producto, que es lo que importa.
 */
const idsQueMuestranAlgo = new Set<number>(idsConProductoPropio);
for (const c of categorias) {
  if (!idsConProductoPropio.has(c.id)) continue;
  let padre = c.padre_id;
  const vistos = new Set<number>(); // corta un ciclo si alguien lo crea en el ERP
  while (padre !== null && !vistos.has(padre)) {
    vistos.add(padre);
    idsQueMuestranAlgo.add(padre);
    padre = categorias.find((x) => x.id === padre)?.padre_id ?? null;
  }
}

/** Todos los href de la navegación: secciones, subgrupos y destacadas. */
function todosLosEnlaces(): { href: string; origen: string }[] {
  const out: { href: string; origen: string }[] = [];
  for (const s of navegacion) {
    out.push({ href: s.href, origen: `sección "${s.label}"` });
    for (const g of s.grupos) {
      out.push({ href: g.href, origen: `"${s.label}" → "${g.label}"` });
    }
  }
  return out;
}

describe("navegación", () => {
  it("todas las rutas base existen", () => {
    for (const { href, origen } of todosLosEnlaces()) {
      const base = href.split("?")[0];
      expect(RUTAS_VALIDAS.includes(base), `${origen} enlaza a "${href}"`).toBe(true);
    }
  });

  it("ningún enlace de navegación queda sin filtro", () => {
    // Un enlace que apunta a /catalogo pelado es el síntoma exacto del
    // defecto original: parece que filtra y no filtra.
    //
    // Antes esta prueba exigía `?cats=`. Desde que el menú es mascota-primero
    // (01/09/2026) el enlace de la sección es `?para=perro`, sin categoría, y
    // está bien que lo sea: "Perro" es la puerta de la tienda y tiene que
    // mostrar todo lo de perro. Lo que sigue siendo un defecto es un enlace
    // SIN NINGÚN filtro, y eso es lo que se verifica.
    for (const { href, origen } of todosLosEnlaces()) {
      const query = new URLSearchParams(href.split("?")[1] ?? "");
      const filtra = query.has("cats") || query.has("para");
      expect(
        filtra,
        `${origen} apunta a "${href}" sin filtro — mostraría el catálogo completo`,
      ).toBe(true);
    }
  });

  it("ningún enlace de especie sola queda vacío", () => {
    // La puerta de una especie tiene que llevar a productos de esa especie.
    // Las dos pruebas de más abajo se saltan los enlaces sin `cats`, así que
    // sin esta un "Gato" sin un solo producto de gato pasaría en verde.
    for (const { href, origen } of todosLosEnlaces()) {
      const query = new URLSearchParams(href.split("?")[1] ?? "");
      if (query.has("cats")) continue;
      const para = query.get("para");
      if (!para) continue;

      const especie = ESPECIES.find((e) => e.clave === para);
      expect(especie, `${origen}: "${para}" no es una especie conocida`).toBeDefined();
      const cuantos = productos.filter((p) =>
        esParaEspecie(p.mascota ?? "", especie!.clave),
      ).length;
      expect(cuantos, `${origen} no muestra ni un producto`).toBeGreaterThan(0);
    }
  });

  it("los ids de ?cats= existen en categorias.json", () => {
    for (const { href, origen } of todosLosEnlaces()) {
      const query = href.split("?")[1];
      if (!query) continue;
      const cats = new URLSearchParams(query).get("cats");
      if (!cats) continue;
      for (const raw of cats.split(",")) {
        const id = Number.parseInt(raw, 10);
        expect(Number.isInteger(id), `${origen}: "${raw}" no es un id`).toBe(true);
        expect(idsValidos.has(id), `${origen}: la categoría ${id} no existe`).toBe(true);
      }
    }
  });

  it("ningún enlace lleva a un resultado vacío", () => {
    // Un filtro que devuelve cero productos siempre es un error de diseño,
    // no una opción legítima que ofrecerle a alguien.
    //
    // Cobra más importancia desde que el ERP publica solo lo que hay en
    // existencia: una subcategoría entera puede vaciarse porque se vendió su
    // último artículo, y entonces el enlace del menú que apuntaba ahí queda
    // llevando a una página vacía. Esta prueba es lo que hace que eso se note
    // al construir el sitio y no cuando lo descubre un cliente.
    for (const { href, origen } of todosLosEnlaces()) {
      const cats = new URLSearchParams(href.split("?")[1] ?? "").get("cats");
      if (!cats) continue;
      const ids = cats.split(",").map((x) => Number.parseInt(x, 10));
      const hayAlguno = ids.some((id) => idsQueMuestranAlgo.has(id));
      expect(hayAlguno, `${origen} no tiene ni un producto`).toBe(true);
    }
  });

  it("ningún enlace de categoría + especie queda vacío", () => {
    // Desde el 01/09/2026 el menú cruza mascota y categoría al revés que
    // antes —"Gato › Juguetes" en vez de "Juguetes › Para gatos"— pero el
    // enlace que se genera es el mismo y el riesgo también: la prueba de
    // arriba mira solo `cats`, así que un "Gato › Juguetes" sin un solo
    // juguete de gato pasaría en verde, porque el id de Juguetes sí tiene
    // productos.
    //
    // Acá se evalúan las DOS condiciones juntas, que es lo que ve el cliente
    // cuando hace clic. Sin esto, aplanar el catálogo habría cambiado veinte
    // enlaces verificados por ocho sin verificar.
    for (const { href, origen } of todosLosEnlaces()) {
      const query = new URLSearchParams(href.split("?")[1] ?? "");
      const cats = query.get("cats");
      const para = query.get("para");
      if (!cats || !para) continue;

      const ids = new Set(
        cats.split(",").flatMap((x) => {
          const id = Number.parseInt(x, 10);
          const hijos = categorias.filter((c) => c.padre_id === id).map((c) => c.id);
          return [id, ...hijos];
        }),
      );
      const especie = ESPECIES.find((e) => e.clave === para);
      expect(especie, `${origen}: "${para}" no es una especie conocida`).toBeDefined();

      const cuantos = productos.filter(
        (p) =>
          p.categoria_id !== null &&
          ids.has(p.categoria_id) &&
          esParaEspecie(p.mascota ?? "", especie!.clave),
      ).length;
      expect(cuantos, `${origen} no muestra ni un producto`).toBeGreaterThan(0);
    }
  });

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

describe("enlaces escritos a mano en los componentes", () => {
  // Complementa lo anterior: cubre los href literales que no salen de
  // lib/navegacion.ts (contacto, carrito, sobre-nosotros…).
  const archivos = ["components/NavBar.tsx", "components/Footer.tsx", "app/page.tsx"];

  for (const archivo of archivos) {
    it(`${archivo}: rutas literales válidas`, () => {
      const src = readFileSync(join(raiz, archivo), "utf8");
      const hrefs = [...src.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]);
      for (const href of hrefs) {
        const base = href.split("?")[0];
        const esDinamica = base.startsWith("/producto/");
        expect(
          RUTAS_VALIDAS.includes(base) || esDinamica,
          `${archivo} enlaza a "${href}", que no corresponde a ninguna ruta`,
        ).toBe(true);
      }
    });

    it(`${archivo}: no quedan filtros ?c= por nombre inexistente`, () => {
      const src = readFileSync(join(raiz, archivo), "utf8");
      const nombres = categorias.map((c) => c.nombre.toLowerCase());
      // Ahora sí busca ambas formas: href="..." y href: "..."
      const hrefs = [...src.matchAll(/href[=:]\s*"(\/[^"]*)"/g)].map((m) => m[1]);
      for (const href of hrefs) {
        const c = new URLSearchParams(href.split("?")[1] ?? "").get("c");
        if (!c) continue;
        expect(
          nombres.includes(c.toLowerCase()),
          `${archivo} filtra por "${c}", que no existe en categorias.json`,
        ).toBe(true);
      }
    });
  }
});

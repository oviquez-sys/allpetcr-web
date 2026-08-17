/**
 * Guardián previo a publicar.
 *
 * Falla el build si el sitio todavía tiene datos de relleno. Existe porque el
 * error más caro de este proyecto no fue técnico: fue publicar una cédula
 * jurídica inventada (3-101-999999) y ocho productos ficticios con precios que
 * nadie iba a respetar en el mostrador. Un aviso en un README no lo evita; un
 * build que se detiene, sí.
 *
 * Solo bloquea en producción (`npm run build`). En desarrollo avisa y sigue,
 * para no estorbar mientras se trabaja.
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const rojo = (t) => `\x1b[31m${t}\x1b[0m`;
const amarillo = (t) => `\x1b[33m${t}\x1b[0m`;
const verde = (t) => `\x1b[32m${t}\x1b[0m`;

const problemas = [];

// 1. Datos del negocio sin completar.
const negocio = readFileSync(join(raiz, "lib/negocio.ts"), "utf8");
const pendientes = [...negocio.matchAll(/^\s*(\w+):\s*PENDIENTE/gm)].map((m) => m[1]);
if (pendientes.length > 0) {
  problemas.push(
    `Datos del negocio sin completar en lib/negocio.ts: ${pendientes.join(", ")}`,
  );
}

// 2. Catálogo con productos de demostración.
const productos = JSON.parse(readFileSync(join(raiz, "data/productos.json"), "utf8"));
const demo = productos.filter((p) => /^DEMO-/i.test(p.sku));
if (demo.length > 0) {
  problemas.push(
    `El catálogo tiene ${demo.length} producto(s) de demostración (SKU DEMO-*). ` +
      "Corré: python manage.py exportar_catalogo_web  en el ERP.",
  );
}
if (productos.length === 0) {
  problemas.push("El catálogo está vacío.");
}

// 3. Precios inválidos: un precio en 0 publicado es un error de negocio.
const sinPrecio = productos.filter((p) => !(p.precio_venta > 0));
if (sinPrecio.length > 0) {
  problemas.push(
    `${sinPrecio.length} producto(s) con precio 0 o inválido: ` +
      sinPrecio.slice(0, 5).map((p) => p.sku).join(", "),
  );
}

// 4. Fotos que la base dice tener pero que no están en public/.
//    Desde el 02/08/2026 el sitio publica fotos reales: el exportador del ERP
//    las copia a public/productos/. Si el JSON se actualiza pero la copia no
//    llega —un despliegue a medias, un archivo que no entró al commit— cada
//    tarjeta muestra un ícono roto y nadie se entera hasta que lo ve un
//    cliente. Se verifica acá porque es barato y el fallo es silencioso.
const rotas = productos
  .filter((p) => p.imagen)
  .filter((p) => !existsSync(join(raiz, "public", p.imagen.replace(/^\//, ""))));
if (rotas.length > 0) {
  problemas.push(
    `${rotas.length} producto(s) apuntan a una foto que no está en public/: ` +
      rotas.slice(0, 5).map((p) => `${p.sku} → ${p.imagen}`).join(", ") +
      ". Corré: python manage.py exportar_catalogo_web  en el ERP.",
  );
}

const enProduccion = process.env.NODE_ENV === "production" || process.argv.includes("--estricto");

if (problemas.length === 0) {
  console.log(verde("✓ Datos del sitio verificados: listo para publicar."));
  process.exit(0);
}

const encabezado = enProduccion
  ? rojo("\n✗ No se puede publicar: faltan datos reales\n")
  : amarillo("\n⚠ Faltan datos reales (no bloquea en desarrollo)\n");
console.log(encabezado);
for (const p of problemas) console.log(`  · ${p}`);
console.log("");

process.exit(enProduccion ? 1 : 0);

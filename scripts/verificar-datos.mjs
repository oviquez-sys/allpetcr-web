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
import nextEnv from "@next/env";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const { loadEnvConfig } = nextEnv;
loadEnvConfig(raiz);
const rojo = (t) => `\x1b[31m${t}\x1b[0m`;
const amarillo = (t) => `\x1b[33m${t}\x1b[0m`;
const verde = (t) => `\x1b[32m${t}\x1b[0m`;

const problemas = [];

// 0. Configuración del servidor y del dominio. Los valores se validan sin
// imprimir secretos ni incorporarlos al informe.
const entornoEstricto = process.env.NODE_ENV === "production" || process.argv.includes("--estricto");
if (entornoEstricto && (!process.env.ERP_API_URL || !process.env.ERP_API_TOKEN)) {
  problemas.push("Producción requiere ERP_API_URL y ERP_API_TOKEN.");
}

for (const nombre of ["ERP_API_URL", "PRODUCTOS_CDN_URL", "NEXT_PUBLIC_SITE_URL"]) {
  const valor = process.env[nombre];
  if (!valor) continue;
  try {
    const url = new URL(valor);
    const esLocal = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    if (entornoEstricto && url.protocol !== "https:" && !esLocal) {
      problemas.push(`${nombre} debe usar HTTPS fuera del entorno local.`);
    }
  } catch {
    problemas.push(`${nombre} no contiene una URL válida.`);
  }
}

const sitioUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://allpetcr-web-6h6iv.ondigitalocean.app";
const indexable = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true";
if (indexable) {
  try {
    const host = new URL(sitioUrl).hostname.toLowerCase();
    if (host !== "allpetcr.com" && host !== "www.allpetcr.com") {
      problemas.push("Solo el dominio oficial puede compilarse con NEXT_PUBLIC_SITE_INDEXABLE=true.");
    }
  } catch {
    // El error de URL ya se agregó arriba.
  }
}

// 1. Datos del negocio sin completar.
const negocio = readFileSync(join(raiz, "lib/negocio.ts"), "utf8");
const pendientes = [...negocio.matchAll(/^\s*(\w+):\s*PENDIENTE/gm)].map((m) => m[1]);
if (pendientes.length > 0) {
  problemas.push(
    `Datos del negocio sin completar en lib/negocio.ts: ${pendientes.join(", ")}`,
  );
}

// Valores que ya se usaron como relleno y que nunca deben volver a pasar el
// guardián como si fueran una cédula válida. La validación de formato no basta:
// una cédula ficticia puede tener exactamente el mismo formato que una real.
const cedulasFicticiasConocidas = ["3-101-999999", "3-102-999999"];
for (const cedula of cedulasFicticiasConocidas) {
  if (negocio.includes(`cedulaJuridica: "${cedula}"`)) {
    problemas.push(
      `La cédula jurídica sigue siendo un valor ficticio conocido (${cedula}).`,
    );
  }
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

const enProduccion = entornoEstricto;

if (problemas.length === 0) {
  console.log(verde("✓ Datos y configuración base verificados para compilar."));
  process.exit(0);
}

const encabezado = enProduccion
  ? rojo("\n✗ No se puede publicar: faltan datos reales\n")
  : amarillo("\n⚠ Faltan datos reales (no bloquea en desarrollo)\n");
console.log(encabezado);
for (const p of problemas) console.log(`  · ${p}`);
console.log("");

process.exit(enProduccion ? 1 : 0);

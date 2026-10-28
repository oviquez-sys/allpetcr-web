/**
 * NOMBRES EN MAYÚSCULAS → NOMBRES LEGIBLES (27/10/2026)
 *
 * Los productos que entran desde la factura del proveedor llegan al ERP tal
 * como los escribe la factura: "ADORNO AMO LEYENDO CON PERRO". En el
 * catálogo eso se lee como un grito y como algo sin terminar, y además esos
 * productos —los más nuevos— salían de primeros.
 *
 * Solo se toca un nombre que viene ENTERO en mayúsculas. Si el nombre ya
 * tiene alguna minúscula, alguien lo escribió a mano y se respeta tal cual.
 * No se cambia ninguna palabra: solo mayúsculas y minúsculas. El ERP conserva
 * el nombre original (el sitio no le escribe nada).
 *
 * Reglas:
 *  - Mayúscula inicial y el resto en minúscula ("Adorno amo leyendo con perro").
 *  - Tallas y siglas comunes se quedan en mayúscula (XL, LED, USB…).
 *  - Si la marca del ERP aparece en el nombre, se escribe como la marca
 *    (y si la marca también viene en mayúsculas, con inicial mayúscula en
 *    cada palabra: "ROYAL CANIN" → "Royal Canin").
 *  - Las unidades pegadas a un número van en minúscula ("2KG" → "2kg").
 */

const SIGLAS = new Set([
  "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL",
  "LED", "USB", "PVC", "ABS", "EVA", "TPR", "UV", "CR", "AA", "AAA",
]);

function tieneLetras(texto: string): boolean {
  return /\p{L}/u.test(texto);
}

function todoEnMayusculas(texto: string): boolean {
  return tieneLetras(texto) && texto === texto.toLocaleUpperCase("es") && texto !== texto.toLocaleLowerCase("es");
}

function capitalizar(palabra: string): string {
  return palabra.charAt(0).toLocaleUpperCase("es") + palabra.slice(1);
}

/** "ROYAL CANIN" → "Royal Canin"; "Hill's" se queda como está. */
function marcaLegible(marca: string): string {
  if (!todoEnMayusculas(marca)) return marca;
  return marca
    .toLocaleLowerCase("es")
    .split(/(\s+|-)/)
    .map((parte) => (/^\s+$|^-$/.test(parte) ? parte : capitalizar(parte)))
    .join("");
}

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function nombreLegible(nombre: string, marca?: string): string {
  if (!todoEnMayusculas(nombre)) return nombre;

  let resultado = nombre
    .toLocaleLowerCase("es")
    // Separado por espacios, guiones, barras y paréntesis, para que una
    // talla entre paréntesis "(XL)" también se reconozca.
    .split(/([\s\-/()+,.]+)/)
    .map((parte) => {
      const mayus = parte.toLocaleUpperCase("es");
      if (SIGLAS.has(mayus)) return mayus;
      return parte;
    })
    .join("");

  // Primera letra del nombre en mayúscula (aunque empiece con número o signo).
  resultado = resultado.replace(/\p{L}/u, (letra) => letra.toLocaleUpperCase("es"));

  const marcaLimpia = (marca ?? "").trim();
  if (marcaLimpia.length >= 2) {
    const patron = new RegExp(`(^|[^\\p{L}])(${escaparRegex(marcaLimpia)})(?=$|[^\\p{L}])`, "iu");
    resultado = resultado.replace(patron, (_t, antes: string) => `${antes}${marcaLegible(marcaLimpia)}`);
  }
  return resultado;
}

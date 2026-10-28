import { describe, expect, it } from "vitest";
import { especieDe, estaRetirado, motivoConsulta, prepararParaPublicar, puntajeFicha, recomendable } from "./publicacion";
import { calcularTotalCheckout } from "./checkoutServidor";
import type { Producto } from "./types";

const base: Producto = {
  sku: "X", nombre: "Producto", categoria_id: 1, presentacion: "", descripcion: "",
  mascota: "", imagen: "", precio_venta: 1000, disponible: true,
};
const p = (cambios: Partial<Producto>): Producto => ({ ...base, ...cambios });

// Casos reales de la auditoría del 16/10/2026, con el texto que tenían publicado.
const collar8Meses = p({ sku: "87258", nombre: "Collar antipulgas 8 meses" });
const collarGato = p({ sku: "87255", nombre: "Collar antipulgas gato" });
const collarPerro = p({ sku: "87256", nombre: "Collar antipulgas perro" });
const juguete = p({
  sku: "147295", nombre: "Juguete",
  descripcion: "Juguete para mascota. Producto sin ficha fotográfica en el catálogo del proveedor; revisar en tienda antes de publicar.",
});
const adidas = p({ sku: "85325", nombre: "Camiseta Adidas", descripcion: "Ropa Adidas Tallas M y L" });
const chaleco = p({ sku: "00004", nombre: "Camiseta chaleco con argolla", descripcion: "Tallas del proveedor: S 25 cm, M 30 cm, L 35 cm, XL 40 cm" });
const buzo = p({ sku: "85910", nombre: "Buzo con capucha outdoor", descripcion: "Buzo con capucha y estampado outdoor. Tres colores." });
const arnesS = p({ sku: "81261", nombre: "Arnés ajustable degradado talla S" });

describe("fichas retiradas (F4-07)", () => {
  it("retira el juguete con nota interna y por su SKU", () => {
    expect(estaRetirado(juguete)).toBe(true);
    expect(estaRetirado({ ...juguete, descripcion: "Juguete para mascota." })).toBe(true);
  });

  it("detecta notas internas en cualquier ficha", () => {
    expect(estaRetirado(p({ sku: "1", nombre: "Pelota", descripcion: "FOTO PENDIENTE" }))).toBe(true);
    expect(estaRetirado(p({ sku: "2", nombre: "Pelota", descripcion: "Pelota de goma, 6 cm." }))).toBe(false);
  });

  it("no llega al catálogo ni al checkout", () => {
    const publicados = prepararParaPublicar([juguete, arnesS]);
    expect(publicados.map((x) => x.sku)).toEqual(["81261"]);
    const r = calcularTotalCheckout([{ sku: "147295", cantidad: 1 }], publicados);
    expect(r.items).toHaveLength(0);
    expect(r.problemas).toHaveLength(1);
  });
});

describe("antiparasitarios sin información (F4-01)", () => {
  it("los tres collares quedan solo con consulta", () => {
    for (const c of [collar8Meses, collarGato, collarPerro]) expect(motivoConsulta(c)).toBe("salud");
  });

  it("se habilitan solos cuando el ERP trae la información de la etiqueta", () => {
    const documentado = {
      ...collarPerro,
      descripcion: "Principio activo: (según etiqueta). Modo de uso: (según etiqueta). Advertencias: (según etiqueta).",
    };
    expect(motivoConsulta(documentado)).toBeNull();
    expect(motivoConsulta({ ...collarPerro, descripcion: "Modo de uso: colocar en el cuello." })).toBe("salud");
  });

  it("el checkout del servidor rechaza pedirlos aunque estén en un carrito viejo", () => {
    const publicados = prepararParaPublicar([collarGato]);
    const r = calcularTotalCheckout([{ sku: "87255", cantidad: 1 }], publicados);
    expect(r.items).toHaveLength(0);
    expect(r.problemas[0]).toMatch(/asesoría/);
  });
});

describe("ropa sin talla elegible (F4-05)", () => {
  it("camiseta con varias tallas, chaleco con tabla y buzo sin talla: solo con consulta", () => {
    expect(motivoConsulta(adidas)).toBe("talla");
    expect(motivoConsulta(chaleco)).toBe("talla");
    expect(motivoConsulta(buzo)).toBe("talla");
  });

  it("una prenda con una sola talla se puede pedir", () => {
    expect(motivoConsulta(p({ nombre: "Camiseta Adidas talla M" }))).toBeNull();
  });

  it("no toca productos de paseo: el arnés talla S sigue con carrito", () => {
    expect(motivoConsulta(arnesS)).toBeNull();
  });
});

describe("recomendaciones por especie (F4-02)", () => {
  const conConsulta = (x: Producto) => prepararParaPublicar([x])[0];

  it("desde el collar de perro no se recomienda el de gato, ni al revés", () => {
    expect(recomendable(conConsulta(collarPerro), conConsulta(collarGato))).toBe(false);
    expect(recomendable(conConsulta(collarGato), conConsulta(collarPerro))).toBe(false);
  });

  it("en salud no se recomienda un producto de especie sin identificar", () => {
    expect(especieDe(collar8Meses)).toBe("desconocida");
    expect(recomendable(conConsulta(collarPerro), conConsulta(collar8Meses))).toBe(false);
  });

  it("fuera de salud, un producto para ambos sí se recomienda", () => {
    const pelotaPerro = p({ sku: "a", nombre: "Pelota", mascota: "Perro" });
    const pelotaAmbos = p({ sku: "b", nombre: "Pelota", mascota: "Perro y gato" });
    const ratonGato = p({ sku: "c", nombre: "Ratón", mascota: "Gato" });
    expect(recomendable(pelotaPerro, pelotaAmbos)).toBe(true);
    expect(recomendable(pelotaPerro, ratonGato)).toBe(false);
  });
});

describe("primera impresión del catálogo (27/10/2026)", () => {
  it("publica en minúscula legible un nombre que llegó en MAYÚSCULAS de factura", () => {
    const [publicado] = prepararParaPublicar([p({ nombre: "ADORNO AMO LEYENDO CON PERRO" })]);
    expect(publicado.nombre).toBe("Adorno amo leyendo con perro");
  });

  it("deja igual un nombre que ya está bien escrito", () => {
    const original = p({ nombre: "Pelota KONG Classic" });
    expect(prepararParaPublicar([original])[0]).toBe(original);
  });

  it("pone las fichas completas antes que las que faltan terminar", () => {
    const completa = p({ imagen: "/a.jpg", descripcion: "Cama redonda acolchada de felpa, lavable, para perros pequeños.", marca: "Zee.Dog" });
    const sinNada = p({});
    const soloFoto = p({ imagen: "/b.jpg" });
    expect(puntajeFicha(completa)).toBeGreaterThan(puntajeFicha(soloFoto));
    expect(puntajeFicha(soloFoto)).toBeGreaterThan(puntajeFicha(sinNada));
  });
});

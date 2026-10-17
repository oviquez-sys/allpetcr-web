import { describe, expect, it } from "vitest";
import { crearTextoPedido } from "./pedidoWhatsApp";
import { formatoColones } from "./formato";

const resultado = {
  items: [{
    sku: "A1", nombre: "Juguete", presentacion: "Unidad", cantidad: 2,
    precioUnitario: 1500, subtotal: 3000,
  }],
  total: 3000,
  problemas: [],
};

describe("crearTextoPedido", () => {
  it("usa nombre, presentación, código y total verificados por el servidor", () => {
    const texto = crearTextoPedido(resultado, {
      nombre: " Ana ", telefono: "8888-7777", entrega: "retiro",
    });
    expect(texto).toContain(`2 × Juguete (Unidad) [Código: A1] — ${formatoColones(3000)}`);
    expect(texto).toContain(`*Subtotal de productos: ${formatoColones(3000)}*`);
    expect(texto).toContain("Nombre: Ana");
    expect(texto).toContain("Entrega: retiro en tienda");
  });

  it("incluye la dirección escrita aunque no exista pin en el mapa", () => {
    const texto = crearTextoPedido(resultado, {
      nombre: "Ana", telefono: "88887777", entrega: "coordinar",
      direccion: {
        provincia: "Heredia", canton: "Heredia", distrito: "Mercedes",
        senas: "Casa azul", lat: null, lng: null,
      },
    });
    expect(texto).toContain("Heredia, Heredia, Mercedes");
    expect(texto).toContain("Señas: Casa azul");
    expect(texto).not.toContain("google.com/maps");
  });

  it("incluye el código de La manada para que la tienda lo valide", () => {
    const texto = crearTextoPedido(resultado, {
      nombre: "Ana", telefono: "88887777", entrega: "retiro", codigoManada: " MANADA-123 ",
    });
    expect(texto).toContain("Código La manada: MANADA-123 (validar descuento de primera compra)");
    expect(texto).toContain("total final");
  });

  it("indica la campaña de origen solo si la hubo", () => {
    const con = crearTextoPedido(resultado, { nombre: "Ana", telefono: "88887777", entrega: "retiro", origen: "instagram / lanzamiento_20261019" });
    expect(con).toContain("Origen: instagram / lanzamiento_20261019");
    const sin = crearTextoPedido(resultado, { nombre: "Ana", telefono: "88887777", entrega: "retiro" });
    expect(sin).not.toContain("Origen:");
  });

  it("no menciona La manada si no se escribió un código", () => {
    const texto = crearTextoPedido(resultado, { nombre: "Ana", telefono: "88887777", entrega: "retiro", codigoManada: "  " });
    expect(texto).not.toContain("La manada");
  });
});

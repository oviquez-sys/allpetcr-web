import { describe, expect, it } from "vitest";
import { nombreResumido } from "./formato";

describe("nombreResumido", () => {
  it("accesorios: quita medida y forma y corta a 3 palabras (regla del 20/09/2026)", () => {
    expect(nombreResumido("Alfombrilla Refrescante Redonda 70 cm")).toBe("Alfombrilla Refrescante");
    expect(nombreResumido("Alimentador Lento tipo Tapete 20 cm")).toBe("Alimentador Lento");
    expect(nombreResumido("Arnés Acolchado Reflectivo Talla L")).toBe("Arnés Acolchado Reflectivo Talla L");
  });

  it("consumibles: con peso o volumen al final se muestra el nombre completo", () => {
    expect(nombreResumido("Balance Ad Cat Chicken 10 kg")).toBe("Balance Ad Cat Chicken 10 kg");
    expect(nombreResumido("Dukan AD Hum Carne/salsa 85 g")).toBe("Dukan AD Hum Carne/salsa 85 g");
    expect(nombreResumido("Gosbits Dog Objective Hypoallergenic 150 g")).toBe("Gosbits Dog Objective Hypoallergenic 150 g");
    expect(nombreResumido("Shampoo Avena 500 ml")).toBe("Shampoo Avena 500 ml");
  });

  it("dos sabores de la misma línea ya no quedan con el mismo nombre en la tarjeta", () => {
    expect(nombreResumido("Balance Ad Cat Chicken 10 kg")).not.toBe(nombreResumido("Balance Ad Cat Salmon 10 kg"));
  });
});

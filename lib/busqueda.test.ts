import { describe, expect, it } from "vitest";
import { coincideAproximado, coincideProducto, distanciaLevenshtein, normalizar, puntajeCoincidencia } from "./busqueda";

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

  describe("número pegado a la unidad de peso (28/09/2026, pedido de Oscar)", () => {
    // El ERP arma el nombre pegando marca + nombre de factura + presentación,
    // y la presentación siempre trae un espacio ("Balance Ad Cat Chicken" +
    // "10 kg"). "10kg" escrito de corrido no encontraba nada.
    it("'10kg' sin espacio encuentra el nombre real, que lo lleva con espacio", () => {
      expect(coincideAproximado("Balance Ad Cat Chicken 10 kg", "10kg")).toBe(true);
    });

    it("funciona con varias unidades de peso", () => {
      expect(coincideAproximado("Alimento Húmedo 85 g", "85g")).toBe(true);
      expect(coincideAproximado("PureVita Cordero 4 lb", "4lb")).toBe(true);
      expect(coincideAproximado("Shampoo Antipulgas 500 ml", "500ml")).toBe(true);
    });

    it("también al revés: '10 kg' con espacio encuentra un nombre que lo trae pegado", () => {
      expect(coincideAproximado("Bolsa 10kg Oferta", "10 kg")).toBe(true);
    });

    it("combinado con otra palabra, dentro del AND de siempre", () => {
      expect(coincideAproximado("Balance Ad Cat Chicken 10 kg", "balance 10kg")).toBe(true);
      expect(coincideAproximado("Balance Ad Cat Chicken 10 kg", "nutri 10kg")).toBe(false);
    });

    it("no confunde un número sin unidad con uno que sí la lleva", () => {
      expect(coincideAproximado("Correa Retráctil 5m", "5kg")).toBe(false);
    });
  });

  describe("equivalencias (auditoría F3-01, 16/10/2026)", () => {
    it("'comida cachorro' encuentra alimentos que dicen 'alimento' y 'puppy'", () => {
      expect(coincideAproximado("ProSeries Puppy Pollo 3 kg Alimento", "comida cachorro")).toBe(true);
      expect(coincideAproximado("Alimento completo para cachorros", "comida cachorro")).toBe(true);
    });

    it("no trae accesorios solo por mencionar cachorros", () => {
      expect(coincideAproximado("Cama acolchada para cachorro", "comida cachorro")).toBe(false);
    });

    it("las equivalencias cortas valen solo como palabra completa", () => {
      expect(coincideAproximado("Balance Ad Cat Chicken 10 kg", "alimento gato")).toBe(false);
      expect(coincideAproximado("Balance Alimento Ad Cat Chicken 10 kg", "alimento gato")).toBe(true);
      expect(coincideAproximado("Rascador catalogo", "gato")).toBe(false);
    });

    it("las búsquedas de siempre no cambian", () => {
      expect(coincideAproximado("Collar Isabelino 30 cm", "coyar")).toBe(true);
      expect(coincideAproximado("Shampoo para Perro", "gato")).toBe(false);
    });
  });
});

describe("coincideProducto (buscador inteligente, 20/10/2026)", () => {
  const puppy = {
    nombre: "Balance Puppy 2 kg",
    categorias: "Alimento Alimento seco",
    etiquetas: "comida alimento concentrado croqueta perro dog cachorro puppy junior",
  };
  it("comida para perro cachorro encuentra un Puppy", () => {
    expect(coincideProducto(puppy, "comida para perro cachorro")).toBe(true);
    expect(coincideProducto(puppy, "Cachorros")).toBe(true);
  });
  it("no confunde palabras que empiezan distinto", () => {
    expect(coincideProducto({ nombre: "Zapatos de malla" }, "pato")).toBe(false);
    expect(coincideProducto({ nombre: "Peluche gato", etiquetas: "gato cat felino" }, "pato")).toBe(false);
  });
  it("sigue tolerando errores en el nombre y pesos pegados", () => {
    expect(coincideProducto({ nombre: "Collar de nylon" }, "coyar")).toBe(true);
    expect(coincideProducto({ nombre: "Balance Adulto 10 kg" }, "balance 10kg")).toBe(true);
  });
  it("sin término no filtra", () => {
    expect(coincideProducto(puppy, "  de  ")).toBe(true);
  });
});

describe("buscador más inteligente (28/10/2026)", () => {
  const zee = { nombre: "Arnés H Gotham Zee.Dog talla M", categorias: "Paseo Arneses" };
  const sabanilla = { nombre: "Sabanillas para perros", categorias: "Higiene y aseo" };
  const pato = { nombre: "First Choice Perro Adulto Hipoalergénico Pato 11 kg", categorias: "Alimento" };
  const correa = { nombre: "Correa corta reflectiva", categorias: "Paseo Correas" };
  const arnesConCorrea = { nombre: "Arnés ajustable con correa", categorias: "Paseo Arneses" };

  it("encuentra la marca escrita pegada o separada", () => {
    expect(coincideProducto(zee, "zeedog")).toBe(true);
    expect(coincideProducto(zee, "zee dog")).toBe(true);
    expect(coincideProducto(zee, "zee.dog")).toBe(true);
  });

  it("entiende sinónimos de paseo, higiene y casa", () => {
    expect(coincideProducto(zee, "pechera")).toBe(true);
    expect(coincideProducto(sabanilla, "pads")).toBe(true);
    expect(coincideProducto(sabanilla, "pats")).toBe(true);
    expect(coincideProducto({ nombre: "Comedero cuadrado", categorias: "Platos" }, "tasa")).toBe(true);
  });

  it("no confunde 'pats' con 'pato'", () => {
    expect(coincideProducto(pato, "pats")).toBe(false);
  });

  it("un sinónimo no se busca en la descripción", () => {
    expect(coincideProducto({ nombre: "Pelota de goma", descripcion: "Ideal para jugar en casa" }, "casita")).toBe(false);
  });

  it("pone primero el producto que ES lo buscado", () => {
    expect(puntajeCoincidencia(correa, "correa")).toBeGreaterThan(puntajeCoincidencia(arnesConCorrea, "correa"));
  });
});

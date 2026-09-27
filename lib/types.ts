// Tipos del catálogo público, derivados del modelo real del ERP
// (allpetcr-erp/catalogo/models.py) pero NO idénticos a él a propósito.
//
// Qué se omite deliberadamente respecto del ERP, y por qué:
//   - costo_promedio / margen / markup: estructura de costos del negocio.
//     Nunca debe llegar a un sitio público.
//   - stock_actual exacto: se reduce a `disponible` (booleano). Publicar
//     "quedan 3" le revela a la competencia el volumen que manejás; al
//     cliente solo le importa si hay o no hay.
//
// El exportador que genera estos datos vive en el ERP:
//   catalogo/management/commands/exportar_catalogo_web.py

export interface Categoria {
  id: number;
  nombre: string;
  padre_id: number | null;
  /** Posición en los menús, decidida en el ERP (`catalogo.Categoria.orden`).
   *  Menor sale primero. Existe para que el sitio y el ERP muestren las
   *  categorías en el mismo orden sin que nadie mantenga dos listas. */
  orden: number;
}

export interface Producto {
  sku: string;
  nombre: string;
  /** Id de la subcategoría (hoja del árbol). Su padre es la categoría web. */
  categoria_id: number | null;
  presentacion: string;
  /** Texto de venta. Vive en el ERP: corregirlo no exige un despliegue. */
  descripcion: string;
  /** "Perro" | "Gato" | "Perro y gato" | "Peces" | "Tortugas" | "Otros".
   *  Vacío si el ERP todavía no lo tiene cargado. */
  mascota: string;
  imagen: string; // ruta pública, ej. "/productos/75564.jpeg". "" si no hay foto.
  precio_venta: number;
  /** Desde el 02/08/2026 el exportador solo publica lo que hay en existencia
   *  (`SOLO_EN_EXISTENCIA`), así que en la práctica siempre llega `true`.
   *  El campo se conserva porque el JSON es una foto del momento: entre dos
   *  exportaciones el stock cambia, y el sitio tiene que poder marcar un
   *  agotado —en el carrito, sobre todo— sin esperar a la siguiente. */
  disponible: boolean;
  /** Vitrina manual de la portada (26/09/2026, `catalogo.Producto.destacado_home`
   *  en el ERP). Opcionales: un JSON local viejo, exportado antes de este
   *  cambio, no los trae — `lib/vitrina.ts` los trata como "no destacado"
   *  cuando faltan, en vez de romper. */
  destacado_home?: boolean;
  /** Lugar dentro de "La vitrina" (menor sale primero). Solo importa junto
   *  con `destacado_home: true` — ver `lib/vitrina.ts`. */
  orden_home?: number | null;
  /** Marca y contenido neto (vienen del ERP). El peso es la base del precio
   *  por kilo del futuro comparador: ver `precioPorKg` en lib/alimentos.ts. */
  marca?: string;
  peso_valor?: number | string | null;
  peso_unidad?: string;
  /** Solo en el detalle de producto (GET /productos/<sku>/) y solo si el
   *  producto es un alimento con ficha publicada. Nunca en la lista. */
  ficha_alimento?: FichaAlimento | null;
}

/** Etiqueta del vocabulario controlado del ERP (catalogo/alimentos.py): la
 *  clave sirve para filtros e íconos; la etiqueta es el texto visible. */
export interface Etiqueta {
  clave: string;
  etiqueta: string;
}

export interface Nutriente extends Etiqueta {
  /** "mín." / "máx." / "" — tal como lo declara el fabricante. */
  calificador: string;
  valor: string;
  unidad: string;
}

export interface GuiaAlimentacion {
  titulo?: string;
  columnas?: string[];
  filas?: string[][];
  nota?: string;
}

/** Información oficial de una FÓRMULA de alimento (26/09/2026). La comparten
 *  todas las presentaciones de la misma fórmula. La investigó y verificó el
 *  ERP contra el fabricante; el sitio solo la muestra. Todo puede venir
 *  vacío: un campo vacío es un dato que el fabricante no publicó. */
export interface FichaAlimento {
  clave: string;
  marca: string;
  linea: string;
  nombre: string;
  especie: Etiqueta;
  tipo: Etiqueta;
  etapas: Etiqueta[];
  tamanos_raza: Etiqueta[];
  necesidades: Etiqueta[];
  proteina_principal: string;
  sabor: string;
  descripcion_corta: string;
  descripcion: string;
  beneficios: (Etiqueta & { texto: string })[];
  ingredientes: string;
  aditivos: string;
  analisis: Nutriente[];
  kcal_kg: number | null;
  kcal_unidad: number | null;
  unidad_kcal: string;
  guia_alimentacion: GuiaAlimentacion;
}

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
}

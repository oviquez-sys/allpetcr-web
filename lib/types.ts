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
}

export interface Producto {
  sku: string;
  nombre: string;
  categoria_id: number | null;
  presentacion: string;
  imagen: string; // hoy siempre vacía: las fotos se publicarán más adelante
  precio_venta: number;
  disponible: boolean;
}

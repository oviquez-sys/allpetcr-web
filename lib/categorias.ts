/**
 * Las cuatro categorías destacadas del inicio.
 *
 * CÓMO AGREGAR LAS FOTOS (cuando estén elegidas):
 * 1. Guardar el archivo en `public/categorias/` con el nombre indicado abajo.
 * 2. Descomentar la línea `imagen` de esa categoría.
 * 3. Si el sujeto no está centrado, ajustar `posicion` (ej. "70% 40%") para
 *    que el recorte en móvil no lo decapite.
 *
 * Mientras no haya foto, la tarjeta usa su tinte de la paleta. No se ve rota:
 * se ve intencional. Esa es la diferencia entre un sitio sin fotos todavía y
 * un sitio incompleto.
 */
export interface CategoriaDestacada {
  nombre: string;
  detalle: string;
  href: string;
  tinte: string;
  imagen?: string;
  posicion?: string;
}

export const categoriasDestacadas: CategoriaDestacada[] = [
  {
    nombre: "Perros",
    detalle: "Alimento, snacks, juguetes",
    href: "/catalogo?c=Perros",
    tinte: "bg-crema-300",
    // imagen: "/categorias/perros.jpg",
    posicion: "center 40%",
  },
  {
    nombre: "Gatos",
    detalle: "Arena, alimento, rascadores",
    href: "/catalogo?c=Gatos",
    tinte: "bg-dorado-100",
    // imagen: "/categorias/gatos.jpg",
    posicion: "center 40%",
  },
  {
    nombre: "Higiene",
    detalle: "Baño, cepillado, cuidado",
    href: "/catalogo?c=Higiene",
    tinte: "bg-navy-50",
    // imagen: "/categorias/higiene.jpg",
    posicion: "center",
  },
  {
    nombre: "Accesorios",
    detalle: "Collares, camas, transporte",
    href: "/catalogo?c=Accesorios",
    tinte: "bg-crema-400",
    // imagen: "/categorias/accesorios.jpg",
    posicion: "center",
  },
];

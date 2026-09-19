import CatalogoCliente from "@/components/CatalogoCliente";
import { ESPECIES, type ClaveEspecie } from "@/lib/navegacion";
import { getCategorias, getProductos } from "@/lib/data";

export const metadata = {
  // Sin sufijo manual: app/layout.tsx ya agrega " | AllPet" vía su template.
  // Escribirlo acá también duplicaba el sufijo en la pestaña y en resultados
  // de búsqueda ("Catálogo | AllPetcr.com | AllPet").
  title: "Catálogo",
  alternates: { canonical: "/catalogo" },
  description:
    "Juguetes, collares, camas e higiene para perros y gatos en Costa Rica. Buscá y filtrá por categoría y disponibilidad. Retiro en tienda sin costo.",
};

/**
 * Parámetros que entiende el catálogo:
 *   ?q=texto      búsqueda libre
 *   ?cats=3,7     ids de categoría — los generan los enlaces de navegación
 *   ?c=Nombre     nombre de categoría; se mantiene por compatibilidad con
 *                 enlaces ya compartidos o indexados
 *   ?para=perro   especie (perro | gato). Filtro cruzado: se combina con la
 *                 categoría en vez de reemplazarla — ver ESPECIES en
 *                 lib/navegacion.ts
 *
 * `cats` usa ids y no nombres a propósito: un id no se rompe si alguien
 * corrige una tilde en el ERP, y no obliga a que dos archivos escriban el
 * nombre exactamente igual. Ese desajuste es justo lo que tenía rota la
 * navegación (ver lib/navegacion.ts).
 *
 * Los ids que no existen se descartan aquí, en el servidor: así una URL
 * manipulada no llega al cliente como un filtro fantasma que no encuentra
 * nada sin explicar por qué.
 */
export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; c?: string; cats?: string; para?: string; orden?: string; disponibles?: string }>;
}) {
  const [productos, categorias, params] = await Promise.all([
    getProductos(),
    getCategorias(),
    searchParams,
  ]);

  const idsIniciales = (params.cats ?? "")
    .split(",")
    .map((x) => Number.parseInt(x.trim(), 10))
    .filter((n) => Number.isInteger(n) && categorias.some((c) => c.id === n));

  // Mismo criterio que con `cats`: un valor que no existe se descarta acá y
  // no llega al cliente como un filtro fantasma.
  const para = (params.para ?? "").toLowerCase();
  const especieInicial =
    (ESPECIES.find((e) => e.clave === para)?.clave as ClaveEspecie | undefined) ?? null;

  // `key` fuerza a React a MONTAR un CatalogoCliente nuevo cada vez que la
  // combinación de filtros de la URL cambia, en vez de reutilizar el que ya
  // estaba.
  //
  // POR QUÉ HACE FALTA: CatalogoCliente guarda categoría/especie/búsqueda en
  // useState, sembrado con estas props SOLO en el montaje. Si ya estás en
  // /catalogo?cats=1 y hacés clic en "Juguetes → Para gatos" (otro enlace a
  // la MISMA ruta, distinto querystring), Next.js no desmonta el árbol de
  // cliente: le pasa las props nuevas al componente que ya existe, y el
  // useState —que solo lee su valor inicial una vez— se queda con el filtro
  // viejo. La URL cambia, la lista no. Es el bug que reportó Oscar
  // ("hago clic y no pasa nada") el 04/08/2026.
  //
  // Con esta key, cada combinación de cats/para/c es una identidad de
  // componente distinta a ojos de React: cambiarla equivale a desmontar el
  // viejo y montar uno de cero con las props correctas ya en su useState
  // inicial. Se deja `q` fuera de la key a propósito: escribir en el
  // buscador no debe reiniciar el componente en cada tecla.
  const key = `${idsIniciales.join(",")}|${especieInicial ?? ""}|${params.c ?? ""}|${params.q ?? ""}`;

  return (
    <CatalogoCliente
      key={key}
      productos={productos}
      categorias={categorias}
      busquedaInicial={params.q ?? ""}
      categoriaInicial={params.c ?? ""}
      idsIniciales={idsIniciales}
      especieInicial={especieInicial}
      ordenInicial={params.orden === "precio-asc" || params.orden === "precio-desc" || params.orden === "nombre" ? params.orden : "relevancia"}
      disponiblesInicial={params.disponibles === "1"}
    />
  );
}

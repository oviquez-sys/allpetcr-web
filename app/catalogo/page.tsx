import CatalogoCliente from "@/components/CatalogoCliente";
import { getCategorias, getProductos } from "@/lib/data";

export const metadata = {
  title: "Catálogo | AllPet",
  description:
    "Alimento, accesorios e higiene para perros y gatos. Buscá y filtrá por categoría y disponibilidad.",
};

// En Next 16 los searchParams son asíncronos.
export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; c?: string }>;
}) {
  const [productos, categorias, params] = await Promise.all([
    getProductos(),
    getCategorias(),
    searchParams,
  ]);

  return (
    <CatalogoCliente
      productos={productos}
      categorias={categorias}
      busquedaInicial={params.q ?? ""}
      categoriaInicial={params.c ?? ""}
    />
  );
}

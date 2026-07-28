import Link from "next/link";
import TarjetaProducto from "@/components/TarjetaProducto";
import TarjetaCategoria from "@/components/TarjetaCategoria";
import { categoriasDestacadas } from "@/lib/categorias";
import { getCategorias, getProductos } from "@/lib/data";

// NOTA: el copy de esta página sigue siendo un borrador basado en el contexto
// de marca (tienda física en CR, tono directo, sin humo). Reemplazar con
// texto real antes de publicar.

const confianza = [
  { titulo: "Tienda física real", texto: "No somos un catálogo sin dirección. Podés venir y vernos." },
  { titulo: "Asesoría honesta", texto: "Recomendamos según lo que necesita tu mascota, no según el margen." },
  { titulo: "Retiro en tienda", texto: "Reservás en línea y lo recogés el mismo día, sin costo de envío." },
  { titulo: "Precios claros", texto: "El precio que ves es el que pagás. Sin cargos sorpresa." },
];

export default async function HomePage() {
  const [productos, categorias] = await Promise.all([getProductos(), getCategorias()]);
  const destacados = productos.slice(0, 4);
  const nombreCategoria = (id: number | null) =>
    categorias.find((c) => c.id === id)?.nombre ?? undefined;

  return (
    <>
      <section className="bg-crema-300">
        <div className="mx-auto max-w-contenido px-6 py-24 sm:py-28">
          <h1 className="font-display text-[42px] font-light leading-[1.06] tracking-tight text-navy-500 sm:text-[58px]">
            Todo para tu mascota,
            <br />
            elegido con criterio.
          </h1>
          <p className="mt-6 max-w-md text-[17px] font-light leading-relaxed text-navy-400">
            Alimento, accesorios e higiene para perros y gatos. Te decimos qué le
            sirve realmente, no qué nos conviene vender.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="rounded-full bg-navy-500 px-8 py-3.5 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600"
            >
              Ver catálogo
            </Link>
            <Link
              href="/contacto"
              className="rounded-full border border-crema-500 px-8 py-3.5 text-sm font-medium text-navy-400 transition-colors hover:border-navy-300 hover:text-navy-500"
            >
              Hablar con nosotros
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-contenido px-6 py-20">
        <div className="mb-9 flex items-end justify-between gap-5">
          <h2 className="font-display text-[33px] font-light text-navy-500">
            Comprar por categoría
          </h2>
          <Link
            href="/catalogo"
            className="border-b border-crema-400 pb-1 text-sm text-navy-400 transition-colors hover:text-navy-500"
          >
            Ver todas
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoriasDestacadas.map((c, i) => (
            <TarjetaCategoria
              key={c.nombre}
              nombre={c.nombre}
              detalle={c.detalle}
              href={c.href}
              imagen={c.imagen}
              posicion={c.posicion}
              tinte={c.tinte}
              prioridad={i < 2}
            />
          ))}
        </div>
      </section>

      {destacados.length > 0 && (
        <section className="mx-auto max-w-contenido px-6 pb-20">
          <div className="mb-9 flex items-end justify-between gap-5">
            <h2 className="font-display text-[33px] font-light text-navy-500">Del catálogo</h2>
            <Link
              href="/catalogo"
              className="border-b border-crema-400 pb-1 text-sm text-navy-400 transition-colors hover:text-navy-500"
            >
              Ver todo
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {destacados.map((p) => (
              <TarjetaProducto
                key={p.sku}
                producto={p}
                categoria={nombreCategoria(p.categoria_id)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="bg-crema-300">
        <div className="mx-auto grid max-w-contenido gap-9 px-6 py-14 text-center sm:grid-cols-2 lg:grid-cols-4">
          {confianza.map((c) => (
            <div key={c.titulo}>
              <h3 className="text-sm font-medium text-navy-500">{c.titulo}</h3>
              <p className="mt-1.5 text-xs font-light leading-relaxed text-navy-400">
                {c.texto}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

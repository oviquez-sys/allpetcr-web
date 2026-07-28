import Link from "next/link";
import { notFound } from "next/navigation";
import TarjetaProducto from "@/components/TarjetaProducto";
import { getCategorias, getProductoPorSku, getProductos } from "@/lib/data";
import { formatoColones, tinteDeSku } from "@/lib/formato";

// Genera una página estática por producto al compilar: son instantáneas al
// abrirse y las indexa Google.
export async function generateStaticParams() {
  const productos = await getProductos();
  return productos.map((p) => ({ sku: p.sku }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;
  const producto = await getProductoPorSku(decodeURIComponent(sku));
  if (!producto) return { title: "Producto no encontrado | AllPet" };
  return {
    title: `${producto.nombre} | AllPet`,
    description: `${producto.nombre}${producto.presentacion ? ` · ${producto.presentacion}` : ""} — disponible en AllPet Costa Rica.`,
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;
  const skuLimpio = decodeURIComponent(sku);

  const [producto, productos, categorias] = await Promise.all([
    getProductoPorSku(skuLimpio),
    getProductos(),
    getCategorias(),
  ]);

  if (!producto) notFound();

  const categoria = categorias.find((c) => c.id === producto.categoria_id);
  const relacionados = productos
    .filter((p) => p.sku !== producto.sku && p.categoria_id === producto.categoria_id)
    .slice(0, 4);

  return (
    <>
      <div className="mx-auto max-w-contenido px-6 pt-6">
        <nav aria-label="Ruta" className="text-xs text-navy-300">
          <Link href="/" className="hover:text-navy-500">Inicio</Link>
          <span className="px-2">/</span>
          <Link href="/catalogo" className="hover:text-navy-500">Catálogo</Link>
          {categoria && (
            <>
              <span className="px-2">/</span>
              <Link
                href={`/catalogo?c=${encodeURIComponent(categoria.nombre)}`}
                className="hover:text-navy-500"
              >
                {categoria.nombre}
              </Link>
            </>
          )}
        </nav>
      </div>

      <article className="mx-auto grid max-w-contenido gap-12 px-6 py-10 lg:grid-cols-2">
        <div
          className={`grid aspect-square place-items-center rounded-card ${tinteDeSku(producto.sku)}`}
        >
          {producto.imagen ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="h-full w-full rounded-card object-cover"
            />
          ) : (
            <span className="text-[11px] uppercase tracking-[0.09em] text-navy-200">
              Foto pendiente
            </span>
          )}
        </div>

        <div className="lg:py-4">
          {categoria && (
            <p className="text-[10.5px] uppercase tracking-[0.09em] text-dorado-700">
              {categoria.nombre}
            </p>
          )}
          <h1 className="mt-2 font-display text-[34px] font-light leading-tight text-navy-500">
            {producto.nombre}
          </h1>
          {producto.presentacion && (
            <p className="mt-2 text-sm text-navy-400">{producto.presentacion}</p>
          )}

          <p className="mt-7 text-[30px] font-medium text-navy-500">
            {formatoColones(producto.precio_venta)}
          </p>

          <p className="mt-3 text-sm">
            {producto.disponible ? (
              <span className="text-navy-400">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-dorado-500 align-middle" />
                Disponible en tienda
              </span>
            ) : (
              <span className="text-navy-300">Sin existencias por el momento</span>
            )}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!producto.disponible}
              className="rounded-full bg-navy-500 px-8 py-3.5 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600 disabled:cursor-not-allowed disabled:bg-navy-200"
            >
              Agregar al carrito
            </button>
            <Link
              href="/contacto"
              className="rounded-full border border-crema-500 px-8 py-3.5 text-sm font-medium text-navy-400 transition-colors hover:border-navy-300 hover:text-navy-500"
            >
              Consultar por este producto
            </Link>
          </div>

          {/* El botón de carrito todavía no tiene lógica: la interfaz existe,
              falta conectar el estado del carrito y la pasarela de pago
              (pendiente de la definición fiscal). */}
          <p className="mt-4 text-xs text-navy-300">
            El carrito está en construcción. Por ahora, consultanos y te
            reservamos el producto.
          </p>

          <dl className="mt-10 divide-y divide-crema-400 border-t border-crema-400 text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-navy-300">Código</dt>
              <dd className="text-navy-400">{producto.sku}</dd>
            </div>
            {producto.presentacion && (
              <div className="flex justify-between py-3">
                <dt className="text-navy-300">Presentación</dt>
                <dd className="text-navy-400">{producto.presentacion}</dd>
              </div>
            )}
            <div className="flex justify-between py-3">
              <dt className="text-navy-300">Retiro en tienda</dt>
              <dd className="text-navy-400">Sin costo</dd>
            </div>
          </dl>
        </div>
      </article>

      {relacionados.length > 0 && (
        <section className="mx-auto max-w-contenido px-6 pb-20">
          <h2 className="mb-8 font-display text-[28px] font-light text-navy-500">
            También te puede servir
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relacionados.map((p) => (
              <TarjetaProducto key={p.sku} producto={p} categoria={categoria?.nombre} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

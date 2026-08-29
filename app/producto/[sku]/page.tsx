import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import TarjetaProducto from "@/components/TarjetaProducto";
import BotonAgregar from "@/components/BotonAgregar";
import { getCategorias, getProductoPorSku, getProductos } from "@/lib/data";
import { formatoColones, presentacionVisible, tinteDeSku } from "@/lib/formato";
import { negocio, urlWhatsApp, faltante } from "@/lib/negocio";

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
  if (!producto) return { title: "Producto no encontrado" };
  // Se prefiere la descripción real del ERP: es texto propio del producto y
  // no una plantilla repetida en 184 páginas, que es lo que Google trata como
  // contenido duplicado. La plantilla queda como respaldo para los productos
  // a los que todavía no se les escribió descripción.
  const descripcion = producto.descripcion
    ? `${producto.descripcion} ${formatoColones(producto.precio_venta)}. ` +
      "Retiro en tienda sin costo en Heredia."
    : `${producto.nombre}${presentacionVisible(producto.presentacion) ? ` · ${presentacionVisible(producto.presentacion)}` : ""} — ` +
      `${formatoColones(producto.precio_venta)}. Disponible en AllPet Costa Rica, ` +
      "con retiro en tienda sin costo.";
  const ruta = `/producto/${encodeURIComponent(producto.sku)}`;
  return {
    title: producto.nombre,
    description: descripcion,
    alternates: { canonical: ruta },
    openGraph: {
      type: "website",
      title: `${producto.nombre} | AllPet`,
      description: descripcion,
      url: ruta,
      ...(producto.imagen ? { images: [{ url: producto.imagen }] } : {}),
    },
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

  // Cross-selling: misma categoría, y SOLO lo que se puede comprar hoy.
  // Recomendar un producto agotado gasta el clic de alguien que ya estaba
  // dispuesto a comprar — es el peor momento para hacerle perder el tiempo.
  // Si no alcanzan cuatro disponibles se completa con el resto de la
  // categoría antes que dejar la fila coja.
  const mismaCategoria = productos.filter(
    (p) => p.sku !== producto.sku && p.categoria_id === producto.categoria_id,
  );
  const relacionados = [
    ...mismaCategoria.filter((p) => p.disponible),
    ...mismaCategoria.filter((p) => !p.disponible),
  ].slice(0, 4);

  const url = `${negocio.sitioUrl}/producto/${encodeURIComponent(producto.sku)}`;

  // Product: permite que Google muestre precio y disponibilidad en los
  // resultados. Es lo que diferencia un resultado con datos de uno de texto.
  const ldProducto = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    sku: producto.sku,
    ...(producto.descripcion ? { description: producto.descripcion } : {}),
    // Absoluta: Google necesita resolver la imagen sin depender de la página
    // desde la que se lee el marcado.
    ...(producto.imagen ? { image: `${negocio.sitioUrl}${producto.imagen}` } : {}),
    // `size` solo si es presentación de venta: marcar "Paquete: 12 / Caja: 216"
    // como talla es marcado incorrecto, y Google lo penaliza o lo descarta.
    ...(presentacionVisible(producto.presentacion)
      ? { size: presentacionVisible(producto.presentacion) }
      : {}),
    ...(categoria ? { category: categoria.nombre } : {}),
    // `mascota` NO se marca: schema.org no tiene una propiedad para la especie
    // destino de un producto, y forzarla dentro de `audience` (que es para
    // públicos humanos) sería marcado incorrecto. Mejor omitirlo que emitir un
    // dato que Google va a descartar o, peor, interpretar mal.
    offers: {
      "@type": "Offer",
      url,
      price: producto.precio_venta,
      priceCurrency: "CRC",
      availability: producto.disponible
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: negocio.nombre },
    },
  };

  const ldMigas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: negocio.sitioUrl },
      { "@type": "ListItem", position: 2, name: "Catálogo", item: `${negocio.sitioUrl}/catalogo` },
      ...(categoria
        ? [{
            "@type": "ListItem", position: 3, name: categoria.nombre,
            // Por id, no por nombre: el filtro por nombre depende de que dos
            // archivos escriban igual, y esa fragilidad ya rompió la
            // navegación una vez (ver lib/navegacion.ts).
            item: `${negocio.sitioUrl}/catalogo?cats=${categoria.id}`,
          }]
        : []),
      { "@type": "ListItem", position: categoria ? 4 : 3, name: producto.nombre, item: url },
    ],
  };

  // Una consulta directa debe identificar el artículo sin obligar a quien
  // atiende WhatsApp a adivinar cuál de los productos con nombre parecido es.
  // Es una consulta, no un pedido ni una reserva: stock y total se confirman
  // siempre por el canal habitual.
  const consultaWa = urlWhatsApp(
    [
      "Hola, quiero consultar por este producto:",
      `Producto: ${producto.nombre}`,
      `Código: ${producto.sku}`,
      `Precio mostrado: ${formatoColones(producto.precio_venta)}`,
      `Enlace: ${url}`,
    ].join("\n"),
  );

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldProducto) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldMigas) }} />

      <div className="mx-auto max-w-contenido px-6 pt-6">
        <nav aria-label="Ruta" className="text-xs text-navy-400">
          <Link href="/" className="rounded hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500">Inicio</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <Link href="/catalogo" className="rounded hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500">Catálogo</Link>
          {categoria && (
            <>
              <span className="px-2" aria-hidden="true">/</span>
              <Link
                href={`/catalogo?cats=${categoria.id}`}
                className="rounded hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
              >
                {categoria.nombre}
              </Link>
            </>
          )}
        </nav>
      </div>

      <article className="mx-auto grid max-w-contenido gap-12 px-6 py-10 lg:grid-cols-2">
        {/* object-contain y fondo blanco: la foto del catálogo es apaisada
            (300x231) y este marco es cuadrado. Con object-cover el navegador
            la ampliaba hasta llenar y le cortaba los costados, que en la
            ficha del producto es justo donde suele estar la medida o la
            variante de color. Mejor verla completa con aire a los lados. */}
        {/* "relative" es obligatorio acá: <Image fill> se posiciona contra
            el ancestro posicionado más cercano. Sin esta clase no tenía
            ninguno, así que la foto se anclaba contra un elemento mucho más
            grande arriba en la página, se salía del recuadro y tapaba el
            precio y el botón (reportado por Oscar, 17/08/2026). El mismo
            patrón en TarjetaProducto.tsx sí tenía "relative" — por eso ahí
            nunca se rompió. */}
        <div
          className={`relative grid aspect-square place-items-center overflow-hidden rounded-card ${
            producto.imagen ? "bg-white" : tinteDeSku(producto.sku)
          }`}
        >
          {producto.imagen ? (
            <Image
              src={producto.imagen}
              alt={producto.nombre}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="rounded-card object-contain p-6"
            />
          ) : (
            <span className="text-label uppercase text-navy-400">
              Foto pendiente
            </span>
          )}
        </div>

        <div className="lg:py-4">
          {categoria && (
            <p className="text-label uppercase text-dorado-700">
              {categoria.nombre}
            </p>
          )}
          <h1 className="mt-2 font-display text-headline leading-tight text-navy-500">
            {producto.nombre}
          </h1>
          {presentacionVisible(producto.presentacion) && (
            <p className="mt-2 text-sm text-navy-400">
              {presentacionVisible(producto.presentacion)}
            </p>
          )}
          {producto.mascota && (
            <p className="mt-2 text-sm text-navy-400">
              Para: <span className="font-medium text-navy-500">{producto.mascota}</span>
            </p>
          )}

          {/* La descripción va ARRIBA del precio, no enterrada al final: es
              lo que responde "¿es esto lo que busco?", y esa pregunta viene
              antes que "¿cuánto cuesta?". El texto sale del ERP
              (Producto.descripcion), así que corregirlo no exige desplegar
              el sitio. */}
          {producto.descripcion && (
            <p className="mt-5 max-w-prose text-[15px] font-light leading-relaxed text-navy-400">
              {producto.descripcion}
            </p>
          )}

          <p className="mt-7 text-[30px] font-medium text-navy-500">
            {formatoColones(producto.precio_venta)}
          </p>

          {/* El estado no se comunica SOLO por color (WCAG 1.4.1): el punto
              acompaña al texto, no lo sustituye. Y no usa el dorado de marca:
              mezclar el color de identidad con el de estado hace que ninguno
              de los dos signifique nada. */}
          <p className="mt-3 flex items-center gap-2 text-sm">
            {producto.disponible ? (
              <>
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-600"
                  aria-hidden="true"
                />
                <span className="text-navy-400">Disponible en tienda</span>
              </>
            ) : (
              <>
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full bg-navy-200"
                  aria-hidden="true"
                />
                <span className="text-navy-400">Sin existencias por el momento</span>
              </>
            )}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <BotonAgregar producto={producto} />
            {!faltante(negocio.whatsapp) && consultaWa && (
              <a
                href={consultaWa}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-crema-500 px-8 py-3.5 text-sm font-medium text-navy-400 transition-colors hover:border-navy-300 hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
              >
                Consultar por WhatsApp
              </a>
            )}
          </div>

          <p className="mt-4 text-xs font-light leading-relaxed text-navy-400">
            Agregá al carrito y confirmá el pedido por WhatsApp. No se cobra
            nada en línea: te confirmamos existencias y total antes de preparar
            todo.
          </p>

          <dl className="mt-10 divide-y divide-crema-400 border-t border-crema-400 text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-navy-400">Código</dt>
              <dd className="text-navy-400">{producto.sku}</dd>
            </div>
            {presentacionVisible(producto.presentacion) && (
              <div className="flex justify-between py-3">
                <dt className="text-navy-400">Presentación</dt>
                <dd className="text-navy-400">
                  {presentacionVisible(producto.presentacion)}
                </dd>
              </div>
            )}
            {producto.mascota && (
              <div className="flex justify-between py-3">
                <dt className="text-navy-400">Para</dt>
                <dd className="text-navy-400">{producto.mascota}</dd>
              </div>
            )}
            <div className="flex justify-between py-3">
              <dt className="text-navy-400">Retiro en tienda</dt>
              <dd className="text-navy-400">Sin costo</dd>
            </div>
          </dl>
        </div>
      </article>

      {relacionados.length > 0 && (
        <section className="mx-auto max-w-contenido px-6 pb-20">
          <h2 className="mb-8 font-display text-headline text-navy-500">
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

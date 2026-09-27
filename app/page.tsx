import Link from "next/link";
import Image from "next/image";
import BloqueEditorial, { Flecha } from "@/components/inicio/BloqueEditorial";
import CarruselProductos from "@/components/inicio/CarruselProductos";
import BandaLifestyle from "@/components/inicio/BandaLifestyle";
import ComprarPorActividad from "@/components/inicio/ComprarPorActividad";
import TiendaFisica from "@/components/inicio/TiendaFisica";
import Marcas from "@/components/inicio/Marcas";
import Comunidad from "@/components/inicio/Comunidad";
import { ESPECIES, esParaEspecie, hrefEspecie, hrefCats, idsRama, RAICES_ALIMENTO } from "@/lib/navegacion";
import { ACTIVIDADES } from "@/lib/contenidoInicio";
import { armarVitrina } from "@/lib/vitrina";
import { getCategorias, getProductos } from "@/lib/data";
export const metadata = { alternates: { canonical: "/" } };

/**
 * INICIO — rediseño del 26/09/2026
 *
 * ── EL ORDEN
 *   1. Hero de campaña        una foto, una frase, un botón
 *   2. Perros · Gatos · Alim.  ¿para quién comprás? (tres piezas con foto)
 *   3. En la tienda hoy        producto real, con existencia
 *   4. Banda lifestyle         la pausa: para qué se compra
 *   5. Comprar por actividad   pasear, jugar, comer… → categorías reales
 *   6. Cómo comprar            la mecánica sin pago en línea, en una franja
 *   7. La tienda física        dirección, horario, retiro, cómo llegar
 *   8. Marcas / Comunidad      listas, pero apagadas hasta tener datos reales
 *
 * ── QUÉ CAMBIÓ Y POR QUÉ
 * La portada anterior ("la fachada iluminada", 17/08/2026) se organizaba en
 * bandas navy que abrían y cerraban la página. Funcionaba como identidad,
 * pero se leía como tienda en línea tradicional: mucho azul, mucha caja, y
 * el producto en tercer lugar. El brief del rediseño pide lo contrario:
 * blanco y crema como aire, navy y dorado como acento, fotografía grande y
 * poco texto. El navy sigue siendo la tinta de todo el sitio y el pie sigue
 * siendo la banda oscura de cierre.
 *
 * ── QUÉ SE MANTIENE A PROPÓSITO
 * - Los conteos reales en cada entrada ("159 productos"): una entrada sin
 *   conteo pide un clic a ciegas, y uno escrito a mano miente en cuanto
 *   cambia el inventario. Ahora van chicos, pero van.
 * - "Cómo comprar": sin pasarela de pago, quien no entiende la mecánica
 *   asume que la tienda está rota. Se compactó, no se quitó.
 * - La vitrina: destacados elegidos en el ERP primero, y el resto repartido
 *   por categoría sin nombres repetidos (lib/vitrina.ts).
 *
 * ── QUÉ NO SE INVENTÓ
 * El brief proponía "Lo nuevo en AllPet", marcas y comunidad. El ERP no
 * tiene fecha de ingreso (llamarlo "nuevo" sería mentir: se tituló "En la
 * tienda hoy", que sí es verdad porque solo se publica lo que hay), ni campo
 * de marca, ni hay fotos de clientes. Marcas y Comunidad quedan listas y se
 * encienden solas desde lib/contenidoInicio.ts.
 */

const pasos = [
  { n: "1", titulo: "Armá tu pedido", texto: "Sin registro y sin tarjeta." },
  { n: "2", titulo: "Confirmamos por WhatsApp", texto: "Te confirmamos existencias y total antes de que pagués." },
  { n: "3", titulo: "Retirás o te lo enviamos", texto: "Retiro sin costo en Heredia o entrega en la GAM." },
];

/** Fotos de las tres entradas grandes. Criterio (docs/DIRECCION-DE-ARTE.md):
 *  el animal relajado o jugando, nunca sometido a un procedimiento.
 *  Alimentos usa alimentos.jpg (bolsas de alimento con sus platos), aportada
 *  por Oscar el 26/09/2026. Archivo con nombre nuevo a propósito: Cloudflare
 *  guarda 30 días las imágenes optimizadas por URL, y reemplazar
 *  alimento.jpg con el mismo nombre dejaría a parte de los visitantes viendo
 *  la anterior. La foto del hero es otra: hero.jpg. */
const FOTOS_ESPECIE: Record<string, { imagen: string; posicion: string }> = {
  perro: { imagen: "/categorias/juguetes.jpg", posicion: "68% 40%" },
  gato: { imagen: "/categorias/gato.jpg", posicion: "40% 55%" },
};

export default async function HomePage() {
  const [productos, categorias] = await Promise.all([getProductos(), getCategorias()]);

  const disponibles = productos.filter((p) => p.disponible);
  const nombrePorId = new Map(categorias.map((c) => [c.id, c.nombre]));

  /** Productos con existencia en la rama de cualquiera de estas categorías
   *  raíz, contados una sola vez. */
  const contarRamas = (ids: number[]) => {
    const rama = new Set(ids.flatMap((id) => idsRama(categorias, id)));
    return disponibles.filter((p) => p.categoria_id !== null && rama.has(p.categoria_id)).length;
  };
  const idsPorNombre = (nombres: string[]) =>
    categorias.filter((c) => c.padre_id === null && nombres.includes(c.nombre)).map((c) => c.id);

  // ── LAS TRES ENTRADAS. Conteo calculado, nunca escrito a mano.
  const especies = ESPECIES.map((e) => ({
    clave: e.clave,
    titulo: e.label,
    href: hrefEspecie(e.clave),
    total: disponibles.filter((p) => esParaEspecie(p.mascota, e.clave)).length,
    ...FOTOS_ESPECIE[e.clave],
  }));
  const idsAlimento = idsPorNombre(RAICES_ALIMENTO);
  const totalAlimento = contarRamas(idsAlimento);
  const entradas = [
    ...especies,
    // Alimentos solo aparece si hay alimento con existencia: una entrada que
    // lleva a una lista vacía promete algo que no hay.
    ...(totalAlimento > 0
      ? [{ clave: "alimento", titulo: "Alimentos", href: hrefCats(idsAlimento), total: totalAlimento, imagen: "/categorias/alimentos.jpg", posicion: "50% 60%" }]
      : []),
  ].filter((e) => e.total > 0);

  // ── ACTIVIDADES → categorías reales por id.
  const actividades = ACTIVIDADES.map((a) => {
    const ids = idsPorNombre(a.categorias);
    return { nombre: a.nombre, href: hrefCats(ids), total: ids.length ? contarRamas(ids) : 0 };
  }).filter((a) => a.total > 0);

  const idsPaseo = idsPorNombre(["Paseo"]);

  // LA VITRINA — destacados a mano desde el ERP (`destacado_home`, en el
  // orden de `orden_home`) y, si no alcanzan, relleno automático repartido
  // por categoría y sin nombres repetidos. Toda la lógica y su porqué viven
  // en lib/vitrina.ts.
  //
  // Ocho, no doce (26/09/2026): dos filas de cuatro en escritorio. Una
  // tercera fila convertía la portada en el catálogo.
  const vitrina = armarVitrina(disponibles, 8);

  const enlaceSecundario =
    "inline-flex min-h-11 shrink-0 items-center gap-2 rounded text-sm font-medium text-navy-500 underline decoration-crema-500 underline-offset-[6px] transition-colors hover:decoration-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500";

  return (
    <>
      {/* ── 1. HERO DE CAMPAÑA ──────────────────────────────────────────────
          Foto a sangre (hero.jpg: perro y gato con los platos AllPet —
          decisión de Oscar, 26/09/2026, sobre hogar.jpg), un titular, una
          línea y un solo botón. `preload` + `fetchPriority="high"`: es el
          elemento LCP. En Next 16 `priority` quedó obsoleto y además no marcaba
          la prioridad de red; `preload` solo agrega el <link> de precarga.

          ESCRITORIO (lg+): el texto va abajo a la izquierda sobre un velo que
          solo oscurece esa esquina; las caras de los animales quedan limpias.

          CELULAR Y TABLET VERTICAL (< lg), ajuste del 26/09/2026 a pedido de
          Oscar: con la foto de fondo a pantalla completa, una pantalla vertical
          solo deja ver un tercio del ancho de una foto apaisada y el gato
          quedaba afuera. Ahí la foto va arriba, completa (4:3 en celular, 16:9
          en tablet: entran los dos), y el texto abajo sobre el mismo navy, con
          un degradado que funde la foto con el fondo. */}
      <section className="relative isolate overflow-hidden bg-navy-900">
        <div className="relative lg:h-[calc(100svh-104px)] lg:max-h-[820px] lg:min-h-[600px]">
          <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto">
            <Image
              src="/categorias/hero.jpg"
              alt="Un golden retriever y un gato atigrado junto a sus platos de comida, al sol en una terraza"
              fill
              preload
              fetchPriority="high"
              sizes="100vw"
              className="object-cover object-[50%_40%] lg:object-center"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-900 to-transparent lg:hidden" aria-hidden="true" />
            <div className="absolute inset-0 hidden bg-gradient-to-t from-navy-900/80 via-navy-900/20 to-transparent lg:block" aria-hidden="true" />
            <div className="absolute inset-0 hidden bg-gradient-to-r from-navy-900/55 via-transparent to-transparent lg:block" aria-hidden="true" />
          </div>

          <div className="relative mx-auto flex max-w-contenido px-4 pb-12 pt-2 sm:px-6 sm:pb-16 lg:h-full lg:items-end lg:pb-20 lg:pt-0">
            <div className="max-w-3xl text-white">
              <p className="text-label font-medium uppercase tracking-[0.16em] text-white/85">
                Tienda de mascotas · Heredia, Costa Rica
              </p>
              {/* Un solo h1 por página, y es la declaración de marca, no el
                  nombre (el logo ya está en el encabezado). Copy aprobado por
                  Oscar el 26/09/2026: "Ellos marcan el plan." abre la idea que
                  retoma "¿Cuál es el plan hoy?" más abajo. Las palabras para
                  Google (tienda de mascotas, Heredia, perros, gatos) van en el
                  antetítulo y el subtítulo, no en el h1. */}
              <h1 className="mt-4 font-display text-hero">Ellos marcan el plan.</h1>
              <p className="mt-5 max-w-md text-base font-light leading-relaxed text-white/90 sm:text-[17px]">
                Alimento, accesorios e higiene para perros y gatos. En línea o
                en nuestra tienda de Heredia.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-sm font-medium text-navy-500 transition-colors hover:bg-crema-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                >
                  Ver productos
                  <Flecha className="h-4 w-4" />
                </Link>
                <Link
                  href="#tienda"
                  className="inline-flex min-h-11 items-center rounded text-sm font-medium text-white underline decoration-white/50 underline-offset-[6px] transition-colors hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Visitanos en Heredia
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PARA QUIÉN COMPRÁS ───────────────────────────────────────────
          CASI A SANGRE (27/09/2026, a pedido de Oscar): dentro del contenedor
          de 1180 px, en una pantalla ancha las tres fotos quedaban chicas y
          con dos franjas blancas a los costados. Ahora la grilla ocupa todo
          el ancho —con un margen fino y separación mínima entre fotos, como
          el hero— y el título se alinea con el borde de las fotos.
          Los bloques crecen a lo ancho, NO a lo alto: las fotos son
          horizontales, y un bloque más alto las recortaría (efecto zoom).
          Tope de 2000 px para que en monitores enormes no se vuelvan murales.

          En móvil no es la grilla de escritorio apilada: la primera pieza va
          a lo ancho y las otras dos comparten fila, así las tres entran en
          poco más de una pantalla. Con solo dos (sin alimento en stock),
          van lado a lado. */}
      <section className="pb-12 pt-12 lg:pb-16 lg:pt-16">
        <div className="mx-auto flex max-w-[2000px] items-end justify-between gap-6 px-4 sm:px-6">
          <h2 className="font-display text-seccion text-navy-500">¿Para quién comprás?</h2>
          <Link href="/catalogo" className={`hidden sm:inline-flex ${enlaceSecundario}`}>
            Ver todo el catálogo
          </Link>
        </div>
        <div className={`mx-auto mt-8 grid max-w-[2000px] grid-cols-2 gap-2 px-2 sm:gap-3 sm:px-3 lg:mt-10 ${entradas.length === 3 ? "lg:grid-cols-3" : ""}`}>
          {entradas.map((e, i) => (
            <BloqueEditorial
              key={e.clave}
              titulo={e.titulo}
              href={e.href}
              detalle={`${e.total} productos`}
              imagen={e.imagen}
              posicion={e.posicion}
              // La primera de tres va a lo ancho hasta lg (col-span-2): si
              // se declara 50vw, el teléfono baja media resolución y se ve
              // blanda. Detectado en la auditoría de rendimiento, 26/09/2026.
              sizes={
                entradas.length !== 3
                  ? "50vw"
                  : i === 0
                    ? "(max-width: 1024px) 100vw, 34vw"
                    : "(max-width: 1024px) 50vw, 34vw"
              }
              className={
                entradas.length === 3 && i === 0
                  ? "col-span-2 aspect-[4/3] sm:aspect-[16/9] lg:col-span-1 lg:aspect-[4/3]"
                  : entradas.length === 3
                    ? "aspect-square lg:aspect-[4/3]"
                    : "aspect-square lg:aspect-[16/10]"
              }
            />
          ))}
        </div>
      </section>

      {/* ── 3. EN LA TIENDA HOY ─────────────────────────────────────────── */}
      {vitrina.length > 0 && (
        <section className="bg-crema-100">
          <div className="mx-auto max-w-contenido px-4 py-20 sm:px-6 lg:py-28">
            <div className="mb-8 flex items-end justify-between gap-6 lg:mb-10">
              <div>
                <h2 className="font-display text-seccion text-navy-500">En la tienda hoy</h2>
                <p className="mt-2 text-sm font-light text-navy-400">
                  Lo que ves, lo tenemos.
                </p>
              </div>
              <Link href="/catalogo" className={enlaceSecundario}>
                Ver los {disponibles.length} productos
              </Link>
            </div>
            <CarruselProductos productos={vitrina} nombrePorId={nombrePorId} />
          </div>
        </section>
      )}

      {/* ── 4. BANDA LIFESTYLE ──────────────────────────────────────────── */}
      <BandaLifestyle
        titulo="La calle es de los dos."
        texto="Correas, arneses y collares para cada salida."
        cta="Ver correas y arneses"
        href={idsPaseo.length ? hrefCats(idsPaseo) : "/catalogo"}
        imagen="/categorias/paseo.jpg"
        posicion="center 60%"
      />

      {/* ── 5. COMPRAR POR ACTIVIDAD ────────────────────────────────────── */}
      {actividades.length > 0 && (
        <section className="mx-auto max-w-contenido px-4 py-20 sm:px-6 lg:py-28">
          <h2 className="font-display text-seccion text-navy-500">¿Cuál es el plan hoy?</h2>
          <p className="mt-2 text-sm font-light text-navy-400">Comprá por actividad.</p>
          <div className="mt-8 lg:mt-10">
            <ComprarPorActividad actividades={actividades} />
          </div>
        </section>
      )}

      {/* ── 6. CÓMO COMPRAR ─────────────────────────────────────────────────
          Responde "no veo botón de pagar, ¿cómo compro?". Una tienda sin
          pasarela tiene que explicar su mecánica o el visitante asume que
          está rota. Franja compacta: tres pasos en una línea. */}
      <section className="border-t border-crema-300">
        <div className="mx-auto grid max-w-contenido gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_3fr] lg:items-start lg:gap-16 lg:py-16">
          <div>
            <h2 className="font-display text-headline text-navy-500">Cómo comprar</h2>
            <Link href="/envios" className={`mt-1 ${enlaceSecundario}`}>
              Envíos y retiro
            </Link>
          </div>
          <ol className="grid gap-6 sm:grid-cols-3 sm:gap-8">
            {pasos.map((p) => (
              <li key={p.n} className="flex gap-4">
                <span className="font-display text-headline leading-none text-dorado-700" aria-hidden="true">
                  {p.n}
                </span>
                <div>
                  <h3 className="text-[15px] font-medium text-navy-500">{p.titulo}</h3>
                  <p className="mt-1 text-sm font-light leading-relaxed text-navy-400">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 7. LA TIENDA FÍSICA ── 8. MARCAS / COMUNIDAD (apagadas) ───── */}
      <TiendaFisica />
      <Marcas />
      <Comunidad />
    </>
  );
}

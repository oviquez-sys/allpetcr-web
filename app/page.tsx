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
  { n: "2", titulo: "Confirmamos por WhatsApp", texto: "Existencias y total, antes de que pagués." },
  { n: "3", titulo: "Retirás o te lo enviamos", texto: "En la tienda o con entrega en la GAM." },
];

/** Fotos de las tres entradas grandes. Criterio (docs/DIRECCION-DE-ARTE.md):
 *  el animal relajado o jugando, nunca sometido a un procedimiento.
 *  Alimentos usa alimento.jpg (bolsas, latas y platos), aportada por Oscar
 *  el 26/09/2026. La foto del hero es otra: hero.jpg. */
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
      ? [{ clave: "alimento", titulo: "Alimentos", href: hrefCats(idsAlimento), total: totalAlimento, imagen: "/categorias/alimento.jpg", posicion: "50% 60%" }]
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

          El texto va abajo a la izquierda sobre un velo que solo oscurece
          esa esquina; las caras de los animales quedan limpias. En móvil
          la foto se recorta hacia el perro (object-position) en vez de
          encogerse a una tira de 200px. */}
      <section className="relative isolate overflow-hidden bg-navy-900">
        <div className="relative h-[76svh] max-h-[760px] min-h-[520px] lg:h-[calc(100svh-104px)] lg:max-h-[820px] lg:min-h-[600px]">
          <Image
            src="/categorias/hero.jpg"
            alt="Un golden retriever y un gato atigrado junto a sus platos de comida, al sol en una terraza"
            fill
            preload
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-[30%_center] sm:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/20 to-transparent" aria-hidden="true" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-navy-900/55 via-transparent to-transparent lg:block" aria-hidden="true" />

          <div className="relative mx-auto flex h-full max-w-contenido items-end px-4 pb-12 sm:px-6 sm:pb-16 lg:pb-20">
            <div className="max-w-3xl text-white">
              <p className="text-label font-medium uppercase tracking-[0.16em] text-white/85">
                Tienda de mascotas · Heredia, Costa Rica
              </p>
              {/* Un solo h1 por página, y es la promesa, no el nombre de la
                  marca (el logo ya está en el encabezado). */}
              <h1 className="mt-4 font-display text-hero">
                Para su juego, paseo
                <br className="hidden sm:block" /> y cuidado diario.
              </h1>
              <p className="mt-5 max-w-md text-base font-light leading-relaxed text-white/90 sm:text-[17px]">
                Alimento, accesorios e higiene para perros y gatos. Comprá en
                línea o visitanos en Heredia.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-sm font-medium text-navy-500 transition-colors hover:bg-crema-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                >
                  Comprar ahora
                  <Flecha className="h-4 w-4" />
                </Link>
                <Link
                  href="#tienda"
                  className="inline-flex min-h-11 items-center rounded text-sm font-medium text-white underline decoration-white/50 underline-offset-[6px] transition-colors hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Visitá la tienda
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PARA QUIÉN COMPRÁS ───────────────────────────────────────────
          En móvil no es la grilla de escritorio apilada: la primera pieza va
          a lo ancho y las otras dos comparten fila, así las tres entran en
          poco más de una pantalla. Con solo dos (sin alimento en stock),
          van lado a lado. */}
      <section className="mx-auto max-w-contenido px-4 pb-20 pt-16 sm:px-6 lg:pb-28 lg:pt-24">
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-display text-seccion text-navy-500">¿Para quién comprás?</h2>
          <Link href="/catalogo" className={`hidden sm:inline-flex ${enlaceSecundario}`}>
            Ver todo el catálogo
          </Link>
        </div>
        <div className={`mt-8 grid grid-cols-2 gap-2.5 sm:gap-4 lg:mt-10 ${entradas.length === 3 ? "lg:grid-cols-3" : ""}`}>
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
                  ? "(max-width: 1024px) 50vw, 580px"
                  : i === 0
                    ? "(max-width: 1024px) 100vw, 380px"
                    : "(max-width: 1024px) 50vw, 380px"
              }
              className={
                entradas.length === 3 && i === 0
                  ? "col-span-2 aspect-[4/3] sm:aspect-[16/9] lg:col-span-1 lg:aspect-[4/5]"
                  : entradas.length === 3
                    ? "aspect-[4/5]"
                    : "aspect-[4/5] lg:aspect-[5/4]"
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
                  Si aparece acá, está en existencia.
                </p>
              </div>
              <Link href="/catalogo" className={enlaceSecundario}>
                Ver los {disponibles.length}
              </Link>
            </div>
            <CarruselProductos productos={vitrina} nombrePorId={nombrePorId} />
          </div>
        </section>
      )}

      {/* ── 4. BANDA LIFESTYLE ──────────────────────────────────────────── */}
      <BandaLifestyle
        titulo="Más momentos juntos."
        texto="Correas, arneses y collares para salir a la calle con todo lo que hace falta."
        cta="Ver paseo"
        href={idsPaseo.length ? hrefCats(idsPaseo) : "/catalogo"}
        imagen="/categorias/paseo.jpg"
        posicion="center 60%"
      />

      {/* ── 5. COMPRAR POR ACTIVIDAD ────────────────────────────────────── */}
      {actividades.length > 0 && (
        <section className="mx-auto max-w-contenido px-4 py-20 sm:px-6 lg:py-28">
          <h2 className="font-display text-seccion text-navy-500">¿Qué van a hacer hoy?</h2>
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
              Entregas y detalles
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

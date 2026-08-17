import Link from "next/link";
import Image from "next/image";
import TarjetaProducto from "@/components/TarjetaProducto";
import TarjetaCategoria from "@/components/TarjetaCategoria";
import Marca from "@/components/Marca";
import { destacadas } from "@/lib/navegacion";
import { getCategorias, getProductos } from "@/lib/data";
import { negocio, faltante } from "@/lib/negocio";
import { formatoColones, tinteDeSku } from "@/lib/formato";

/**
 * INICIO
 *
 * ── EL ORDEN DE LAS SECCIONES NO ES DECORATIVO
 * Sigue la secuencia de decisión de quien entra por primera vez:
 *   1. ¿Qué es esto y por qué debería quedarme?   → hero
 *   2. ¿Qué venden?                                → categorías
 *   3. Enseñame producto de verdad                 → destacados
 *   4. ¿Puedo confiar?                             → señales de confianza
 *   5. ¿Cómo compro?                               → cómo funciona
 *
 * Es el mismo orden que usa Chewy y casi todo el comercio serio, y no por
 * moda: poner las señales de confianza arriba, antes de que la persona sepa
 * qué vendés, es responder una pregunta que todavía no se hizo.
 *
 * ── POR QUÉ EL HERO ES SOBRIO Y NO UN CARRUSEL
 * Los carruseles de portada tienen tasas de clic muy bajas fuera del primer
 * cuadro, empujan el contenido útil hacia abajo y cargan JavaScript y varias
 * imágenes grandes en la ruta crítica —justo donde se decide el LCP, la
 * métrica de Core Web Vitals que más pesa. Un hero fijo con una sola promesa
 * carga más rápido y comunica mejor.
 *
 * ── POR QUÉ HAY UN SOLO BOTÓN PRINCIPAL
 * Dos botones del mismo peso visual obligan a elegir antes de saber qué se
 * está eligiendo. "Ver catálogo" es primario; hablar por WhatsApp es una
 * salida secundaria, y se ve como tal.
 */

const confianza = [
  {
    titulo: "Tienda física en Heredia",
    texto: "No somos un catálogo sin dirección. Podés venir, ver el producto y preguntar.",
  },
  {
    titulo: "Asesoría honesta",
    texto: "Recomendamos según lo que necesita tu mascota, no según lo que deja más margen.",
  },
  {
    titulo: "Retiro sin costo",
    texto: "Reservás en línea y lo recogés en tienda. Sin cargo de envío.",
  },
  {
    titulo: "Precios claros",
    texto: "El precio que ves es el que pagás. Sin cargos que aparecen al final.",
  },
];

const pasos = [
  {
    n: "1",
    titulo: "Armá tu pedido",
    texto: "Agregá al carrito lo que necesités. No pedimos registro ni tarjeta.",
  },
  {
    n: "2",
    titulo: "Confirmamos por WhatsApp",
    texto: "Revisamos existencias y total con vos antes de que te comprometás a nada.",
  },
  {
    n: "3",
    titulo: "Retirás o coordinamos entrega",
    texto: "Pagás al retirar en la tienda. Sin sorpresas.",
  },
];

export default async function HomePage() {
  const [productos, categorias] = await Promise.all([getProductos(), getCategorias()]);

  // Solo productos disponibles en la portada. Mostrar agotados en el
  // escaparate principal es la forma más rápida de gastar la primera
  // impresión: el visitante hace clic, no puede comprar, y aprende que el
  // sitio le hace perder el tiempo.
  //
  // 3, no 4: la dirección "Evolución Premium" reduce densidad por fila a
  // cambio de más presencia por producto (tarjetas más grandes, más aire).
  const destacadosProd = productos.filter((p) => p.disponible).slice(0, 3);

  const nombrePorId = new Map(categorias.map((c) => [c.id, c.nombre]));

  // PIEZA DEL MES — un producto real, elegido de forma determinista (el
  // primero disponible que ya tiene foto, para que la franja se vea bien
  // incluso antes de reprocesar el resto del catálogo; si ninguno tiene foto
  // todavía, cae al primero disponible). No existe un campo "destacado" en
  // el ERP: el día que exista, este filtro se reemplaza por ese campo en vez
  // de inventar uno.
  const piezaDelMes =
    productos.find((p) => p.disponible && p.imagen) ??
    productos.find((p) => p.disponible) ??
    null;

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────
          Navy con luz cálida: es la fachada del local al atardecer. La masa
          azul con los halos dorados arriba reproduce los faroles y los focos
          del alero, que es lo que hace que la tienda se vea encendida en vez
          de simplemente iluminada.

          El hero es el único bloque grande en oscuro de la página. La lectura
          larga —fichas de producto, catálogo— sigue sobre crema: texto claro
          sobre fondo oscuro cansa a los párrafos largos, y no vale la pena
          cambiar conversión por ambiente. En el local pasa igual: la fachada
          es oscura, el interior donde se compra está iluminado. */}
      <section className="superficie-navy relative overflow-hidden">
        <div className="mx-auto grid max-w-contenido items-center gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div className="relative">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-dorado-400">
              Tienda de mascotas en Heredia, Costa Rica
            </p>
            {/* Un solo h1 por página, y es la promesa —no el nombre de la
                marca. El nombre ya está en el logo del encabezado; repetirlo
                aquí gasta el elemento más importante del documento. */}
            {/* Evolución Premium: el mismo hero, hablado más fuerte — la
                escala sube un paso en cada quiebre en vez de detenerse en
                54px. */}
            <h1 className="mt-4 font-display text-[46px] font-light leading-[1.03] tracking-tight text-crema-100 sm:text-[62px] lg:text-[68px]">
              Todo para tu mascota,
              <br />
              elegido con criterio.
            </h1>
            <p className="mt-6 max-w-md text-[17px] font-light leading-relaxed text-navy-100">
              Juguetes, collares, camas e higiene para perros y gatos. Te decimos
              qué le sirve realmente, no qué nos conviene vender.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              {/* Sobre navy el botón se invierte: crema sólido. Un botón navy
                  sobre fondo navy desaparece, y uno dorado grande rompería la
                  regla de que el dorado va en dosis pequeñas. */}
              <Link
                href="/catalogo"
                className="rounded-full bg-crema-100 px-8 py-3.5 text-sm font-medium text-navy-500 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-600"
              >
                Ver catálogo
              </Link>
              <Link
                href="/contacto"
                className="rounded-full px-2 py-3.5 text-sm font-medium text-navy-100 underline decoration-navy-300 underline-offset-4 transition-colors hover:text-white hover:decoration-dorado-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-600"
              >
                Hablar con nosotros
              </Link>
            </div>

            {/* Micro-señal bajo el CTA: responde "¿me van a obligar a
                registrarme?" justo cuando surge la duda, no tres pantallas
                más abajo. */}
            <p className="mt-6 text-xs font-light text-navy-200">
              Sin registro · Sin tarjeta · Confirmás por WhatsApp antes de pagar
            </p>
          </div>

          {/* El isotipo sobre el halo cálido: la luz del interior derramándose
              por la vitrina. Sin el halo el logo flotaría sobre un fondo
              muerto; con él, la composición tiene un foco.

              Sin disco ni aro detrás, a propósito. Con el perro en blanco el
              logo ya se sostiene solo sobre el navy —igual que en el rótulo
              de la fachada, que tampoco lleva contenedor—. Un círculo de
              fondo agregaría un borde que compite con la P sin aportar nada. */}
          <div className="relative hidden justify-self-center lg:block" aria-hidden="true">
            <div className="halo-calido absolute -inset-20 rounded-full" />
            <Marca variante="iso" decorativo className="relative h-[230px] w-auto" />
          </div>
        </div>

        {/* La franja dorada que remata el alero de la fachada. */}
        <div className="franja-dorada" aria-hidden="true" />
      </section>

      {/* ── PIEZA DEL MES ───────────────────────────────────────────────────
          Único punto del sitio donde el dorado enmarca en vez de aparecer en
          dosis mínimas — ver `.marco-dorado` en globals.css. Se reserva a
          propósito a UN producto a la vez, nunca a una grilla: es lo que
          mantiene el marco leyéndose como metal y no como relleno. Segunda
          superficie navy de la página, igual que la fachada tiene más de un
          punto de luz. */}
      {piezaDelMes && (
        <section className="superficie-navy-plana relative overflow-hidden">
          <div className="mx-auto grid max-w-contenido items-center gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-dorado-400">
                <span className="h-px w-6 bg-dorado-400" aria-hidden="true" />
                Pieza del mes
              </p>
              <h2 className="mt-4 font-display text-[26px] font-light leading-tight text-crema-100 sm:text-[32px]">
                {piezaDelMes.nombre}
              </h2>
              {piezaDelMes.descripcion && (
                <p className="mt-3 max-w-sm text-[13px] font-light leading-relaxed text-navy-100">
                  {piezaDelMes.descripcion}
                </p>
              )}
              <p className="mt-5 font-display text-2xl font-light text-crema-100">
                {formatoColones(piezaDelMes.precio_venta)}
              </p>
              <Link
                href={`/producto/${encodeURIComponent(piezaDelMes.sku)}`}
                className="mt-7 inline-block rounded-full bg-crema-100 px-8 py-3.5 text-sm font-medium text-navy-500 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-600"
              >
                Ver producto
              </Link>
            </div>

            <div className="marco-dorado justify-self-center" aria-hidden="true">
              <div
                className={`relative grid aspect-square w-full max-w-[280px] place-items-center overflow-hidden rounded ${
                  piezaDelMes.imagen ? "bg-white" : tinteDeSku(piezaDelMes.sku)
                }`}
              >
                {piezaDelMes.imagen ? (
                  <Image
                    src={piezaDelMes.imagen}
                    alt=""
                    fill
                    sizes="280px"
                    className="object-contain p-7"
                  />
                ) : (
                  <span className="text-label uppercase text-navy-400">Foto pendiente</span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CATEGORÍAS ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-contenido px-6 py-20">
        <div className="mb-9 flex items-end justify-between gap-5">
          <div>
            <h2 className="font-display text-headline text-navy-500">
              Comprar por categoría
            </h2>
            <p className="mt-1.5 text-sm font-light text-navy-400">
              {productos.length} productos disponibles en tienda
            </p>
          </div>
          <Link
            href="/catalogo"
            className="shrink-0 border-b border-crema-500 pb-1 text-sm text-navy-400 transition-colors hover:border-navy-300 hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
          >
            Ver todas
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destacadas.map((c, i) => (
            <TarjetaCategoria
              key={c.nombre}
              nombre={c.nombre}
              detalle={c.detalle}
              href={c.href}
              imagen={c.imagen}
              posicion={c.posicion}
              tinte={c.tinte}
              icono={c.icono}
              prioridad={i < 2}
            />
          ))}
        </div>
      </section>

      {/* ── DESTACADOS ──────────────────────────────────────────────────── */}
      {destacadosProd.length > 0 && (
        <section className="border-y border-crema-300 bg-crema-200">
          <div className="mx-auto max-w-contenido px-6 py-20">
            <div className="mb-9 flex items-end justify-between gap-5">
              <h2 className="font-display text-headline text-navy-500">
                Del catálogo
              </h2>
              <Link
                href="/catalogo"
                className="shrink-0 border-b border-crema-500 pb-1 text-sm text-navy-400 transition-colors hover:border-navy-300 hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
              >
                Ver todo
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destacadosProd.map((p) => (
                <TarjetaProducto
                  key={p.sku}
                  producto={p}
                  categoria={
                    p.categoria_id === null ? undefined : nombrePorId.get(p.categoria_id)
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CÓMO FUNCIONA ───────────────────────────────────────────────── */}
      {/* Va antes de las señales de confianza porque responde la duda más
          concreta que queda a esta altura: "no veo botón de pagar, ¿entonces
          cómo compro?". Una tienda sin pasarela tiene que explicar su
          mecánica, o el visitante asume que está rota. */}
      <section className="mx-auto max-w-contenido px-6 py-20">
        <h2 className="font-display text-headline text-navy-500">
          Cómo comprar
        </h2>
        <p className="mt-1.5 max-w-lg text-sm font-light leading-relaxed text-navy-400">
          No cobramos en línea a propósito: preferimos confirmar existencias y
          total con vos antes de que pagués nada.
        </p>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3">
          {pasos.map((p) => (
            <li key={p.n}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-500 text-sm font-medium text-crema-100">
                {p.n}
              </span>
              <h3 className="mt-4 text-[15px] font-medium text-navy-500">{p.titulo}</h3>
              <p className="mt-1.5 text-sm font-light leading-relaxed text-navy-400">
                {p.texto}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── CONFIANZA ─────────────────────────────────────────────────────
          Segunda superficie navy de la página, y la que la cierra. Entre esta
          y el hero queda todo el contenido de compra sobre crema: la página
          tiene la misma estructura que la visita al local —fachada oscura,
          interior claro, y otra vez oscuro al salir—. */}
      <section className="superficie-navy-plana">
        <div className="franja-dorada" aria-hidden="true" />
        <div className="mx-auto max-w-contenido px-6 py-16">
          {/* sr-only: los h3 de abajo colgaban sin un h2 que los agrupara. */}
          <h2 className="sr-only">Por qué confiar en AllPet</h2>
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-4">
            {confianza.map((c) => (
              <div key={c.titulo}>
                {/* Hueco de foto real, marcado como pendiente — no se
                    inventa contenido. Reemplazar por una foto real del
                    local/equipo que respalde la afirmación. */}
                <div
                  className="mb-4 flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-dorado-300/30 bg-white/[0.03]"
                  aria-hidden="true"
                >
                  <span className="px-3 text-center text-[10px] uppercase tracking-wider text-navy-200">
                    Foto pendiente
                  </span>
                </div>
                <h3 className="text-sm font-medium text-white">{c.titulo}</h3>
                <p className="mt-2 text-[13px] font-light leading-relaxed text-navy-100">
                  {c.texto}
                </p>
              </div>
            ))}
          </div>

          {/* La dirección real como cierre: es la señal de confianza más
              barata y más fuerte que tiene un comercio local. Solo se
              muestra si el dato existe —un "PENDIENTE" aquí haría el efecto
              contrario. */}
          {!faltante(negocio.direccion.linea) && (
            <p className="mt-12 border-t border-navy-400/40 pt-6 text-xs font-light text-navy-100">
              {negocio.direccion.linea}, {negocio.direccion.canton},{" "}
              {negocio.direccion.provincia}
              {!faltante(negocio.horarioTexto) && ` · ${negocio.horarioTexto}`}
            </p>
          )}
        </div>
      </section>
    </>
  );
}

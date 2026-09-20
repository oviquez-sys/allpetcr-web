import Link from "next/link";
import Image from "next/image";
import TarjetaProducto from "@/components/TarjetaProducto";
import PuertaEspecie from "@/components/PuertaEspecie";
import { PUERTAS, ESPECIES, esParaEspecie, hrefEspecie, hrefCats, idsRama } from "@/lib/navegacion";
import { getCategorias, getProductos } from "@/lib/data";
import { negocio, faltante } from "@/lib/negocio";
export const metadata = { alternates: { canonical: "/" } };

/**
 * INICIO
 *
 * ── EL ORDEN (rediseño del 17/08/2026)
 *   1. Hero               ¿qué es esto y por qué me quedo?
 *   2. Dos puertas        ¿para quién comprás? — perro / gato
 *   3. La vitrina         enseñame producto de verdad
 *   4. Cómo comprar       no veo botón de pagar, ¿entonces cómo compro?
 *   5. La tienda física   ¿puedo confiar?
 *
 * ── QUÉ CAMBIÓ Y POR QUÉ
 * El orden anterior (hero → categorías → destacados → cómo funciona →
 * confianza) es el de casi cualquier tienda en línea. Funciona, y por eso
 * mismo no distingue a nadie: la portada se leía como una plantilla. Lo que
 * AllPet tiene y la plantilla no es (a) 184 productos con existencia
 * confirmada y (b) un mostrador donde alguien pregunta para quién comprás.
 * Las dos cosas ahora están arriba.
 *
 * ── SE FUE "PIEZA DEL MES"
 * Ponía una segunda banda navy pegada al hero. El propio DESIGN.md declara el
 * ritmo oscuro → claro → oscuro como estructural ("la fachada oscura, el
 * interior iluminado"): dos bandas oscuras seguidas lo rompían, y quien
 * entraba chocaba con una segunda pared antes de ver un solo producto.
 * El destaque de un producto suelto cabe mejor dentro de la vitrina, sobre
 * crema, si algún día el ERP tiene un campo "destacado" de verdad —hoy no lo
 * tiene, y elegirlo por "el primero con foto" era inventar un criterio—.
 *
 * ── SE FUERON LAS CUATRO CAJAS "FOTO PENDIENTE"
 * Cuatro recuadros punteados con la palabra PENDIENTE cerraban la página. La
 * intención era honesta —no inventar contenido— pero el efecto era el
 * contrario: lee como sitio a medio hacer justo donde había que dar
 * confianza. Los datos reales de la tienda (dirección, horario, teléfono)
 * dicen lo mismo y son verificables.
 *
 * ── POR QUÉ EL HERO TIENE BUSCADOR Y NO SOLO UN BOTÓN
 * 184 productos con nombres cortos y repetidos ("Arnés chaleco" aparece nueve
 * veces): buscar llega antes que navegar. Es un <form> con GET a /catalogo,
 * sin JavaScript: funciona aunque el bundle no haya cargado.
 */

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
    texto: "Coordinamos con vos el retiro o envío y el medio de pago.",
  },
];

export default async function HomePage() {
  const [productos, categorias] = await Promise.all([getProductos(), getCategorias()]);

  const disponibles = productos.filter((p) => p.disponible);
  const nombrePorId = new Map(categorias.map((c) => [c.id, c.nombre]));

  // Conteo por especie calculado, nunca escrito a mano: el día que cambie el
  // inventario la puerta dice la verdad sola. Un producto "Perro y gato"
  // cuenta en las dos —de ahí la nota bajo las puertas—.
  const conteoEspecie = new Map(
    ESPECIES.map((e) => [
      e.clave,
      disponibles.filter((p) => esParaEspecie(p.mascota, e.clave)).length,
    ]),
  );
  const ambas = disponibles.filter(
    (p) => esParaEspecie(p.mascota, "perro") && esParaEspecie(p.mascota, "gato"),
  ).length;

  // Categorías raíz con su conteo real, ordenadas por surtido. La línea de
  // texto reemplaza a las cuatro tarjetas grandes: con dos puertas arriba,
  // cuatro tarjetas más eran seis puertas de entrada compitiendo entre sí.
  const categoriasConConteo = categorias
    .filter((c) => c.padre_id === null)
    .map((c) => ({
      id: c.id,
      nombre: c.nombre,
      total: disponibles.filter((p) => p.categoria_id !== null && idsRama(categorias, c.id).includes(p.categoria_id)).length,
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  // LA VITRINA — 12 productos repartidos por categoría en vez de los 12
  // primeros del JSON, que salían todos de "Juguetes" y hacían ver la tienda
  // más chica de lo que es. Determinista: mismo catálogo, misma vitrina.
  const porCategoria = new Map<number | null, typeof disponibles>();
  for (const p of disponibles) {
    const lista = porCategoria.get(p.categoria_id) ?? [];
    lista.push(p);
    porCategoria.set(p.categoria_id, lista);
  }
  //
  // Además, ningún nombre se repite en la vitrina. El ERP tiene 112 nombres
  // para 184 productos —"Arnés chaleco" aparece nueve veces— y dos tarjetas
  // idénticas con precios distintos y sin nada que las diferencie no le
  // sirven a nadie: el visitante no puede elegir, solo dudar. En el catálogo
  // completo conviven porque ahí se comparan lado a lado con su descripción;
  // en un escaparate de doce, no. El arreglo de fondo es escribir nombres
  // distintos en el ERP, no esconderlos acá.
  const vitrina: typeof disponibles = [];
  const nombresUsados = new Set<string>();
  const orden = [...porCategoria.keys()].sort(
    (a, b) => (porCategoria.get(b)?.length ?? 0) - (porCategoria.get(a)?.length ?? 0),
  );
  const conFoto = new Map(
    [...porCategoria.entries()].map(([cat, lista]) => [cat, lista.filter((p) => p.imagen)]),
  );
  const indice = new Map<number | null, number>(orden.map((cat) => [cat, 0]));

  for (let vuelta = 0; vitrina.length < 12 && vuelta < 200; vuelta++) {
    let agregoAlguno = false;
    for (const cat of orden) {
      if (vitrina.length >= 12) break;
      const lista = conFoto.get(cat) ?? [];
      let i = indice.get(cat) ?? 0;
      while (i < lista.length && nombresUsados.has(lista[i].nombre)) i++;
      if (i < lista.length) {
        vitrina.push(lista[i]);
        nombresUsados.add(lista[i].nombre);
        indice.set(cat, i + 1);
        agregoAlguno = true;
      } else {
        indice.set(cat, i);
      }
    }
    if (!agregoAlguno) break; // se agotaron los nombres distintos con foto
  }

  return (
    <>
      {/* FOTO REAL EN EL HERO — decisión de Oscar, 17/08/2026.
          Se compararon en pantalla cuatro variantes: (a) isotipo + halo
          dorado, (b) esta foto sin gradar, (c) la misma foto forzada a tono
          de atardecer, (d) el isotipo con una textura de fondo casi
          imperceptible. Ganó la (b).

          Esto contradice a propósito una regla que este mismo archivo tenía
          escrita hasta hoy: "el degradado cálido reemplaza a la fotografía
          como recurso de ambiente del hero, por rendimiento". Se documenta el
          cambio en vez de borrar la razón vieja sin dejar rastro — el costo
          de rendimiento es real (una foto más en la ruta crítica) y se pesó
          a propósito. Detalle completo, con el resto de las variantes
          descartadas, en DESIGN.md → "Hero: fotografía real".

          `next/image` con `priority`: esta foto es la candidata a LCP de la
          página (lo primero grande que pinta el navegador), así que se
          precarga en vez de esperar a que el navegador la descubra sola.

          AJUSTE 17/08/2026, primera vuelta: en escritorios anchos
          `object-cover` recortaba de más —la lámpara quedaba cortada
          arriba—, así que se probó `object-contain` desde `lg:`. Duró poco:
          Oscar lo vio en su pantalla real (1920px) y la foto se veía
          "incrustada" —dos barras navy planas a los costados, cortando el
          efecto de punta a punta que es justo lo que pidió al elegir esta
          opción sobre el isotipo con halo—.

          AJUSTE 17/08/2026, segunda vuelta (la que quedó): se vuelve a
          `object-cover` de punta a punta —sin barras, nunca— y en cambio la
          SECCIÓN crece de alto en pantallas anchas (`lg:`/`xl:`/`2xl:`
          `min-h`). Es el ajuste correcto para este problema: en una foto
          3:2 dentro de un banner panorámico no se puede mostrarla completa
          sin barras Y de punta a punta a la vez —son objetivos que se
          excluyen—, pero si el contenedor crece en vez de quedarse fijo,
          el recorte deja ver una porción de la foto parecida a la que se
          veía en 1440px, en vez de reducirse a una tira angosta al crecer
          el ancho. Sigue existiendo *algo* de recorte vertical en pantallas
          muy anchas —es inherente al formato, no un bug— pero ya no se nota
          como tal. */}
      <section className="superficie-navy relative overflow-hidden lg:min-h-[480px]">
        <Image
          src="/categorias/hogar.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_28%]"
        />
        {/* Scrim de dos capas, el mismo patrón que TarjetaCategoria: una base
            uniforme leve que evita que un punto claro de la foto borre una
            letra, más un degradado horizontal fuerte donde vive el texto. La
            foto no está gradada —es de mediodía, no de atardecer, ver la nota
            de arriba— pero el scrim sí es intencional: nunca se apoya texto
            sobre una foto sin una capa de contraste debajo. */}
        <div className="absolute inset-0 bg-navy-900/10" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/75 to-navy-900/20"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-transparent"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-contenido px-6 py-12 sm:py-16 lg:py-20">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-dorado-400">
              Tienda de mascotas · Heredia centro
            </p>
            {/* Un solo h1 por página, y es la promesa —no el nombre de la
                marca, que ya está en el logo del encabezado—. */}
            <h1 className="mt-4 font-display text-[42px] font-light leading-[1.04] tracking-tight text-crema-100 sm:text-[58px] lg:text-[64px]">
              Para su juego, paseo
              <br />
              y cuidado diario.
            </h1>
            <p className="mt-6 text-[17px] font-light leading-relaxed text-navy-100">
              Juguetes, arneses, camas e higiene para perros y gatos. Te ayudamos
              a elegir y podés retirar tu pedido en nuestra tienda de Heredia.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/catalogo?para=perro" className="rounded-full bg-crema-100 px-6 py-3 text-sm font-medium text-navy-500">Comprar para perro</Link>
              <Link href="/catalogo?para=gato" className="rounded-full bg-crema-100 px-6 py-3 text-sm font-medium text-navy-500">Comprar para gato</Link>
              <Link href="/catalogo" className="rounded-full border border-crema-100 px-6 py-3 text-sm text-crema-100">Ver todo</Link>
            </div>

            {/* Responde "¿me van a obligar a registrarme?" donde surge la duda,
                no tres pantallas más abajo. */}
            <p className="mt-6 text-[13px] font-light text-navy-100">
              <span className="font-medium text-dorado-300">
                {disponibles.length} productos disponibles en el catálogo
              </span>{" "}
              · Sin registro · Sin tarjeta · Confirmás por WhatsApp antes de pagar
            </p>
          </div>
        </div>
        <div className="franja-dorada" aria-hidden="true" />
      </section>

      {/* ── DOS PUERTAS ───────────────────────────────────────────────────
          Elemento firma de la portada. El porqué —y por qué no contradice a
          lib/navegacion.ts— está en components/PuertaEspecie.tsx. */}
      <section className="mx-auto max-w-contenido px-6 py-20">
        <h2 className="font-display text-headline text-navy-500">
          ¿Para quién comprás?
        </h2>
        <p className="mt-1.5 text-sm font-light text-navy-400">
          Es la primera pregunta que hacemos en el mostrador. Acá también.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {PUERTAS.map((p, i) => (
            <PuertaEspecie
              key={p.clave}
              nombre={p.nombre}
              conteo={conteoEspecie.get(p.clave) ?? 0}
              href={hrefEspecie(p.clave)}
              imagen={p.imagen}
              posicion={p.posicion}
              tinte={p.tinte}
              icono={p.icono}
              prioridad={i === 0}
            />
          ))}
        </div>

        {/* La aclaración va debajo y no escondida: sin ella los dos conteos
            suman más que el catálogo y el número parece inflado. */}
        <p className="mt-4 text-[13px] font-light text-navy-400">
          {ambas} productos sirven para los dos y aparecen en ambas listas.
        </p>

        <ul className="mt-7 flex flex-wrap gap-x-7 gap-y-2.5 border-t border-crema-400 pt-5">
          {categoriasConConteo.map((c) => (
            <li key={c.nombre}>
              <Link
                href={hrefCats([c.id])}
                className="text-sm text-navy-400 transition-colors hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
              >
                {c.nombre}{" "}
                <span className="font-medium text-dorado-700">{c.total}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── LA VITRINA ────────────────────────────────────────────────────── */}
      {vitrina.length > 0 && (
        <section className="border-y border-crema-300 bg-crema-200">
          <div className="mx-auto max-w-contenido px-6 py-20">
            <div className="mb-9 flex items-end justify-between gap-5">
              <div>
                <h2 className="font-display text-headline text-navy-500">La vitrina</h2>
                <p className="mt-1.5 text-sm font-light text-navy-400">
                  Lo que hay hoy en la tienda. Si aparece acá, está en existencia.
                </p>
              </div>
              <Link
                href="/catalogo"
                className="shrink-0 border-b border-crema-500 pb-1 text-sm text-navy-400 transition-colors hover:border-navy-300 hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
              >
                Ver los {disponibles.length}
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {vitrina.map((p, indice) => (
                <TarjetaProducto
                  key={p.sku}
                  producto={p}
                  cargaPrioritaria={indice === 0}
                  categoria={
                    p.categoria_id === null ? undefined : nombrePorId.get(p.categoria_id)
                  }
                />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/catalogo"
                className="inline-block rounded-full bg-navy-500 px-8 py-3.5 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
              >
                Ver el catálogo completo
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CÓMO COMPRAR ──────────────────────────────────────────────────
          Responde la duda más concreta que queda a esta altura: "no veo botón
          de pagar, ¿entonces cómo compro?". Una tienda sin pasarela tiene que
          explicar su mecánica o el visitante asume que está rota. */}
      <section className="mx-auto max-w-contenido px-6 py-20">
        <h2 className="font-display text-headline text-navy-500">Cómo comprar</h2>
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

      {/* ── LA TIENDA FÍSICA ──────────────────────────────────────────────
          Cierra la página en oscuro: entre esta banda y el hero queda todo lo
          transaccional sobre crema, que es la misma secuencia que la visita
          al local —fachada, interior claro, y otra vez oscuro al salir—.
          La dirección real es la señal de confianza más barata y más fuerte
          que tiene un comercio local. Solo se muestra si el dato existe: un
          "PENDIENTE" acá haría el efecto contrario. */}
      <section className="superficie-navy-plana">
        <div className="franja-dorada" aria-hidden="true" />
        <div className="mx-auto grid max-w-contenido gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-dorado-400">
              La tienda
            </p>
            <h2 className="mt-4 font-display text-[28px] font-light leading-tight text-crema-100 sm:text-[34px]">
              Visitá nuestra tienda en Heredia.
            </h2>
            <p className="mt-4 max-w-md text-[15px] font-light leading-relaxed text-navy-100">
              Vení a conocer los productos y consultanos antes de elegir.
              También podés retirar aquí tu pedido cuando te confirmemos que está listo.
            </p>
            <Link
              href="/contacto"
              className="mt-7 inline-block rounded-full bg-crema-100 px-8 py-3.5 text-sm font-medium text-navy-500 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-600"
            >
              Cómo llegar
            </Link>
          </div>

          <dl className="text-[14px]">
            {!faltante(negocio.direccion.linea) && (
              <div className="grid gap-1 border-t border-navy-400/35 py-4 sm:grid-cols-[132px_1fr] sm:gap-4">
                <dt className="text-[11px] uppercase tracking-[0.09em] text-dorado-300">
                  Dirección
                </dt>
                <dd className="font-light leading-relaxed text-crema-100">
                  {negocio.direccion.linea}, {negocio.direccion.canton},{" "}
                  {negocio.direccion.provincia}
                </dd>
              </div>
            )}
            {!faltante(negocio.horarioTexto) && (
              <div className="grid gap-1 border-t border-navy-400/35 py-4 sm:grid-cols-[132px_1fr] sm:gap-4">
                <dt className="text-[11px] uppercase tracking-[0.09em] text-dorado-300">
                  Horario
                </dt>
                <dd className="font-light text-crema-100">{negocio.horarioTexto}</dd>
              </div>
            )}
            {!faltante(negocio.telefonoVisible) && (
              <div className="grid gap-1 border-t border-navy-400/35 py-4 sm:grid-cols-[132px_1fr] sm:gap-4">
                <dt className="text-[11px] uppercase tracking-[0.09em] text-dorado-300">
                  Teléfono
                </dt>
                <dd className="font-light text-crema-100">{negocio.telefonoVisible}</dd>
              </div>
            )}
            <div className="grid gap-1 border-y border-navy-400/35 py-4 sm:grid-cols-[132px_1fr] sm:gap-4">
              <dt className="text-[11px] uppercase tracking-[0.09em] text-dorado-300">
                Retiro en tienda
              </dt>
              <dd className="font-light text-crema-100">Sin costo</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}

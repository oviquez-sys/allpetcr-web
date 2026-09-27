import Link from "next/link";
import Image from "next/image";
import { negocio, faltante, urlWhatsApp } from "@/lib/negocio";
import { FOTO_TIENDA } from "@/lib/contenidoInicio";
import { Flecha } from "./BloqueEditorial";

/**
 * LA TIENDA FÍSICA — rediseño del inicio, 26/09/2026.
 *
 * Lo que una tienda solo en línea no puede decir: hay un mostrador, alguien
 * que asesora y un lugar donde retirar. Todos los datos salen de
 * lib/negocio.ts (NAP idéntico al del pie y al esquema de Google).
 *
 * Deja de ser la banda navy de cierre: el pie ya es navy, y dos bandas
 * oscuras seguidas al final se leían como una sola pared. Pasa a crema, y el
 * navy queda como tinta y como botón.
 *
 * Sin FOTO_TIENDA la sección se ve completa igual: la columna derecha muestra
 * los datos de la tienda. Con foto, la foto toma esa columna y los datos
 * bajan a la izquierda.
 *
 * "Cómo llegar" abre la ficha de Google Maps de la tienda (el mismo enlace de
 * reseñas de lib/negocio.ts), que ya trae el botón de indicaciones. Construir
 * una ruta con la dirección escrita no sirve: "de la entrada de la UNA, 100 m
 * oeste" no es algo que Google sepa geolocalizar.
 */
export default function TiendaFisica() {
  const comoLlegar = faltante(negocio.resenasUrl) ? "/contacto" : negocio.resenasUrl;
  const externo = comoLlegar.startsWith("http");
  const whatsapp = urlWhatsApp("Hola, tengo una consulta antes de pasar por la tienda.");

  const datos = [
    !faltante(negocio.direccion.linea) && {
      titulo: "Dirección",
      texto: `${negocio.direccion.linea}, ${negocio.direccion.canton}, ${negocio.direccion.provincia}`,
    },
    !faltante(negocio.horarioTexto) && { titulo: "Horario", texto: negocio.horarioTexto },
    { titulo: "Retiro en tienda", texto: "Sin costo. Te avisamos cuando tu pedido está listo." },
  ].filter((d): d is { titulo: string; texto: string } => Boolean(d));

  const listaDatos = (
    <dl className="divide-y divide-crema-400 border-y border-crema-400 text-sm">
      {datos.map((d) => (
        <div key={d.titulo} className="grid gap-1 py-4 sm:grid-cols-[140px_1fr] sm:gap-4">
          <dt className="text-label font-medium uppercase text-dorado-700">{d.titulo}</dt>
          <dd className="font-light leading-relaxed text-navy-500">{d.texto}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <section id="tienda" className="scroll-mt-24 bg-crema-200">
      <div className="mx-auto grid max-w-contenido gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:py-28">
        <div className="flex flex-col justify-center">
          <p className="text-label font-medium uppercase text-dorado-700">La tienda</p>
          <h2 className="mt-4 font-display text-seccion text-navy-500">Nuestra tienda en Heredia</h2>
          <p className="mt-5 max-w-md text-[15px] font-light leading-relaxed text-navy-400">
            Vení a ver los productos en persona y preguntanos lo que
            necesités. También podés retirar ahí tu pedido.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={comoLlegar}
              {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex items-center gap-2.5 rounded-full bg-navy-500 px-7 py-3.5 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
            >
              Cómo llegar
              <Flecha className="h-4 w-4" />
            </Link>
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded text-sm font-medium text-navy-500 underline decoration-crema-500 underline-offset-[6px] transition-colors hover:decoration-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
              >
                Escribinos por WhatsApp
              </a>
            )}
          </div>
          {FOTO_TIENDA && <div className="mt-10">{listaDatos}</div>}
        </div>

        {FOTO_TIENDA ? (
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl sm:aspect-[4/3] lg:aspect-[4/5]">
            <Image
              src={FOTO_TIENDA.src}
              alt={FOTO_TIENDA.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex flex-col justify-center">{listaDatos}</div>
        )}
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import { negocio, direccionCompleta, urlWhatsApp } from "@/lib/negocio";

export const metadata = {
  // Sin sufijo manual: app/layout.tsx ya agrega " | AllPetcr.com" vía su template.
  title: "Sobre nosotros",
  description:
    "Somos Oscar y Francisco. AllPetcr.com es nuestra tienda de productos para perros y gatos en Heredia, " +
    "a 100 m de la entrada principal de la UNA. Comprá en la tienda o en línea y confirmá por WhatsApp.",
  alternates: { canonical: "/sobre-nosotros" },
};

/**
 * SOBRE NOSOTROS (28/10/2026). Segunda versión, reescrita como texto de marca
 * (la primera sonaba a ficha técnica): título que retoma «Ellos marcan el
 * plan» de la portada, los dueños con nombre, atención directa y selección
 * escogida. Datos reales:
 * los dos socios atienden la tienda, abrió en octubre de 2026 cerca de la
 * UNA, la selección es escogida (no "de todo") y se compra en tienda o en
 * línea con confirmación por WhatsApp. Oscar autorizó usar los nombres.
 * No agregar datos que no estén confirmados (años de experiencia, premios,
 * cantidad de clientes…): la página existe para dar confianza, y un dato
 * inventado la destruye.
 */
export default function SobreNosotrosPage() {
  const whatsapp = urlWhatsApp("Hola, les escribo desde allpetcr.com");
  return (
    <section className="mx-auto max-w-contenido px-6 py-16 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <div>
          <p className="text-label uppercase tracking-[0.14em] text-dorado-700">Sobre nosotros</p>
          <h1 className="mt-3 font-display text-headline leading-tight text-navy-500">
            Ellos marcan el plan. Nosotros nos encargamos del resto.
          </h1>
          <div className="mt-8 max-w-prose space-y-5 text-[16.5px] font-light leading-relaxed text-navy-400">
            <p>
              Somos Oscar y Francisco, los dueños de AllPetcr.com. Abrimos en octubre de 2026 en Heredia, a
              pocos pasos de la UNA.
            </p>
            <p>
              Tu perro o tu gato no espera: quiere su comida a tiempo, su juguete favorito y su paseo. Nuestro
              trabajo es que lo tengás sin complicarte.
            </p>
            <p>
              Aquí no te atiende un call center: somos nosotros los que te recibimos en la tienda, te
              contestamos el WhatsApp y armamos cada pedido. Cuando preguntás, te responde alguien que conoce
              lo que vende.
            </p>
            <p>
              Escogemos con cuidado lo que traemos para perros y gatos. Y si dudás entre dos productos,
              preguntanos: te vamos a recomendar el que le sirve a tu mascota.
            </p>
          </div>

          <div className="mt-10 rounded-card bg-crema-200 p-6 text-sm leading-relaxed text-navy-400">
            <p className="font-medium text-navy-500">Visitanos</p>
            <p className="mt-1">{direccionCompleta()}</p>
            <p className="mt-1">{negocio.horarioTexto}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="rounded-full bg-navy-500 px-6 py-3 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
              >
                Cómo llegar
              </Link>
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-crema-500 bg-white px-6 py-3 text-sm font-medium text-navy-500 transition-colors hover:border-navy-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
                >
                  Escribinos por WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="relative aspect-[16/11] overflow-hidden rounded-card bg-navy-500">
          <Image
            src="/portada/allpet-fachada-heredia.jpg"
            alt="Fachada de la tienda AllPetcr.com en Heredia, con su rótulo azul y la vitrina"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

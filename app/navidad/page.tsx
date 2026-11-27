import Link from "next/link";
import { cookies } from "next/headers";
import { connection } from "next/server";
import HeroCampana from "@/components/campana/HeroCampana";
import FormularioCampana from "@/components/campana/FormularioCampana";
import BeneficiosCampana from "@/components/campana/BeneficiosCampana";
import { leerCampana } from "@/lib/campanaServidor";
import { CAMPANA_IMPRESA, estadoCampana, fechaLarga } from "@/lib/campana";
import { COOKIE_RESULTADO_CAMPANA, googleConfigurado, limpiarFuente, verificar } from "@/lib/manada";
import { negocio } from "@/lib/negocio";

export const metadata = {
  title: "Sorteo de Navidad: ganate una canasta con 15 productos",
  description:
    "Registrate gratis y participá por una canasta con 15 productos para tu perro o tu gato. Sorteo el 24 de diciembre de 2026. Compras de más de ₡20.000 ganan doble puntaje.",
  alternates: { canonical: "/navidad" },
};

const ERRORES: Record<string, string> = {
  cancelado: "Cancelaste el ingreso con Google. Podés intentarlo de nuevo o llenar tus datos.",
  "sesion-vencida": "Pasó mucho tiempo o se abrió en otra pestaña. Probá de nuevo.",
  google: "Google no confirmó tu cuenta. Probá de nuevo o llená tus datos.",
  sistema: "No pudimos confirmar tu inscripción. Probá de nuevo: no se duplica.",
  cerrada: "Las inscripciones ya cerraron.",
  "google-no-disponible": "El ingreso con Google no está disponible ahora. Llená tus datos: es igual de rápido.",
  "falta-consentimiento": "Para participar tenés que aceptar la política de privacidad.",
  "falta-bases": "Para participar, marcá que aceptás las bases del sorteo.",
  "demasiados-intentos": "Demasiados intentos seguidos. Esperá unos minutos y probá de nuevo.",
  datos: "Algo salió mal con el formulario. Probá de nuevo.",
};

/**
 * /navidad — la página del sorteo (16/11/2026). Aquí llegan el botón de la
 * portada, la franja de arriba y los enlaces viejos de La manada (/manada
 * redirige acá mientras dure la campaña). Formulario y bases juntos: quien
 * se inscribe ve exactamente lo que acepta.
 */
export default async function NavidadPage({
  searchParams,
}: {
  searchParams: Promise<{ o?: string; error?: string; listo?: string }>;
}) {
  await connection();
  const { o, error } = await searchParams;
  const lectura = await leerCampana();
  const estado = estadoCampana(lectura);
  const c = lectura.erp;
  const sorteoEn = c?.sorteo_en ?? CAMPANA_IMPRESA.sorteo;
  const resultado = verificar<{ nombre?: string; numeros?: number; ya?: boolean; mascotaUrl?: string | null; bonoMascota?: string | null }>(
    (await cookies()).get(COOKIE_RESULTADO_CAMPANA)?.value,
  );

  if (estado === "ninguna") {
    return (
      <section className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="font-display text-headline text-navy-500">Sorteo de Navidad</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-navy-400">
          En este momento no tenemos un sorteo abierto. Pasá por la tienda o mirá los productos en la web.
        </p>
        <Link href="/catalogo" className="mt-8 inline-flex h-12 items-center rounded-full bg-navy-500 px-7 text-[15px] font-medium text-crema-100">
          Ver productos
        </Link>
      </section>
    );
  }

  return (
    <>
      <HeroCampana estado={estado} sorteoEn={sorteoEn} comoTitulo="h1" destinoRegistro="#registro" />

      <section id="registro" className="scroll-mt-24 bg-crema-100">
        <div className="mx-auto grid max-w-contenido gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-14">
          <div>
            {estado === "abierta" ? (
              <FormularioCampana
                fuente={limpiarFuente(o)}
                googleActivo={googleConfigurado()}
                comoLlegar={negocio.resenasUrl}
                fecha={fechaLarga(sorteoEn)}
                resultadoInicial={resultado ? {
                  nombre: resultado.nombre, numeros: resultado.numeros ?? null, ya: Boolean(resultado.ya),
                  mascotaUrl: resultado.mascotaUrl?.startsWith("/manada/mascota?t=") ? resultado.mascotaUrl : null,
                  bonoMascota: resultado.bonoMascota === "otorgado",
                } : null}
                errorInicial={error ? ERRORES[error] : undefined}
              />
            ) : (
              <div className="rounded-card bg-white p-7 ring-1 ring-crema-400">
                <p className="font-display text-bloque text-navy-500">
                  {estado === "finalizada" ? "Este sorteo finalizó" : "Las inscripciones cerraron"}
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-navy-400">
                  {estado === "finalizada"
                    ? "Gracias a todos los que participaron. Seguí atento a nuestras próximas promociones."
                    : `El sorteo es el ${fechaLarga(sorteoEn)}. Le avisamos a quien gane por WhatsApp o correo.`}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-10">
            {/* El premio (17/11/2026, decisión de Oscar): los productos los
                escoge la tienda; quien gana elige solo si la quiere para perro
                o para gato. Dicho aquí y en las bases, para que nadie espere
                escoger los productos que quiera. */}
            {estado !== "finalizada" && (
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wider text-navy-500">El premio</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-navy-400">
                  Una canasta con 15 productos <strong className="font-medium text-navy-500">escogidos por AllPetcr.com</strong>.
                  Si ganás, elegís si la querés en versión para perro o para gato. Los productos no se pueden cambiar
                  ni canjear por dinero.
                </p>
              </div>
            )}

            {estado !== "finalizada" && (
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wider text-navy-500">Cómo sumar más números</h2>
                <ol className="mt-4 space-y-2 text-[15px] leading-relaxed text-navy-400">
                  <li><strong className="font-medium text-navy-500">1.</strong> Registrarte te da 1 número.</li>
                  <li><strong className="font-medium text-navy-500">2.</strong> Cada compra en la tienda o en la web, ya registrado, te da 1 número más.</li>
                  <li><strong className="font-medium text-navy-500">3.</strong> Si la compra supera ₡20.000, te da otro número de bono.</li>
                  <li><strong className="font-medium text-navy-500">4.</strong> Contarnos de tu mascota (nombre, qué animal es y edad: perro, gato, conejo, hámster u otro) te da 1 número extra, una sola vez.</li>
                </ol>
                <div className="mt-5">
                  <BeneficiosCampana zonas={c?.envio_gratis?.zonas ?? []} />
                </div>
              </div>
            )}

            <div id="bases" className="scroll-mt-24">
              <h2 className="text-sm font-medium uppercase tracking-wider text-navy-500">Bases del sorteo</h2>
              {c?.bases ? (
                <div className="mt-4 max-h-[28rem] overflow-y-auto whitespace-pre-line rounded-card bg-white p-5 text-[14px] leading-relaxed text-navy-400 ring-1 ring-crema-400">
                  {c.bases}
                </div>
              ) : (
                <p className="mt-4 text-[14px] leading-relaxed text-navy-400">
                  No pudimos cargar las bases en este momento. Recargá la página en un rato o pedilas por
                  WhatsApp al {negocio.telefonoVisible}.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

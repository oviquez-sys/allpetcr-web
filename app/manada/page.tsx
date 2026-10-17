import FormularioManada from "@/components/manada/FormularioManada";
import { regaliaVigente } from "@/lib/regaliaPublica";
import { googleConfigurado, limpiarFuente } from "@/lib/manada";

export const metadata = {
  title: "Unite a la manada",
  description:
    "Registrate en la manada AllPetcr.com en 30 segundos y recibí un regalo de bienvenida para tu primera compra, en la tienda, por WhatsApp o en la web.",
  alternates: { canonical: "/manada" },
};

// Mensajes para cuando algo falla a la vuelta de Google. Escritos para quien
// está parado en la tienda con el celular: qué pasó y qué hacer, sin jerga.
const ERRORES: Record<string, string> = {
  cancelado: "Cancelaste el ingreso con Google. Podés intentarlo de nuevo o llenar tus datos abajo.",
  "sesion-vencida": "Pasó mucho tiempo o se abrió en otra pestaña. Tocá «Continuar con Google» otra vez.",
  google: "Google no confirmó tu cuenta. Probá de nuevo o llená tus datos abajo.",
  sistema: "No pudimos registrarte en este momento. Probá de nuevo en un rato, o llená tus datos abajo.",
  "google-no-disponible": "El ingreso con Google no está disponible ahora. Llená tus datos abajo: es igual de rápido.",
  "falta-consentimiento": "Para unirte tenés que aceptar la política de privacidad.",
  "demasiados-intentos": "Demasiados intentos seguidos. Esperá unos minutos y probá de nuevo.",
  datos: "Algo salió mal con el formulario. Probá de nuevo.",
};

export default async function ManadaPage({
  searchParams,
}: {
  searchParams: Promise<{ o?: string; error?: string }>;
}) {
  const { o, error } = await searchParams;
  const regalia = await regaliaVigente();
  const conRegalia = regalia?.activa && regalia.texto;

  return (
    <>
      <section className="superficie-navy text-crema-100">
        <div className="mx-auto max-w-xl px-6 pb-8 pt-8 text-center sm:pb-14 sm:pt-20">
          <p className="text-label uppercase text-dorado-300">La manada AllPetcr.com</p>
          <h1 className="mt-3 font-display text-hero">Unite a la manada</h1>
          {conRegalia ? (
            <p className="mx-auto mt-3 max-w-md text-lg font-light text-crema-200 sm:mt-5">
              Registrate en 30 segundos y llevate{" "}
              <strong className="font-medium text-crema-100">{regalia.texto?.replace(/(\d)\s%/g, "$1\u00a0%")}</strong>,
              en la tienda, por WhatsApp o en la web.
            </p>
          ) : (
            <p className="mx-auto mt-5 max-w-md text-lg font-light text-crema-200">
              Registrate en 30 segundos y enterate primero de lo nuevo para tu perro o tu gato.
            </p>
          )}
          {conRegalia && regalia.porcentaje && (
            <div
              aria-hidden="true"
              className="mx-auto mt-5 inline-flex items-baseline gap-1 rounded-card border border-dorado-500/40 px-6 py-3 sm:mt-8 sm:px-8 sm:py-4"
            >
              <span className="font-display text-[3.5rem] leading-none text-dorado-300">{regalia.porcentaje}</span>
              <span className="font-display text-2xl text-dorado-300">%</span>
              <span className="ml-3 text-left text-sm font-light leading-tight text-crema-200">
                en tu<br />primera compra
              </span>
            </div>
          )}
        </div>
        <div className="franja-dorada" />
      </section>

      <section id="registro" className="scroll-mt-20 bg-crema-100">
        <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-12">
          {error && ERRORES[error] && (
            <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {ERRORES[error]}
            </p>
          )}
          <FormularioManada fuente={limpiarFuente(o)} googleActivo={googleConfigurado()} />
          {/* Condiciones del beneficio junto al beneficio (auditoría F7-01,
              F6-02 y F12-03): dónde se usa, cuántas veces y si vence. Las
              decidieron los dueños el 16/10/2026: primera compra, en la
              tienda, por WhatsApp o en la web, y sin vencimiento (si la
              regalía del ERP tiene días de vigencia, se dicen aquí). */}
          {conRegalia && (
            <h2 className="mt-10 text-sm font-medium uppercase tracking-wider text-navy-500">
              Cómo usar tu {regalia.porcentaje ? `${regalia.porcentaje} %` : "regalo"}
            </h2>
          )}
          <ul className={`${conRegalia ? "mt-4" : "mt-10"} space-y-3 text-sm font-light text-navy-400`}>
            {conRegalia && (
              <>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dorado-500" aria-hidden="true" />
                  <span>
                    <strong className="font-medium text-navy-500">En la tienda:</strong> mostrás tu código en la caja,
                    o simplemente decís tu número de WhatsApp.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dorado-500" aria-hidden="true" />
                  <span>
                    <strong className="font-medium text-navy-500">En la web o por WhatsApp:</strong> escribí tu código
                    (o tu WhatsApp) en «Código de La manada» al confirmar el pedido, o en tu mensaje. Lo validamos y
                    te confirmamos el total con el descuento antes de que pagués.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dorado-500" aria-hidden="true" />
                  <span>
                    Aplica solo a tu primera compra y es de un solo uso por persona.
                    {regalia.dias_vigencia
                      ? ` Vale por ${regalia.dias_vigencia} días desde que te registrás.`
                      : " No vence."}
                  </span>
                </li>
              </>
            )}
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dorado-500" aria-hidden="true" />
              No te vamos a llenar de mensajes: solo te escribimos si nos das permiso.
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}

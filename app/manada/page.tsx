import FormularioManada from "@/components/manada/FormularioManada";
import { erpGet } from "@/lib/erpServidor";
import { googleConfigurado, limpiarFuente } from "@/lib/manada";

export const metadata = {
  title: "Unite a la manada",
  description:
    "Registrate en la manada AllPetcr.com con un clic y recibí un regalo de bienvenida para tu primera compra en la tienda.",
  alternates: { canonical: "/manada" },
};

interface Regalia {
  activa: boolean;
  porcentaje?: string;
  texto?: string;
  dias_vigencia?: number;
  /** false cuando el ERP no tiene servicio de correo: el registro por correo
   * no puede entregar el código, así que se esconde y queda solo Google. */
  correo_activo?: boolean;
}

// Mensajes para cuando algo falla a la vuelta de Google. Escritos para quien
// está parado en la tienda con el celular: qué pasó y qué hacer, sin jerga.
const ERRORES: Record<string, string> = {
  cancelado: "Cancelaste el ingreso con Google. Podés intentarlo de nuevo o registrarte con tu correo.",
  "sesion-vencida": "Pasó mucho tiempo o se abrió en otra pestaña. Tocá «Continuar con Google» otra vez.",
  google: "Google no confirmó tu cuenta. Probá de nuevo o registrate con tu correo.",
  sistema: "No pudimos registrarte en este momento. Probá de nuevo en un rato, o registrate con tu correo.",
  "google-no-disponible": "El ingreso con Google todavía no está activo. Registrate con tu correo: es igual de rápido.",
  "falta-consentimiento": "Para unirte tenés que aceptar la política de privacidad.",
  "demasiados-intentos": "Demasiados intentos seguidos. Esperá unos minutos y probá de nuevo.",
  datos: "Algo salió mal con el formulario. Probá de nuevo.",
};

async function regaliaVigente(): Promise<Regalia | null> {
  try {
    return await erpGet<Regalia>("/api/manada/regalia/");
  } catch {
    // Sin ERP la página igual funciona: solo no promete un porcentaje que no
    // puede confirmar.
    return null;
  }
}

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
        <div className="mx-auto max-w-xl px-6 pb-14 pt-14 text-center sm:pt-20">
          <p className="text-label uppercase text-dorado-300">La manada AllPetcr.com</p>
          <h1 className="mt-3 font-display text-hero">Unite a la manada</h1>
          {conRegalia ? (
            <p className="mx-auto mt-5 max-w-md text-lg font-light text-crema-200">
              Registrate con un clic y llevate{" "}
              <strong className="font-medium text-crema-100">{regalia.texto}</strong>.
            </p>
          ) : (
            <p className="mx-auto mt-5 max-w-md text-lg font-light text-crema-200">
              Registrate con un clic y enterate primero de lo nuevo para tu perro o tu gato.
            </p>
          )}
          {conRegalia && regalia.porcentaje && (
            <div
              aria-hidden="true"
              className="mx-auto mt-8 inline-flex items-baseline gap-1 rounded-card border border-dorado-500/40 px-8 py-4"
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
        <div className="mx-auto max-w-md px-6 py-12">
          {error && ERRORES[error] && (
            <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {ERRORES[error]}
            </p>
          )}
          <FormularioManada
            fuente={limpiarFuente(o)}
            googleActivo={googleConfigurado()}
            correoActivo={regalia?.correo_activo !== false}
          />
          <ul className="mt-10 space-y-3 text-sm font-light text-navy-400">
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dorado-500" aria-hidden="true" />
              Mostrás tu código en la caja y el descuento se aplica a toda la compra.
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dorado-500" aria-hidden="true" />
              Es de un solo uso por persona.
              {regalia?.dias_vigencia ? ` Vale por ${regalia.dias_vigencia} días desde que te registrás.` : ""}
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dorado-500" aria-hidden="true" />
              No te vamos a llenar el correo: solo te escribimos si nos das permiso.
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}

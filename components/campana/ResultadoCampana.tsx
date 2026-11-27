import Link from "next/link";
import IconoPin from "./IconoPin";
import { REFERENCIA_LOCAL } from "@/lib/campana";

/**
 * Lo que ve la persona cuando el ERP confirmó la inscripción. Solo se
 * muestra con la confirmación del ERP: nunca antes, aunque el formulario
 * «parezca» haberse enviado.
 */
export default function ResultadoCampana({
  nombre, numeros, yaParticipaba, comoLlegar, fecha, onOtraPersona,
  mascotaUrl = null, bonoMascota = false, sinDatos = false,
}: {
  nombre?: string;
  numeros: number | null;
  yaParticipaba: boolean;
  comoLlegar: string;
  fecha: string;
  onOtraPersona?: () => void;
  /** Enlace al formulario de la mascota: 1 número extra (17/11/2026). */
  mascotaUrl?: string | null;
  /** Ya ganó el número extra por su mascota. */
  bonoMascota?: boolean;
  /** Se sabe que participa solo por la cookie de este celular (no hay
   *  respuesta del ERP a mano, ni enlace de la mascota). */
  sinDatos?: boolean;
}) {
  const primerNombre = (nombre ?? "").trim().split(/\s+/)[0];
  return (
    <div role="status" aria-live="polite" className="rounded-card bg-white p-6 text-center shadow-sm ring-1 ring-crema-400 sm:p-8">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" className="text-emerald-700"><path d="m20 6-11 11-5-5" /></svg>
      </div>
      <p className="mt-4 font-display text-[1.75rem] leading-tight text-navy-500">¡Ya estás participando!</p>
      <p className="mt-2 text-[16px] leading-relaxed text-navy-400">
        {primerNombre ? `${primerNombre}, ` : ""}
        {yaParticipaba ? "ya estabas inscrito: no hace falta registrarte de nuevo." : "quedaste inscrito en el sorteo."}
        {numeros !== null && numeros > 0 && (
          <> Llevás <strong className="font-semibold text-navy-500">{numeros} {numeros === 1 ? "número" : "números"}</strong>.</>
        )}
      </p>
      <p className="mt-1 text-[14px] text-navy-400">Sorteo · {fecha}. Te avisamos por WhatsApp si ganás.</p>

      {/* Número extra por la mascota (decisión de Oscar, 17/11/2026): una
          vez por persona, con nombre, especie y edad; foto opcional. */}
      {mascotaUrl ? (
        <div className="mt-6 rounded-xl bg-emerald-50 p-5 text-left ring-1 ring-emerald-200">
          <p className="text-[16px] font-semibold text-emerald-900">🐾 Ganá 1 número extra</p>
          <p className="mt-1 text-[14.5px] leading-relaxed text-emerald-900/80">
            Contanos de tu mascota: cómo se llama, qué animal es y su edad. Perros, gatos, conejos, hámsters y demás. Tarda un minuto.
          </p>
          <Link href={mascotaUrl}
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-6 text-[15px] font-semibold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:w-auto">
            Registrar a mi mascota
          </Link>
        </div>
      ) : bonoMascota ? (
        <p className="mt-3 text-[14px] font-medium text-emerald-800">Incluye el número extra por tu mascota. 🐾</p>
      ) : sinDatos && onOtraPersona ? (
        <p className="mt-4 text-[14px] text-navy-400">
          ¿Te falta registrar a tu mascota para el número extra?{" "}
          <button type="button" onClick={onOtraPersona} className="font-medium text-navy-500 underline underline-offset-2">
            Volvé a poner tu nombre y WhatsApp
          </button>{" "}
          y te mostramos el enlace.
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/catalogo"
          className="inline-flex h-12 items-center justify-center rounded-full bg-navy-500 px-7 text-[15px] font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
          Ver productos
        </Link>
        <a href={comoLlegar} target="_blank" rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-navy-200 bg-white px-7 text-[15px] font-medium text-navy-500 transition-colors hover:border-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
          <IconoPin /> Cómo llegar
        </a>
      </div>
      <p className="mt-3 text-[14px] text-navy-400">Heredia centro: {REFERENCIA_LOCAL}.</p>

      {onOtraPersona && (
        <button type="button" onClick={onOtraPersona}
          className="mt-5 min-h-11 text-[14px] text-navy-400 underline underline-offset-4 hover:text-navy-500">
          Inscribir a otra persona
        </button>
      )}
    </div>
  );
}

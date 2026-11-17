"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ResultadoCampana from "./ResultadoCampana";
import { yaParticipaEnNavegador } from "@/lib/campana";

/**
 * Inscripción al sorteo (16/11/2026). Es el mismo registro de La manada
 * (nombre, WhatsApp, correo opcional, o Google), pensado para leerse sin
 * anteojos y tocarse con el pulgar: letra de 17 px y campos de 56 px.
 *
 * Diferencias con La manada:
 *  - casilla OBLIGATORIA «Acepto las bases», separada de la de promociones
 *    (el ERP rechaza la inscripción sin ella; la de promociones es opcional);
 *  - «¡Ya estás participando!» aparece solo cuando el ERP confirmó;
 *  - si la conexión falla, el botón pasa a «Reintentar» con los mismos
 *    datos. Reintentar no duplica: el ERP reconoce a la persona.
 */
interface Props {
  fuente: string;
  googleActivo: boolean;
  comoLlegar: string;
  fecha: string;
  /** Resultado al volver de Google (cookie firmada), si lo hay. */
  resultadoInicial?: { nombre?: string; numeros: number | null; ya: boolean } | null;
  /** Mensaje de error al volver de Google, si lo hay. */
  errorInicial?: string;
}

type Estado =
  | { tipo: "inicial" }
  | { tipo: "enviando" }
  | { tipo: "listo"; nombre?: string; numeros: number | null; ya: boolean }
  | { tipo: "error"; mensaje: string; reintentar: boolean; campo?: string }
  | { tipo: "cerrada"; mensaje: string };

const campo =
  "h-14 w-full rounded-xl border bg-white px-4 text-[17px] text-navy-500 outline-none transition-colors " +
  "placeholder:text-navy-200 focus-visible:border-navy-500 focus-visible:ring-2 focus-visible:ring-navy-500/30";
const rotulo = "mb-1.5 block text-[15px] font-medium text-navy-500";

function formatoTelefono(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 8);
  return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
}

export default function FormularioCampana({ fuente, googleActivo, comoLlegar, fecha, resultadoInicial, errorInicial }: Props) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [bases, setBases] = useState(false);
  const [promos, setPromos] = useState(false);
  const [estado, setEstado] = useState<Estado>(
    resultadoInicial ? { tipo: "listo", nombre: resultadoInicial.nombre, numeros: resultadoInicial.numeros, ya: resultadoInicial.ya }
      : errorInicial ? { tipo: "error", mensaje: errorInicial, reintentar: false } : { tipo: "inicial" },
  );
  const refResultado = useRef<HTMLDivElement>(null);
  // Si un intento falló sin respuesta y el reintento dice «ya participaba»,
  // fue el primer intento el que entró: para la persona es una inscripción
  // nueva, no «ya estabas inscrito».
  const huboFalla = useRef(false);

  // Quien ya se inscribió desde este celular ve la confirmación, con la
  // opción de inscribir a otra persona de la casa.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de una cookie al montar
    if (!resultadoInicial && !errorInicial && yaParticipaEnNavegador()) setEstado({ tipo: "listo", numeros: null, ya: true });
  }, [resultadoInicial, errorInicial]);

  useEffect(() => {
    if (estado.tipo === "listo") refResultado.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [estado.tipo]);

  async function participar(e?: React.FormEvent) {
    e?.preventDefault();
    if (estado.tipo === "enviando") return;
    if (!nombre.trim()) return setEstado({ tipo: "error", mensaje: "Escribí tu nombre.", reintentar: false, campo: "nombre" });
    if (telefono.replace(/\D/g, "").length !== 8) {
      return setEstado({ tipo: "error", mensaje: "Revisá tu WhatsApp: son 8 números.", reintentar: false, campo: "telefono" });
    }
    if (!bases) {
      return setEstado({ tipo: "error", mensaje: "Para participar, marcá que aceptás las bases del sorteo.", reintentar: false, campo: "bases" });
    }
    setEstado({ tipo: "enviando" });
    try {
      const r = await fetch("/api/campana/inscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono, email, acepta_bases: true, promos, fuente }),
        signal: AbortSignal.timeout(25000),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) {
        return setEstado({
          tipo: "listo", nombre, numeros: typeof d.numeros === "number" ? d.numeros : null,
          ya: Boolean(d.yaParticipaba) && !huboFalla.current,
        });
      }
      if (r.status === 409 || d.cerrada) return setEstado({ tipo: "cerrada", mensaje: d.error ?? "Las inscripciones ya cerraron." });
      if (r.status >= 500 || d.reintentar) huboFalla.current = true;
      setEstado({
        tipo: "error",
        mensaje: d.error ?? "No pudimos confirmar tu inscripción. Tocá «Reintentar»: no se duplica.",
        reintentar: r.status >= 500 || Boolean(d.reintentar),
        campo: d.campo,
      });
    } catch {
      huboFalla.current = true;
      setEstado({
        tipo: "error",
        mensaje: "Sin conexión. Revisá el internet del celular y tocá «Reintentar»: no se duplica.",
        reintentar: true,
      });
    }
  }

  if (estado.tipo === "listo") {
    return (
      <div ref={refResultado}>
        <ResultadoCampana nombre={estado.nombre} numeros={estado.numeros} yaParticipaba={estado.ya}
          comoLlegar={comoLlegar} fecha={fecha}
          onOtraPersona={() => { huboFalla.current = false; setNombre(""); setTelefono(""); setEmail(""); setBases(false); setPromos(false); setEstado({ tipo: "inicial" }); }} />
      </div>
    );
  }

  if (estado.tipo === "cerrada") {
    return (
      <div role="status" className="rounded-card bg-white p-7 text-center ring-1 ring-crema-400">
        <p className="font-display text-bloque text-navy-500">{estado.mensaje}</p>
        <Link href="/catalogo" className="mt-5 inline-flex h-12 items-center rounded-full bg-navy-500 px-7 text-[15px] font-medium text-crema-100">
          Ver productos
        </Link>
      </div>
    );
  }

  const enviando = estado.tipo === "enviando";
  const error = estado.tipo === "error" ? estado : null;
  const borde = (nombreCampo: string) => (error?.campo === nombreCampo ? "border-red-600" : "border-crema-500");

  return (
    <div className="rounded-card bg-white p-6 shadow-sm ring-1 ring-crema-400 sm:p-7">
      <p className="text-center font-display text-[1.45rem] leading-tight text-navy-500">Registrate para el sorteo</p>
      <p className="mt-1 text-center text-[14px] text-navy-400">Es gratis y no tenés que comprar nada.</p>

      <form onSubmit={participar} noValidate className="mt-6 space-y-5" aria-busy={enviando}>
        <div>
          <label htmlFor="campana-nombre" className={rotulo}>Tu nombre</label>
          <input id="campana-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
            autoComplete="name" autoCapitalize="words" maxLength={150} className={`${campo} ${borde("nombre")}`}
            aria-invalid={error?.campo === "nombre" || undefined} />
        </div>
        <div>
          <label htmlFor="campana-telefono" className={rotulo}>Tu WhatsApp</label>
          <input id="campana-telefono" value={telefono} onChange={(e) => setTelefono(formatoTelefono(e.target.value))}
            type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="8888-8888"
            className={`${campo} ${borde("telefono")}`} aria-invalid={error?.campo === "telefono" || undefined}
            aria-describedby="ayuda-campana-telefono" />
          <p id="ayuda-campana-telefono" className="mt-1.5 text-[13px] text-navy-400">
            Por aquí te avisamos si ganás. Si ya sos de La manada, usá el mismo número.
          </p>
        </div>
        <div>
          <label htmlFor="campana-email" className={rotulo}>
            Tu correo <span className="font-normal text-navy-400">(si querés)</span>
          </label>
          <input id="campana-email" value={email} onChange={(e) => setEmail(e.target.value)}
            type="email" inputMode="email" autoComplete="email" autoCapitalize="none" maxLength={254}
            placeholder="tu@correo.com" className={`${campo} ${borde("email")}`} />
        </div>

        <label className={`flex cursor-pointer items-start gap-3 rounded-lg p-1 text-[15px] leading-snug text-navy-500 ${error?.campo === "bases" ? "ring-2 ring-red-600" : ""}`}>
          <input type="checkbox" checked={bases} onChange={(e) => setBases(e.target.checked)}
            className="mt-0.5 h-6 w-6 shrink-0 accent-navy-500" aria-invalid={error?.campo === "bases" || undefined} />
          <span>Acepto las <a href="#bases" className="font-medium underline underline-offset-2">bases del sorteo</a></span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 p-1 text-[15px] leading-snug text-navy-500">
          <input type="checkbox" checked={promos} onChange={(e) => setPromos(e.target.checked)}
            className="mt-0.5 h-6 w-6 shrink-0 accent-navy-500" />
          <span>Quiero que me avisen de promociones por WhatsApp <span className="text-navy-400">(opcional)</span></span>
        </label>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-[15px] text-red-800">{error.mensaje}</p>
        )}

        <button type="submit" disabled={enviando}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-navy-500 text-[17px] font-semibold text-crema-100 transition-colors hover:bg-navy-600 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
          {enviando ? "Confirmando con la tienda…" : error?.reintentar ? "Reintentar" : "Participar en el sorteo"}
        </button>
      </form>

      {googleActivo && (
        <>
          <div className="my-6 flex items-center gap-3 text-[14px] text-navy-400" aria-hidden="true">
            <span className="h-px flex-1 bg-crema-400" />o<span className="h-px flex-1 bg-crema-400" />
          </div>
          <form method="post" action="/api/manada/google"
            onSubmit={(e) => {
              if (!bases) {
                e.preventDefault();
                setEstado({ tipo: "error", mensaje: "Para participar, marcá que aceptás las bases del sorteo.", reintentar: false, campo: "bases" });
              }
            }}>
            <input type="hidden" name="destino" value="campana" />
            <input type="hidden" name="fuente" value={fuente} />
            <input type="hidden" name="acepto" value="si" />
            {bases && <input type="hidden" name="acepta_bases" value="si" />}
            {promos && <input type="hidden" name="promos" value="si" />}
            {telefono && <input type="hidden" name="telefono" value={telefono} />}
            <button type="submit"
              className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-navy-200 bg-white text-[16px] font-medium text-navy-500 shadow-sm transition-colors hover:bg-crema-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
              Participar con Google
            </button>
          </form>
        </>
      )}

      <p className="mt-5 text-center text-[13px] leading-relaxed text-navy-400">
        Usamos tus datos para administrar el sorteo y tu registro en La manada. No los vendemos. Ver la{" "}
        <Link href="/privacidad#manada" target="_blank" className="font-medium text-navy-500 underline underline-offset-2">política de privacidad</Link>.
      </p>
    </div>
  );
}

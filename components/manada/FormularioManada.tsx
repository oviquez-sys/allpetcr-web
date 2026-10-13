"use client";

import Link from "next/link";
import { useRef, useState } from "react";

interface Props {
  fuente: string;
  googleActivo: boolean;
  correoActivo: boolean;
}

type Estado =
  | { tipo: "inicial" }
  | { tipo: "enviando" }
  | { tipo: "listo"; email: string; yaEraMiembro: boolean; cuponUsado: boolean; correoEnviado: boolean }
  | { tipo: "error"; mensaje: string };

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const campo =
  "w-full rounded-lg border border-crema-500 bg-white px-4 py-3 text-[16px] outline-none transition-colors " +
  "focus-visible:border-navy-500 focus-visible:ring-2 focus-visible:ring-navy-500/30";

/**
 * Un solo formulario con dos salidas:
 *  - «Continuar con Google»: envío normal del formulario a /api/manada/google,
 *    que redirige a Google. Sin fetch: el navegador sigue la redirección solo.
 *  - «Unirme con mi correo»: fetch a /api/manada/registro. El código llega al
 *    correo, no a la pantalla.
 * La casilla de privacidad es obligatoria para las dos; la de promociones es
 * opcional y nace sin marcar (la ley pide consentimiento expreso, no supuesto).
 */
export default function FormularioManada({ fuente, googleActivo, correoActivo }: Props) {
  const formulario = useRef<HTMLFormElement>(null);
  const [conCorreo, setConCorreo] = useState(!googleActivo);
  const [estado, setEstado] = useState<Estado>({ tipo: "inicial" });

  // Ni Google ni correo disponibles: mejor decirlo que mostrar un
  // formulario que no va a entregar nada.
  if (!googleActivo && !correoActivo) {
    return (
      <p className="rounded-card border border-crema-400 bg-white p-6 text-center text-[15px] font-light text-navy-400">
        El registro se habilita en unos días. Mientras tanto, pedí tu regalo de bienvenida en la caja.
      </p>
    );
  }

  async function unirmeConCorreo() {
    const f = formulario.current;
    if (!f) return;
    const datos = new FormData(f);
    const nombre = String(datos.get("nombre") ?? "").trim();
    const email = String(datos.get("email") ?? "").trim();
    if (!nombre) return setEstado({ tipo: "error", mensaje: "Escribí tu nombre." });
    if (!CORREO_VALIDO.test(email)) return setEstado({ tipo: "error", mensaje: "Revisá el correo: no parece válido." });
    if (datos.get("acepto") !== "si") {
      return setEstado({ tipo: "error", mensaje: "Para unirte tenés que aceptar la política de privacidad." });
    }
    setEstado({ tipo: "enviando" });
    try {
      const r = await fetch("/api/manada/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre, email,
          telefono: String(datos.get("telefono") ?? ""),
          acepto: true,
          promos: datos.get("promos") === "si",
          fuente,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setEstado({ tipo: "error", mensaje: d.error ?? "No pudimos registrarte. Probá de nuevo." });
      setEstado({
        tipo: "listo", email,
        yaEraMiembro: Boolean(d.yaEraMiembro), cuponUsado: Boolean(d.cuponUsado), correoEnviado: d.correoEnviado !== false,
      });
    } catch {
      setEstado({ tipo: "error", mensaje: "Sin conexión. Revisá el internet del celular y probá de nuevo." });
    }
  }

  if (estado.tipo === "listo") {
    return (
      <div role="status" className="rounded-card border border-crema-400 bg-white p-6 text-center">
        <p className="text-label uppercase text-dorado-700">{estado.yaEraMiembro ? "Ya eras parte" : "¡Bienvenido a la manada!"}</p>
        <p className="mt-3 font-display text-bloque text-navy-500">Revisá tu correo</p>
        <p className="mt-3 text-[15px] font-light leading-relaxed text-navy-400">
          {estado.cuponUsado
            ? <>Tu cupón de bienvenida ya se usó. Igual te mandamos un correo a <strong className="font-medium text-navy-500">{estado.email}</strong>.</>
            : estado.correoEnviado
              ? <>Te mandamos tu código a <strong className="font-medium text-navy-500">{estado.email}</strong>. Mostralo en la caja cuando hagás tu compra.</>
              : <>Quedaste registrado, pero el correo no salió. Pedí tu código en la caja con tu correo <strong className="font-medium text-navy-500">{estado.email}</strong>.</>}
        </p>
        <p className="mt-4 text-[13px] text-navy-300">¿No te llega? Revisá la carpeta de spam o «Promociones».</p>
      </div>
    );
  }

  const enviando = estado.tipo === "enviando";

  return (
    <form ref={formulario} method="post" action="/api/manada/google" className="space-y-5" noValidate={conCorreo}>
      <input type="hidden" name="fuente" value={fuente} />

      <div>
        <label htmlFor="manada-telefono" className="mb-1.5 block text-sm text-navy-500">
          WhatsApp <span className="text-navy-300">(opcional)</span>
        </label>
        <input id="manada-telefono" name="telefono" type="tel" inputMode="tel" autoComplete="tel"
          placeholder="8888-8888" maxLength={16} className={campo} />
      </div>

      {conCorreo && (
        <>
          <div>
            <label htmlFor="manada-nombre" className="mb-1.5 block text-sm text-navy-500">Tu nombre</label>
            <input id="manada-nombre" name="nombre" autoComplete="name" maxLength={150} className={campo} />
          </div>
          <div>
            <label htmlFor="manada-email" className="mb-1.5 block text-sm text-navy-500">Tu correo</label>
            <input id="manada-email" name="email" type="email" inputMode="email" autoComplete="email"
              maxLength={254} placeholder="tu@correo.com" className={campo} />
          </div>
        </>
      )}

      <div className="space-y-3 pt-1">
        <label className="flex items-start gap-3 text-[14px] leading-snug text-navy-500">
          <input type="checkbox" name="acepto" value="si" required className="mt-0.5 h-5 w-5 shrink-0 accent-navy-500" />
          <span>
            Acepto la{" "}
            <Link href="/privacidad#manada" target="_blank" className="underline underline-offset-2">
              política de privacidad
            </Link>
            .
          </span>
        </label>
        <label className="flex items-start gap-3 text-[14px] leading-snug text-navy-400">
          <input type="checkbox" name="promos" value="si" className="mt-0.5 h-5 w-5 shrink-0 accent-navy-500" />
          <span>Quiero recibir promociones y novedades por correo o WhatsApp.</span>
        </label>
      </div>

      {estado.tipo === "error" && (
        <p role="alert" className="text-sm text-red-700">{estado.mensaje}</p>
      )}

      {conCorreo ? (
        <button type="button" onClick={unirmeConCorreo} disabled={enviando}
          className="w-full rounded-full bg-navy-500 px-6 py-3.5 text-[15px] font-medium text-crema-100 transition-colors hover:bg-navy-600 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
          {enviando ? "Registrando…" : "Unirme a la manada"}
        </button>
      ) : (
        <button type="submit"
          className="flex w-full items-center justify-center gap-3 rounded-full border border-navy-200 bg-white px-6 py-3.5 text-[15px] font-medium text-navy-500 shadow-sm transition-colors hover:bg-crema-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          Continuar con Google
        </button>
      )}

      {googleActivo && correoActivo && (
        <p className="text-center text-sm text-navy-400">
          {conCorreo ? (
            <button type="button" onClick={() => { setConCorreo(false); setEstado({ tipo: "inicial" }); }}
              className="underline underline-offset-2 hover:text-navy-500">
              Mejor con mi cuenta de Google
            </button>
          ) : (
            <button type="button" onClick={() => { setConCorreo(true); setEstado({ tipo: "inicial" }); }}
              className="underline underline-offset-2 hover:text-navy-500">
              No tengo Google: registrarme con mi correo
            </button>
          )}
        </p>
      )}
    </form>
  );
}

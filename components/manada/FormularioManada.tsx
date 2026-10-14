"use client";

import Link from "next/link";
import { useState } from "react";

interface Props {
  fuente: string;
  googleActivo: boolean;
}

type Estado =
  | { tipo: "inicial" }
  | { tipo: "enviando" }
  | { tipo: "yaEra"; cuponUsado: boolean; sinRegalia: boolean }
  | { tipo: "error"; mensaje: string };

/**
 * Registro a la manada (rediseño 14/10/2026, pedido de Oscar).
 *
 * Lo que pasó en la tienda: mucha gente —sobre todo mayor— no se acuerda del
 * correo ni de la contraseña de Google y se quedaba trabada. Ahora:
 *
 *  1. Arriba, «Continuar con Google» para quien lo tiene a mano: un toque y
 *     listo, no escribe nada.
 *  2. Abajo, tres campos grandes: nombre, WhatsApp y correo OPCIONAL. Nada de
 *     contraseñas ni códigos de verificación; el regalo sale en pantalla.
 *
 * Letra de 17 px, campos de 56 px de alto y teclado numérico para el
 * WhatsApp: está pensado para leerse sin anteojos y tocarse con el pulgar.
 * El consentimiento es el propio botón («Al tocar el botón aceptás…»), no una
 * casilla escondida que, si se olvida, deja a la persona sin saber qué falló.
 */
const campo =
  "h-14 w-full rounded-xl border border-crema-500 bg-white px-4 text-[17px] text-navy-500 outline-none transition-colors " +
  "placeholder:text-navy-200 focus-visible:border-navy-500 focus-visible:ring-2 focus-visible:ring-navy-500/30";
const rotulo = "mb-1.5 block text-[15px] font-medium text-navy-500";

/** 88881234 → 8888-1234 mientras se escribe: más fácil de revisar. */
function formatoTelefono(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 8);
  return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
}

function LogoGoogle() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default function FormularioManada({ fuente, googleActivo }: Props) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [promos, setPromos] = useState(false);
  const [estado, setEstado] = useState<Estado>({ tipo: "inicial" });

  async function unirme(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return setEstado({ tipo: "error", mensaje: "Escribí tu nombre." });
    if (telefono.replace(/\D/g, "").length !== 8) {
      return setEstado({ tipo: "error", mensaje: "Revisá tu WhatsApp: son 8 números." });
    }
    setEstado({ tipo: "enviando" });
    try {
      const r = await fetch("/api/manada/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono, email, acepto: true, promos, fuente }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setEstado({ tipo: "error", mensaje: d.error ?? "No pudimos registrarte. Probá de nuevo." });
      if (d.ir) {
        window.location.assign(d.ir);
        return;
      }
      setEstado({ tipo: "yaEra", cuponUsado: Boolean(d.cuponUsado), sinRegalia: Boolean(d.sinRegalia) });
    } catch {
      setEstado({ tipo: "error", mensaje: "Sin conexión. Revisá el internet del celular y probá de nuevo." });
    }
  }

  if (estado.tipo === "yaEra") {
    return (
      <div role="status" className="rounded-card bg-white p-7 text-center ring-1 ring-crema-400">
        <p className="text-[40px] leading-none" aria-hidden="true">🐾</p>
        <p className="mt-3 font-display text-bloque text-navy-500">¡Ya sos parte de la manada!</p>
        <p className="mt-3 text-[16px] leading-relaxed text-navy-400">
          {estado.cuponUsado
            ? "Tu regalo de bienvenida ya lo usaste. ¡Gracias por volver!"
            : estado.sinRegalia
              ? "Te vamos a contar primero de lo nuevo para tu peludo."
              : <>Tu regalo te espera: en la caja <strong className="font-medium text-navy-500">decí tu número de WhatsApp</strong> y listo.</>}
        </p>
      </div>
    );
  }

  const enviando = estado.tipo === "enviando";

  return (
    <div className="rounded-card bg-white p-6 shadow-sm ring-1 ring-crema-400 sm:p-7">
      {googleActivo && (
        <>
          <form method="post" action="/api/manada/google">
            <input type="hidden" name="fuente" value={fuente} />
            <input type="hidden" name="acepto" value="si" />
            {promos && <input type="hidden" name="promos" value="si" />}
            <button type="submit"
              className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-navy-200 bg-white text-[16px] font-medium text-navy-500 shadow-sm transition-colors hover:bg-crema-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
              <LogoGoogle />
              Continuar con Google
            </button>
          </form>
          <p className="mt-2 text-center text-[13px] text-navy-300">Un toque y listo, sin escribir nada.</p>

          <div className="my-6 flex items-center gap-3 text-[14px] text-navy-300" aria-hidden="true">
            <span className="h-px flex-1 bg-crema-400" />
            o con tus datos
            <span className="h-px flex-1 bg-crema-400" />
          </div>
        </>
      )}

      <form onSubmit={unirme} noValidate className="space-y-5">
        <div>
          <label htmlFor="manada-nombre" className={rotulo}>Tu nombre</label>
          <input id="manada-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
            autoComplete="name" autoCapitalize="words" maxLength={150} className={campo} />
        </div>
        <div>
          <label htmlFor="manada-telefono" className={rotulo}>Tu WhatsApp</label>
          <input id="manada-telefono" value={telefono} onChange={(e) => setTelefono(formatoTelefono(e.target.value))}
            type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="8888-8888" className={campo} />
        </div>
        <div>
          <label htmlFor="manada-email" className={rotulo}>
            Tu correo <span className="font-normal text-navy-300">(si querés)</span>
          </label>
          <input id="manada-email" value={email} onChange={(e) => setEmail(e.target.value)}
            type="email" inputMode="email" autoComplete="email" autoCapitalize="none" maxLength={254}
            placeholder="tu@correo.com" className={campo} />
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-snug text-navy-500">
          <input type="checkbox" checked={promos} onChange={(e) => setPromos(e.target.checked)}
            className="mt-0.5 h-6 w-6 shrink-0 accent-navy-500" />
          <span>Quiero que me avisen de promociones por WhatsApp</span>
        </label>

        {estado.tipo === "error" && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-[15px] text-red-800">{estado.mensaje}</p>
        )}

        <button type="submit" disabled={enviando}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-navy-500 text-[17px] font-medium text-crema-100 transition-colors hover:bg-navy-600 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
          {enviando ? "Un momento…" : <><span aria-hidden="true">🐾</span> Unirme a la manada</>}
        </button>
      </form>

      <p className="mt-4 text-center text-[13px] leading-relaxed text-navy-300">
        Al unirte aceptás nuestra{" "}
        <Link href="/privacidad#manada" target="_blank" className="underline underline-offset-2">política de privacidad</Link>.
        No compartimos tus datos.
      </p>
    </div>
  );
}

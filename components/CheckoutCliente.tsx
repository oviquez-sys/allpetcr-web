"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useCarrito, resolverCarrito } from "@/lib/carrito";
import { formatoColones, presentacionVisible } from "@/lib/formato";
import { negocio, urlWhatsApp, faltante } from "@/lib/negocio";
import type { Producto } from "@/lib/types";

type Entrega = "retiro" | "coordinar";

interface Errores {
  nombre?: string;
  telefono?: string;
}

/**
 * Confirmación de pedido.
 *
 * Por qué WhatsApp y no una pasarela de pago: cobrar en línea exige cuenta de
 * comercio, definición fiscal (el régimen simplificado no emite factura
 * electrónica) y manejo de datos de tarjeta. Nada de eso está resuelto, y
 * simularlo sería peor que no ofrecerlo. WhatsApp es además el canal donde el
 * cliente costarricense ya está, y deja al comercio confirmar existencias
 * antes de comprometerse.
 *
 * El pedido se arma como texto legible: quien lo reciba en la tienda tiene que
 * poder leerlo sin descifrar códigos.
 */
export default function CheckoutCliente({ productos }: { productos: Producto[] }) {
  const { lineas, vaciar, listo } = useCarrito();
  const { items, total } = useMemo(
    () => resolverCarrito(lineas, productos),
    [lineas, productos],
  );

  const comprables = items.filter((i) => i.producto && i.producto.disponible);
  const totalComprable = comprables.reduce((s, i) => s + i.subtotal, 0);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [entrega, setEntrega] = useState<Entrega>("retiro");
  const [nota, setNota] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [enviado, setEnviado] = useState(false);
  const refNombre = useRef<HTMLInputElement>(null);
  const refTelefono = useRef<HTMLInputElement>(null);

  const sinWhatsApp = faltante(negocio.whatsapp);

  // Devuelve los errores directamente en vez de solo actualizar el estado:
  // `enviar` necesita saber YA, en el mismo tick, cuál campo falló para
  // moverle el foco. Leer el DOM (`querySelector('[aria-invalid=true]')`)
  // justo después de `setErrores` no servía — React aplica el estado antes
  // de repintar, no antes de que termine esta función, así que el atributo
  // todavía no existía en el DOM cuando se lo buscaba.
  function validar(): Errores {
    const e: Errores = {};
    if (nombre.trim().length < 3) e.nombre = "Escribí tu nombre completo.";
    // Costa Rica: 8 dígitos. Se aceptan espacios y guiones al escribir.
    const soloDigitos = telefono.replace(/\D/g, "");
    if (soloDigitos.length < 8) e.telefono = "El teléfono debe tener 8 dígitos.";
    return e;
  }

  function textoPedido(): string {
    const l: string[] = ["*Pedido desde allpetcr.com*", ""];
    for (const i of comprables) {
      const p = i.producto!;
      // Sin el empaque de bodega: "1 × Alimentador (Paquete: 12 / Caja: 216)"
      // llega a la tienda pareciendo un pedido de doce unidades. Acá la
      // confusión no es cosmética, termina en un pedido mal armado.
      const pres = presentacionVisible(p.presentacion);
      l.push(`• ${i.cantidad} × ${p.nombre}${pres ? ` (${pres})` : ""} — ${formatoColones(i.subtotal)}`);
    }
    l.push("", `*Total: ${formatoColones(totalComprable)}*`, "");
    l.push(`Nombre: ${nombre.trim()}`);
    l.push(`Teléfono: ${telefono.trim()}`);
    l.push(entrega === "retiro" ? "Entrega: retiro en tienda" : "Entrega: coordinar envío");
    if (nota.trim()) l.push(`Nota: ${nota.trim()}`);
    return l.join("\n");
  }

  function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length > 0) {
      // Llevar el foco al primer campo con error (WCAG 3.3.1), por ref y no
      // por consulta al DOM: la ref apunta al input real sin depender de que
      // React ya haya repintado aria-invalid.
      if (e.nombre) refNombre.current?.focus();
      else if (e.telefono) refTelefono.current?.focus();
      return;
    }
    const url = urlWhatsApp(textoPedido());
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    setEnviado(true);
    vaciar();
  }

  if (!listo) {
    return (
      <div className="mx-auto max-w-contenido px-6 py-20">
        <div className="h-8 w-52 animate-pulse rounded bg-crema-300" />
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="mx-auto max-w-contenido px-6 py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-dorado-100">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
              className="text-dorado-600" aria-hidden="true">
              <path d="m20 6-11 11-5-5" />
            </svg>
          </div>
          <h1 className="mt-7 font-display text-headline text-navy-500">
            Pedido enviado
          </h1>
          <p className="mt-3 text-[15px] font-light leading-relaxed text-navy-400">
            Se abrió WhatsApp con tu pedido. Si no se abrió, escribinos
            directamente y te lo confirmamos.
          </p>
          <p className="mt-2 text-sm font-light text-navy-400">
            Te confirmamos existencias y el total antes de preparar todo.
          </p>
          <Link
            href="/catalogo"
            className="mt-8 inline-block rounded-full bg-navy-500 px-8 py-3.5 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
          >
            Seguir viendo productos
          </Link>
        </div>
      </div>
    );
  }

  if (comprables.length === 0) {
    return (
      <div className="mx-auto max-w-contenido px-6 py-24 text-center">
        <h1 className="font-display text-headline text-navy-500">
          No hay nada que pedir
        </h1>
        <p className="mt-3 text-[15px] font-light text-navy-400">
          Tu carrito está vacío o los productos ya no están disponibles.
        </p>
        <Link
          href="/catalogo"
          className="mt-8 inline-block rounded-full bg-navy-500 px-8 py-3.5 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  const claseCampo =
    "mt-2 w-full rounded-lg border bg-crema-100 px-4 py-3 text-[15px] text-navy-500 outline-none transition-colors focus:border-navy-400 focus-visible:ring-2 focus-visible:ring-navy-500";

  return (
    <div className="mx-auto max-w-contenido px-6 py-12">
      <nav aria-label="Ruta" className="text-xs text-navy-400">
        <Link href="/carrito" className="rounded hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500">
          Carrito
        </Link>
        <span className="px-2">/</span>
        <span className="text-navy-400">Confirmar pedido</span>
      </nav>

      <h1 className="mt-4 font-display text-headline text-navy-500">
        Confirmar pedido
      </h1>

      {sinWhatsApp && (
        <div role="alert" className="mt-6 rounded-card border border-dorado-400 bg-dorado-50 px-5 py-4 text-sm text-dorado-900">
          <strong className="font-semibold">Falta configurar el WhatsApp del negocio.</strong>{" "}
          Completá <code className="font-mono text-[12.5px]">whatsapp</code> en{" "}
          <code className="font-mono text-[12.5px]">lib/negocio.ts</code> para que el
          pedido se pueda enviar.
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <form onSubmit={enviar} noValidate>
          <fieldset>
            <legend className="text-sm font-medium uppercase tracking-wider text-navy-400">
              Tus datos
            </legend>

            <div className="mt-5">
              <label htmlFor="nombre" className="block text-sm text-navy-500">
                Nombre completo <span className="text-dorado-700" aria-hidden="true">*</span>
              </label>
              <input
                id="nombre"
                ref={refNombre}
                type="text"
                autoComplete="name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                aria-required="true"
                aria-invalid={errores.nombre ? "true" : undefined}
                aria-describedby={errores.nombre ? "err-nombre" : undefined}
                className={`${claseCampo} ${errores.nombre ? "border-red-600" : "border-crema-400"}`}
              />
              {errores.nombre && (
                <p id="err-nombre" role="alert" className="mt-1.5 text-[13px] text-red-700">
                  {errores.nombre}
                </p>
              )}
            </div>

            <div className="mt-5">
              <label htmlFor="telefono" className="block text-sm text-navy-500">
                Teléfono <span className="text-dorado-700" aria-hidden="true">*</span>
              </label>
              <input
                id="telefono"
                ref={refTelefono}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="8888-7777"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                aria-required="true"
                aria-invalid={errores.telefono ? "true" : undefined}
                aria-describedby={errores.telefono ? "err-telefono" : "ayuda-telefono"}
                className={`${claseCampo} ${errores.telefono ? "border-red-600" : "border-crema-400"}`}
              />
              {errores.telefono ? (
                <p id="err-telefono" role="alert" className="mt-1.5 text-[13px] text-red-700">
                  {errores.telefono}
                </p>
              ) : (
                <p id="ayuda-telefono" className="mt-1.5 text-[12.5px] text-navy-400">
                  Para confirmarte el pedido.
                </p>
              )}
            </div>
          </fieldset>

          <fieldset className="mt-9">
            <legend className="text-sm font-medium uppercase tracking-wider text-navy-400">
              Entrega
            </legend>
            <div className="mt-4 space-y-3">
              {([
                ["retiro", "Retiro en tienda", "Sin costo. Te avisamos cuando esté listo."],
                ["coordinar", "Coordinar envío", "Lo conversamos por WhatsApp según tu zona."],
              ] as const).map(([valor, titulo, detalle]) => (
                <label
                  key={valor}
                  className={`flex cursor-pointer gap-3 rounded-card border p-4 transition-colors ${
                    entrega === valor ? "border-navy-400 bg-white" : "border-crema-400 hover:border-navy-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="entrega"
                    value={valor}
                    checked={entrega === valor}
                    onChange={() => setEntrega(valor)}
                    className="mt-1 h-4 w-4 shrink-0 accent-navy-500"
                  />
                  <span>
                    <span className="block text-[15px] text-navy-500">{titulo}</span>
                    <span className="mt-0.5 block text-[13px] font-light text-navy-400">
                      {detalle}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-9">
            <label htmlFor="nota" className="block text-sm text-navy-500">
              Nota para el pedido <span className="text-navy-400">(opcional)</span>
            </label>
            <textarea
              id="nota"
              rows={3}
              maxLength={300}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Alguna preferencia, marca alternativa, horario para retirar…"
              className={`${claseCampo} resize-none border-crema-400`}
            />
          </div>

          <button
            type="submit"
            disabled={sinWhatsApp}
            className="mt-8 w-full rounded-full bg-navy-500 py-4 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-crema-400 disabled:text-navy-300 lg:w-auto lg:px-12"
          >
            Enviar pedido por WhatsApp
          </button>
          <p className="mt-3 text-[12.5px] font-light text-navy-400">
            No se cobra nada en línea. Confirmamos existencias y total antes de
            preparar el pedido.
          </p>
        </form>

        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-card border border-crema-400 bg-white p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-navy-400">
              Tu pedido
            </h2>
            <ul className="mt-5 space-y-3">
              {comprables.map((i) => (
                <li key={i.sku} className="flex justify-between gap-3 text-sm">
                  <span className="text-navy-400">
                    <span className="text-navy-400">{i.cantidad} ×</span> {i.producto!.nombre}
                  </span>
                  <span className="shrink-0 text-navy-500">{formatoColones(i.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-baseline justify-between border-t border-crema-400 pt-5">
              <span className="text-sm font-medium text-navy-500">Total</span>
              <span className="text-[26px] font-medium text-navy-500">
                {formatoColones(totalComprable)}
              </span>
            </div>
            <Link
              href="/carrito"
              className="mt-5 block rounded text-center text-xs text-navy-400 underline underline-offset-2 hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
            >
              Modificar el carrito
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

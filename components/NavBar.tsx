"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCarrito } from "@/lib/carrito";
import Marca from "./Marca";
import IconoCategoria from "./IconoCategoria";
import { negocio, urlWhatsApp } from "@/lib/negocio";
import type { SeccionNav } from "@/lib/navegacion";

/**
 * ENCABEZADO
 *
 * Las decisiones de aquí salen de mirar cómo resuelven el problema las
 * tiendas grandes —Chewy en particular— pero ajustadas a un catálogo de 184
 * productos, no de cien mil. Copiar a Chewy sin ajustar la escala sería un
 * error: buena parte de sus decisiones existen porque su catálogo es
 * inabarcable, y este no lo es.
 *
 * ── POR QUÉ EL BUSCADOR OCUPA EL CENTRO Y ES GRANDE
 * Quien escribe en el buscador ya sabe qué quiere: es el tráfico con más
 * intención de compra del sitio y el que menos pasos necesita para llegar al
 * carrito. Chewy le da el espacio dominante del encabezado por eso, y aquí
 * aplica igual: escribir "arena" es más rápido que navegar dos niveles.
 *
 * ── POR QUÉ UN MEGA MENÚ Y NO UN DESPLEGABLE SIMPLE
 * Un menú de un nivel obliga a hacer clic para descubrir qué hay dentro. El
 * mega menú enseña la profundidad del catálogo sin navegar, y eso baja el
 * costo de exploración. Solo lo llevan las secciones que agrupan varias
 * categorías reales; poner una flecha en una sección sin hijos sería mentir
 * sobre lo que hay detrás.
 *
 * ── POR QUÉ NO HAY LIBRERÍA DE MENÚ
 * Esto son dos estados de React y CSS. Radix o Headless UI serían ~15 KB
 * comprimidos en la ruta crítica para resolver algo que el navegador ya sabe
 * hacer. El encabezado se pinta en todas las páginas: es el peor sitio para
 * agregar peso.
 *
 * ── POR QUÉ LA BARRA SUPERIOR DICE LO QUE DICE
 * El costo de envío es la primera objeción del comercio electrónico
 * costarricense. Enunciar "retiro en tienda sin costo" antes de que el
 * visitante vea un solo precio desactiva la fricción por adelantado. Misma
 * lógica del "Free shipping over $49" de Chewy, con una promesa que este
 * negocio sí puede cumplir.
 */

function IconoBuscar({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export default function NavBar({ navegacion }: { navegacion: SeccionNav[] }) {
  const { unidades, listo } = useCarrito();
  const [abierto, setAbierto] = useState(false);
  const [megaAbierto, setMegaAbierto] = useState<string | null>(null);
  const ruta = usePathname();
  const botonMenu = useRef<HTMLButtonElement>(null);
  const cierreDiferido = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cerrar al navegar. Se ajusta durante el render comparando la ruta previa
  // en vez de en un efecto: así no hay un fotograma con el menú abierto
  // encima de la página nueva.
  const [rutaPrevia, setRutaPrevia] = useState(ruta);
  if (ruta !== rutaPrevia) {
    setRutaPrevia(ruta);
    if (abierto) setAbierto(false);
    if (megaAbierto) setMegaAbierto(null);
  }

  // Escape cierra lo que esté abierto y devuelve el foco (WCAG 2.1.2).
  useEffect(() => {
    if (!abierto && !megaAbierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (megaAbierto) {
        document.getElementById(`menu-boton-${megaAbierto}`)?.focus();
        setMegaAbierto(null);
      }
      if (abierto) {
        setAbierto(false);
        botonMenu.current?.focus();
      }
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [abierto, megaAbierto]);

  useEffect(() => {
    return () => {
      if (cierreDiferido.current) clearTimeout(cierreDiferido.current);
    };
  }, []);

  // Un retardo corto al salir evita que el panel se cierre cuando el cursor
  // cruza el hueco entre el botón y el panel. Sin esto el menú parpadea, que
  // es el defecto clásico de los mega menús mal hechos.
  const abrirMega = (id: string) => {
    if (cierreDiferido.current) clearTimeout(cierreDiferido.current);
    setMegaAbierto(id);
  };
  const cerrarMega = () => {
    if (cierreDiferido.current) clearTimeout(cierreDiferido.current);
    cierreDiferido.current = setTimeout(() => setMegaAbierto(null), 140);
  };

  // Rediseño 26/09/2026: el buscador sigue siempre a la vista —es el tráfico
  // con más intención de compra (ver arriba)— pero pierde el botón navy con
  // texto. El envío con Enter ya existía; el botón queda como ícono de 44px
  // para quien toca en vez de teclear. Sigue siendo un <form> GET sin JS.
  const buscador = (id: string) => (
    <form
      action="/catalogo"
      role="search"
      className="flex items-center gap-2 rounded-full border border-transparent bg-crema-200 py-0.5 pl-4 pr-0.5 transition-colors focus-within:border-navy-200 focus-within:bg-white"
    >
      <label htmlFor={id} className="sr-only">
        Buscar productos
      </label>
      <input
        id={id}
        type="search"
        name="q"
        placeholder="Buscar productos…"
        className="w-full min-w-0 rounded bg-transparent text-sm text-navy-500 placeholder:text-navy-400 focus-visible:outline-none"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy-500 transition-colors hover:bg-crema-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
      >
        <IconoBuscar />
      </button>
    </form>
  );

  const enlaceBarra =
    "rounded underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado-400";
  const whatsapp = urlWhatsApp("Hola, les escribo desde allpetcr.com");
  const enlaceMovil =
    "block rounded-lg px-2 py-3 text-[15px] text-navy-500 transition-colors hover:bg-crema-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500";

  return (
    <>
      {/* BARRA SUPERIOR — rediseño 26/09/2026. Una sola línea de 12px con
          tres datos verificables: la tienda existe, el retiro no cuesta y los
          envíos cubren la GAM. "Repetir pedido" y "Contacto" pasan acá en
          escritorio: son tareas de quien ya compró, no de quien explora, y
          en la fila principal le quitaban aire al menú. En móvil siguen
          dentro del menú desplegable. */}
      <div className="bg-navy-500 text-[12px] font-light text-crema-200">
        <div className="mx-auto flex max-w-contenido items-center justify-center gap-6 px-6 py-1.5 lg:justify-between">
          <p>
            Tienda en Heredia · Retiro sin costo
            <span className="hidden sm:inline"> · Envíos en la GAM</span>
          </p>
          <ul className="hidden items-center gap-5 lg:flex">
            {whatsapp && (
              <li>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={enlaceBarra}>
                  WhatsApp {negocio.telefonoVisible}
                </a>
              </li>
            )}
            <li>
              <Link href="/recompra" className={enlaceBarra}>
                Repetir pedido
              </Link>
            </li>
            <li>
              <Link href="/contacto" className={enlaceBarra}>
                Contacto
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-crema-300 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-contenido px-4 sm:px-6">
          {/* Una sola fila en escritorio: logo · menú · buscador · carrito.
              La segunda fila que había antes llevaba el encabezado a ~130px;
              con tres secciones de menú caben todas en la misma línea. */}
          <div className="flex h-16 items-center gap-3 sm:gap-6 lg:h-[72px]">
            <button
              ref={botonMenu}
              type="button"
              onClick={() => setAbierto((v) => !v)}
              aria-expanded={abierto}
              aria-controls="menu-movil"
              aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
              className="-ml-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy-500 transition-colors hover:bg-crema-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 lg:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                {abierto ? (
                  <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>
                ) : (
                  <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>
                )}
              </svg>
            </button>

            {/* El logo real, en línea en el HTML: cero peticiones de red y
                cero salto de diseño en la ruta crítica. */}
            <Link
              href="/"
              aria-label="AllPetcr.com — ir al inicio"
              className="shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
            >
              <Marca variante="horizontal" decorativo className="h-6 w-auto sm:h-7" />
            </Link>

            {/* Menú de escritorio con mega menú. Mismos datos y misma lógica
                que antes (lib/navegacion.ts); solo cambió dónde se pinta. */}
            <nav aria-label="Categorías" className="hidden lg:block" onClick={(e) => {
              if ((e.target as Element).closest("a")) setMegaAbierto(null);
            }}>
              <ul className="flex items-center">
                {navegacion.map((seccion) => {
                  const tieneHijos = seccion.grupos.length > 0;
                  const desplegado = megaAbierto === seccion.id;
                  return (
                    <li
                      key={seccion.id}
                      className="relative flex items-center"
                      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setMegaAbierto(null); }}
                      onMouseEnter={() => tieneHijos && abrirMega(seccion.id)}
                      onMouseLeave={cerrarMega}
                    >
                      <Link
                        href={seccion.href}
                        className={`rounded-lg py-2.5 pl-3 text-[14.5px] font-medium text-navy-500 transition-colors hover:text-dorado-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 ${tieneHijos ? "pr-0.5" : "pr-3"}`}
                      >
                        {seccion.label}
                      </Link>
                      {tieneHijos && (
                        <button
                          type="button"
                          id={`menu-boton-${seccion.id}`}
                          aria-label={`Categorías de ${seccion.label}`}
                          aria-expanded={desplegado}
                          aria-controls={`submenu-${seccion.id}`}
                          onClick={() => setMegaAbierto(desplegado ? null : seccion.id)}
                          className="grid min-h-11 min-w-9 place-items-center rounded-lg text-navy-400 transition-colors hover:text-navy-500 focus-visible:ring-2 focus-visible:ring-navy-500"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
                            className={`transition-transform duration-200 motion-reduce:transition-none ${desplegado ? "rotate-180" : ""}`}>
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                      )}

                      {tieneHijos && desplegado && (
                        <div
                          id={`submenu-${seccion.id}`}
                          onMouseEnter={() => abrirMega(seccion.id)}
                          onMouseLeave={cerrarMega}
                          className="absolute left-0 top-full z-50 w-max min-w-[270px] rounded-card border border-crema-300 bg-white p-3 shadow-[0_16px_48px_rgba(9,46,94,0.12)]"
                        >
                          <ul className="space-y-0.5">
                            {seccion.grupos.map((g) => (
                              <li key={g.href + g.label}>
                                <Link
                                  href={g.href}
                                  className="block rounded-lg px-3 py-2 text-sm text-navy-400 transition-colors hover:bg-crema-200 hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                                >
                                  {g.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <Link
                            href={seccion.href}
                            className="mt-2 block border-t border-crema-300 px-3 pt-3 text-xs font-medium text-dorado-700 transition-colors hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                          >
                            Ver todo en {seccion.label} →
                          </Link>
                        </div>
                      )}
                    </li>
                  );
                })}
                <li>
                  <Link
                    href="/catalogo"
                    className="rounded-lg px-3 py-2.5 text-[14.5px] font-medium text-navy-500 transition-colors hover:text-dorado-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                  >
                    Todo
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="ml-auto hidden w-full max-w-xs sm:block lg:max-w-[300px]">{buscador("buscar-esc")}</div>

            <Link
              href="/carrito"
              className="relative ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy-500 transition-colors hover:bg-crema-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 sm:ml-0"
              aria-label={
                listo && unidades > 0
                  ? `Carrito, ${unidades} ${unidades === 1 ? "artículo" : "artículos"}`
                  : "Carrito, vacío"
              }
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {/* Solo tras hidratar: si el servidor pinta un número y el
                  cliente lo cambia, hay desajuste de hidratación. */}
              {listo && unidades > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-[19px] min-w-[19px] place-items-center rounded-full bg-dorado-500 px-1 text-[10.5px] font-semibold text-navy-700">
                  {unidades > 99 ? "99+" : unidades}
                </span>
              )}
            </Link>
          </div>

          {/* Buscador móvil: ancho completo, fuera de la fila apretada. */}
          <div className="pb-3 sm:hidden">{buscador("buscar-mov")}</div>
        </div>

        {/* Menú móvil: lista con las subcategorías indentadas. Un acordeón
            anidado agregaría estado y un toque extra sin beneficio real con
            este número de categorías. */}
        {abierto && (
          <nav
            id="menu-movil"
            onClick={(e) => { if ((e.target as Element).closest("a")) setAbierto(false); }}
            aria-label="Categorías"
            className="max-h-[calc(100dvh-8rem)] overflow-y-auto overscroll-contain border-t border-crema-300 bg-white lg:hidden"
          >
            <ul className="mx-auto max-w-contenido px-4 py-3 sm:px-6">
              {navegacion.map((seccion) => (
                <li key={seccion.id} className="border-b border-crema-300 py-1 last:border-0">
                  {/* Icono solo en móvil: en una lista vertical ayuda a
                      escanear sin leer. En escritorio se omite a propósito. */}
                  <Link
                    href={seccion.href}
                    className="flex items-center gap-3 rounded-lg px-2 py-3 text-[17px] font-medium text-navy-500 transition-colors hover:bg-crema-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                  >
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-crema-200 text-navy-400"
                      aria-hidden="true"
                    >
                      <IconoCategoria nombre={seccion.id} className="h-4 w-4" />
                    </span>
                    {seccion.label}
                  </Link>
                  {seccion.grupos.length > 0 && (
                    <details>
                    <summary className="cursor-pointer rounded-lg px-5 py-3 text-sm text-navy-500">Ver categorías de {seccion.label.toLowerCase()}</summary>
                    <ul className="pb-1.5">
                      {seccion.grupos.map((g) => (
                        <li key={g.href + g.label}>
                          <Link
                            href={g.href}
                            className="block rounded-lg py-2.5 pl-5 pr-2 text-sm font-light text-navy-400 transition-colors hover:bg-crema-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                          >
                            {g.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    </details>
                  )}
                </li>
              ))}
              <li className="pt-1">
                <Link href="/catalogo" className={enlaceMovil}>
                  Todo el catálogo
                </Link>
                <Link href="/recompra" className={enlaceMovil}>
                  Repetir pedido
                </Link>
                <Link href="/contacto" className={enlaceMovil}>
                  Contacto
                </Link>
                {whatsapp && (
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={enlaceMovil}>
                    WhatsApp {negocio.telefonoVisible}
                  </a>
                )}
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}

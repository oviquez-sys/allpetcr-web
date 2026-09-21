import type { ReactNode } from "react";

/**
 * Esqueleto común de las páginas legales (términos, privacidad).
 *
 * Mismo estilo que /devoluciones: título, fecha de vigencia visible arriba
 * (la ley pide que el cliente sepa qué versión aceptó) y secciones numeradas
 * con ancla propia, para poder enlazar "#retracto" desde otro lado.
 */
export function PaginaLegal({
  etiqueta,
  titulo,
  vigencia,
  children,
}: {
  etiqueta: string;
  titulo: string;
  vigencia: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <p className="text-label uppercase text-dorado-700">{etiqueta}</p>
      <h1 className="font-display text-headline leading-tight text-navy-500">{titulo}</h1>
      <p className="mt-4 text-sm text-navy-400">
        Vigente desde el {vigencia}. Podés guardar o imprimir esta página desde tu navegador.
      </p>
      <div className="mt-10 space-y-10 text-[16px] font-light leading-relaxed text-navy-400">{children}</div>
    </section>
  );
}

export function Seccion({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-titulo`} id={id} className="scroll-mt-24">
      <h2 id={`${id}-titulo`} className="font-display text-title text-navy-500">
        {titulo}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function Lista({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5">{children}</ul>;
}

export const enlaceLegal = "underline underline-offset-2 hover:text-navy-500";

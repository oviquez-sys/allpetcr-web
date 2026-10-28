"use client";

import { urlWhatsApp } from "@/lib/negocio";

/**
 * Pantalla cuando una página no se puede armar (por ejemplo, el ERP no
 * responde). 28/10/2026: además de reintentar, ofrece WhatsApp, que funciona
 * aunque el sitio o el sistema estén caídos: el cliente que quería comprar
 * tiene por dónde seguir y la venta no se pierde.
 */
export default function ErrorPagina({ reset }: { reset: () => void }) {
  const whatsapp = urlWhatsApp(
    "Hola, quise hacer un pedido en allpetcr.com pero la página no cargó. ¿Me pueden ayudar por aquí?",
  );
  return (
    <section className="mx-auto max-w-contenido px-6 py-20">
      <h1 className="font-display text-headline text-navy-500">No pudimos cargar esta página</h1>
      <p role="alert" className="mt-4 max-w-prose text-navy-400">
        Intentá nuevamente en unos momentos. Los productos guardados en tu carrito se conservan.
        {whatsapp && " Si preferís, escribinos por WhatsApp y te atendemos por ahí."}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-navy-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
        >
          Volver a intentar
        </button>
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-crema-500 px-6 py-3 text-sm font-medium text-navy-500 transition-colors hover:border-navy-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
          >
            Escribir por WhatsApp
          </a>
        )}
      </div>
    </section>
  );
}

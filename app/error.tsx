"use client";

export default function ErrorPagina({ reset }: { reset: () => void }) {
  return <section className="mx-auto max-w-contenido px-6 py-20">
    <h1 className="font-display text-headline text-navy-500">No pudimos cargar esta página</h1>
    <p role="alert" className="mt-4 text-navy-400">Intentá nuevamente en unos momentos. Los productos guardados en tu carrito se conservan.</p>
    <button onClick={reset} className="mt-6 rounded-full bg-navy-500 px-6 py-3 text-white">Volver a intentar</button>
  </section>;
}

import Link from "next/link";

export const metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

export default function NoEncontrada() {
  return (
    <div className="mx-auto max-w-contenido px-6 py-24">
      <div className="mx-auto max-w-md text-center">
        <p className="font-display text-[64px] font-light leading-none text-crema-500">404</p>
        <h1 className="mt-4 font-display text-[32px] font-light text-navy-500">
          No encontramos esta página
        </h1>
        <p className="mt-3 text-[15px] font-light leading-relaxed text-navy-400">
          Puede que el enlace esté viejo o que el producto ya no esté en el
          catálogo.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/catalogo"
            className="rounded-full bg-navy-500 px-8 py-3.5 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
          >
            Ver catálogo
          </Link>
          <Link
            href="/"
            className="rounded-full border border-crema-500 px-8 py-3.5 text-sm font-medium text-navy-400 transition-colors hover:border-navy-300 hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

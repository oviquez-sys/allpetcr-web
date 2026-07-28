import Link from "next/link";

// Solo las categorías raíz. Alimento y Snacks viven como subcategorías
// dentro de Perros/Gatos (ver data/categorias.json) y aparecen al entrar,
// no como items separados en este menú.
const categorias = [
  { href: "/catalogo?c=perros", label: "Perros" },
  { href: "/catalogo?c=gatos", label: "Gatos" },
  { href: "/catalogo?c=higiene", label: "Higiene" },
  { href: "/catalogo?c=accesorios", label: "Accesorios" },
];

export default function NavBar() {
  return (
    <>
      <div className="bg-navy-500 px-6 py-2 text-center text-xs text-crema-200">
        Envíos en todo Costa Rica · Retiro en tienda sin costo
      </div>

      <header className="sticky top-0 z-50 border-b border-crema-400 bg-crema-100/95 backdrop-blur">
        <div className="mx-auto max-w-contenido px-6">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 py-5">
            <Link href="/" className="whitespace-nowrap font-display text-2xl text-navy-500">
              All<span className="text-dorado-500">Pet</span>
            </Link>

            <form
              action="/catalogo"
              className="order-3 flex w-full flex-1 items-center gap-3 rounded-full border border-crema-400 bg-crema-200 px-5 py-3 sm:order-none sm:w-auto"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0 text-navy-200"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="search"
                name="q"
                placeholder="Buscar alimento, juguetes, arena…"
                aria-label="Buscar productos"
                className="w-full bg-transparent text-sm text-navy-500 outline-none placeholder:text-navy-200"
              />
            </form>

            <div className="ml-auto flex items-center gap-6 whitespace-nowrap text-sm text-navy-400">
              <Link href="/contacto" className="transition-colors hover:text-navy-500">
                Contacto
              </Link>
              <Link href="/carrito" className="relative transition-colors hover:text-navy-500">
                Carrito
                <span className="absolute -right-3 -top-2 grid h-[17px] w-[17px] place-items-center rounded-full bg-dorado-500 text-[10px] font-semibold text-dorado-900">
                  0
                </span>
              </Link>
            </div>
          </div>

          <nav aria-label="Categorías">
            <ul className="flex gap-7 overflow-x-auto pb-4 text-sm text-navy-400">
              {categorias.map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="whitespace-nowrap transition-colors hover:text-navy-500"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}

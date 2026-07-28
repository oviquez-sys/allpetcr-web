import Link from "next/link";

const columnas = [
  {
    titulo: "Comprar",
    enlaces: [
      { href: "/catalogo?c=perros", label: "Perros" },
      { href: "/catalogo?c=gatos", label: "Gatos" },
      { href: "/catalogo?c=alimento", label: "Alimento" },
      { href: "/catalogo", label: "Todo el catálogo" },
    ],
  },
  {
    titulo: "Ayuda",
    enlaces: [
      { href: "/contacto", label: "Contacto" },
      { href: "/contacto", label: "Envíos y retiro" },
      { href: "/contacto", label: "Devoluciones" },
    ],
  },
  {
    titulo: "Nosotros",
    enlaces: [
      { href: "/sobre-nosotros", label: "Sobre AllPet" },
      { href: "/contacto", label: "Nuestra tienda" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy-500 text-crema-200">
      <div className="mx-auto max-w-contenido px-6 py-16">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl text-white">
              All<span className="text-dorado-400">Pet</span>
            </p>
            <p className="mt-3 max-w-xs text-sm font-light leading-relaxed text-navy-100">
              Productos para perros y gatos en Costa Rica. Tienda física,
              atención honesta.
            </p>
          </div>

          {columnas.map((col) => (
            <div key={col.titulo}>
              <h2 className="text-sm font-medium text-white">{col.titulo}</h2>
              <ul className="mt-3 space-y-2 text-sm font-light text-navy-100">
                {col.enlaces.map((e, i) => (
                  <li key={`${e.href}-${i}`}>
                    <Link href={e.href} className="transition-colors hover:text-white">
                      {e.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 border-t border-navy-400/40 pt-6 text-xs text-navy-200">
          © {new Date().getFullYear()} AllPetcr · Cédula jurídica 3-101-999999 ·
          Régimen de Tributación Simplificada
        </p>
      </div>
    </footer>
  );
}

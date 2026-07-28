import Link from "next/link";
import { negocio, direccionCompleta, faltante } from "@/lib/negocio";

// El enlace "Alimento" apuntaba a /catalogo?c=alimento, y no existe ninguna
// categoría raíz con ese nombre: el filtro se ignoraba en silencio y el
// visitante veía el catálogo completo sin entender por qué. Se cambió por
// categorías que sí existen en data/categorias.json.
const columnas = [
  {
    titulo: "Comprar",
    enlaces: [
      { href: "/catalogo?c=perros", label: "Perros" },
      { href: "/catalogo?c=gatos", label: "Gatos" },
      { href: "/catalogo?c=higiene", label: "Higiene" },
      { href: "/catalogo?c=accesorios", label: "Accesorios" },
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
  const direccion = direccionCompleta();
  const enlace =
    "rounded transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-500";

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

            {/* NAP (nombre, dirección, teléfono). Es la señal principal del
                posicionamiento local, y debe ser idéntica en todas partes:
                por eso sale de lib/negocio.ts y no está escrita a mano. */}
            <address className="mt-5 space-y-1.5 text-sm font-light not-italic text-navy-100">
              {direccion && <p>{direccion}</p>}
              {!faltante(negocio.telefonoVisible) && (
                <p>
                  <a href={`tel:${String(negocio.telefonoVisible).replace(/\D/g, "")}`} className={enlace}>
                    {negocio.telefonoVisible}
                  </a>
                </p>
              )}
              {!faltante(negocio.correo) && (
                <p>
                  <a href={`mailto:${negocio.correo}`} className={enlace}>
                    {negocio.correo}
                  </a>
                </p>
              )}
              {!faltante(negocio.horarioTexto) && <p>{negocio.horarioTexto}</p>}
            </address>
          </div>

          {columnas.map((col) => (
            <div key={col.titulo}>
              <h2 className="text-sm font-medium text-white">{col.titulo}</h2>
              <ul className="mt-3 space-y-2 text-sm font-light text-navy-100">
                {col.enlaces.map((e, i) => (
                  <li key={`${e.href}-${i}`}>
                    <Link href={e.href} className={enlace}>
                      {e.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 border-t border-navy-400/40 pt-6 text-xs text-navy-200">
          © {new Date().getFullYear()} {negocio.nombreLegal}
          {!faltante(negocio.cedulaJuridica) && ` · Cédula jurídica ${negocio.cedulaJuridica}`}
          {` · ${negocio.regimen}`}
        </p>
      </div>
    </footer>
  );
}

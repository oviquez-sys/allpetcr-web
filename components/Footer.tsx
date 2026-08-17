import Link from "next/link";
import { negocio, direccionCompleta, faltante } from "@/lib/negocio";
import { navegacion } from "@/lib/navegacion";
import Marca from "./Marca";

// Los enlaces de "Comprar" salen de lib/navegacion.ts, no escritos a mano.
//
// Antes apuntaban a /catalogo?c=perros, ?c=gatos, ?c=higiene y ?c=accesorios:
// ninguna de esas categorías existe en data/categorias.json, así que el filtro
// se ignoraba en silencio y el visitante veía el catálogo completo sin
// entender por qué. El comentario anterior decía que ya se había corregido —
// no era así, solo se cambió un nombre inexistente por otros cuatro.
//
// Compartir la fuente con el encabezado hace que el error no pueda repetirse:
// si un enlace se rompe, se rompe en un solo lugar y se nota.
const columnas = [
  {
    titulo: "Comprar",
    enlaces: [
      ...navegacion.map((s) => ({ href: s.href, label: s.label })),
      { href: "/catalogo", label: "Todo el catálogo" },
    ],
  },
  {
    // Antes había tres enlaces ("Contacto", "Envíos y retiro",
    // "Devoluciones") apuntando los tres a /contacto: tres promesas de
    // contenido distinto que llevaban al mismo formulario genérico. Uno solo,
    // honesto sobre a dónde lleva, en vez de simular tres páginas que no
    // existen.
    titulo: "Ayuda",
    enlaces: [{ href: "/contacto", label: "Contacto" }],
  },
  {
    titulo: "Nosotros",
    enlaces: [{ href: "/sobre-nosotros", label: "Sobre AllPet" }],
  },
];

export default function Footer() {
  const direccion = direccionCompleta();
  const enlace =
    "rounded transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-600";

  return (
    <footer className="superficie-navy-plana text-crema-200">
      <div className="franja-dorada" aria-hidden="true" />
      <div className="mx-auto max-w-contenido px-6 py-16">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            {/* Sobre navy, el azul del logo desaparecería y el dorado solo
                quedaría flotando. La versión monocroma resuelve el contraste
                sin inventar una variante de marca que no existe. */}
            <Marca variante="horizontal" monocromo className="h-7 w-auto text-white" />
            <p className="mt-4 max-w-xs text-sm font-light leading-relaxed text-navy-100">
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

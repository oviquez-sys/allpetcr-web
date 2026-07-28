import { negocio, direccionCompleta, faltante, urlWhatsApp } from "@/lib/negocio";

export const metadata = {
  title: "Contacto",
  description:
    "Escribinos por WhatsApp o visitanos en la tienda. Estamos para ayudarte a " +
    "elegir lo que tu perro o gato realmente necesita.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  const direccion = direccionCompleta();
  const wa = urlWhatsApp("Hola, quiero hacer una consulta.");
  const telDigitos = String(negocio.telefonoVisible).replace(/\D/g, "");
  const mapa =
    negocio.direccion.lat !== null && negocio.direccion.lng !== null
      ? `https://www.google.com/maps?q=${negocio.direccion.lat},${negocio.direccion.lng}&hl=es&z=16&output=embed`
      : direccion
        ? `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&hl=es&z=16&output=embed`
        : null;

  const filas = [
    { rotulo: "WhatsApp", valor: negocio.telefonoVisible, href: wa || undefined, externo: true },
    { rotulo: "Teléfono", valor: negocio.telefonoVisible, href: telDigitos ? `tel:${telDigitos}` : undefined },
    { rotulo: "Correo", valor: negocio.correo, href: !faltante(negocio.correo) ? `mailto:${negocio.correo}` : undefined },
    { rotulo: "Dirección", valor: direccion || negocio.direccion.linea },
    { rotulo: "Horario", valor: negocio.horarioTexto },
  ];

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-[38px] font-light leading-tight text-navy-500">
        Contacto
      </h1>
      <p className="mt-3 text-[16.5px] font-light text-navy-400">
        Escribinos por WhatsApp o visitanos en la tienda. Te ayudamos a elegir
        lo que tu mascota realmente necesita.
      </p>

      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-navy-500 px-8 py-3.5 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.25 8.24a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24m4.52 10.34c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14 0-.3-.02-.47-.02-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.29" />
          </svg>
          Escribinos por WhatsApp
        </a>
      )}

      <dl className="mt-12 divide-y divide-crema-400 border-y border-crema-400">
        {filas.map((f) => (
          <div key={f.rotulo} className="py-5">
            <dt className="text-[10.5px] uppercase tracking-[0.09em] text-dorado-700">
              {f.rotulo}
            </dt>
            <dd className="mt-1.5 text-lg font-light text-navy-500">
              {faltante(f.valor) ? (
                <span className="text-navy-300">Por confirmar</span>
              ) : f.href ? (
                <a
                  href={f.href}
                  {...(f.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="rounded transition-colors hover:text-dorado-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                >
                  {f.valor}
                </a>
              ) : (
                f.valor
              )}
            </dd>
          </div>
        ))}
      </dl>

      {mapa && (
        <div className="mt-10 overflow-hidden rounded-card border border-crema-400">
          <iframe
            src={mapa}
            title="Ubicación de la tienda AllPet"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[320px] w-full border-0"
          />
        </div>
      )}
    </section>
  );
}

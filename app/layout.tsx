import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AvisoConfiguracion from "@/components/AvisoConfiguracion";
import { ProveedorCarrito } from "@/lib/carrito";
import { negocio, faltante } from "@/lib/negocio";

const titulo = "AllPet Costa Rica | Productos para perros y gatos";
const descripcion =
  "Alimento, accesorios e higiene para perros y gatos en Costa Rica. " +
  "Tienda física, asesoría honesta y precios claros. Retiro en tienda sin costo.";

export const metadata: Metadata = {
  // Sin metadataBase, Next no puede resolver las URLs absolutas que necesitan
  // las vistas previas al compartir (WhatsApp, Facebook) ni las canónicas.
  metadataBase: new URL(negocio.sitioUrl),
  title: { default: titulo, template: "%s | AllPet" },
  description: descripcion,
  applicationName: "AllPet",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CR",
    url: negocio.sitioUrl,
    siteName: "AllPet",
    title: titulo,
    description: descripcion,
  },
  twitter: { card: "summary_large_image", title: titulo, description: descripcion },
  robots: { index: true, follow: true },
  formatDetection: { telephone: true },
};

/** Datos estructurados del negocio: es lo que permite a Google mostrar la
 *  tienda en el mapa y en el panel lateral. Solo se emiten los campos que
 *  están completos — publicar un esquema con datos inventados es peor que no
 *  publicarlo. */
function esquemaNegocio() {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "PetStore",
    name: negocio.nombre,
    description: descripcion,
    url: negocio.sitioUrl,
    currenciesAccepted: "CRC",
    areaServed: { "@type": "Country", name: "Costa Rica" },
  };
  if (!faltante(negocio.telefonoVisible)) base.telephone = negocio.telefonoVisible;
  if (!faltante(negocio.correo)) base.email = negocio.correo;
  if (!faltante(negocio.direccion.linea)) {
    base.address = {
      "@type": "PostalAddress",
      streetAddress: negocio.direccion.linea,
      addressLocality: negocio.direccion.canton,
      addressRegion: negocio.direccion.provincia,
      addressCountry: "CR",
    };
  }
  if (negocio.direccion.lat !== null && negocio.direccion.lng !== null) {
    base.geo = {
      "@type": "GeoCoordinates",
      latitude: negocio.direccion.lat,
      longitude: negocio.direccion.lng,
    };
  }
  if (negocio.horario.length > 0) {
    base.openingHoursSpecification = negocio.horario.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.dias,
      opens: h.abre,
      closes: h.cierra,
    }));
  }
  return base;
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(esquemaNegocio()) }}
        />
      </head>
      <body>
        <ProveedorCarrito>
          {/* Salto al contenido: sin esto, quien navega con teclado tiene que
              recorrer toda la cabecera en cada página (WCAG 2.4.1). */}
          <a
            href="#contenido"
            className="sr-only rounded-full focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-navy-500 focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-crema-100 focus:outline-none focus:ring-2 focus:ring-dorado-400 focus:ring-offset-2"
          >
            Saltar al contenido
          </a>
          <AvisoConfiguracion />
          <NavBar />
          <main id="contenido" className="min-h-screen">
            {children}
          </main>
          <Footer />
        </ProveedorCarrito>
      </body>
    </html>
  );
}

// PENDIENTE DE CONTENIDO REAL (Bloque 5, ítem 36).
//
// La ruta existe a propósito, sin texto legal inventado: los términos y
// condiciones son una decisión de negocio -y en buena parte legal- que le
// corresponde a Oscar (o a quien lo asesore), no algo que se redacta por
// completar un casillero. Publicar una cláusula inventada es peor que no
// tener la página.
//
// A propósito, esta página NO está enlazada desde el pie de página
// (Footer.tsx) todavía: ese archivo tiene un criterio explícito -"un enlace
// solo lleva a contenido que existe de verdad, nunca a una promesa vacía"-
// después de haber corregido tres enlaces que simulaban páginas distintas.
// Enlazar esto ahora repetiría exactamente ese error. Se enlaza el día que
// tenga contenido real.
//
// noindex mientras tanto: una página "términos" sin términos no le sirve a
// nadie que la encuentre por Google.
export const metadata = {
  title: "Términos y condiciones",
  robots: { index: false, follow: true },
};

export default function TerminosPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-headline leading-tight text-navy-500">
        Términos y condiciones
      </h1>
      <p className="mt-8 text-[16.5px] font-light leading-relaxed text-navy-400">
        Esta página está pendiente de redactar. Para cualquier consulta sobre
        una compra, escribinos desde la página de{" "}
        <a href="/contacto" className="underline underline-offset-2 hover:text-navy-500">
          contacto
        </a>.
      </p>
    </section>
  );
}

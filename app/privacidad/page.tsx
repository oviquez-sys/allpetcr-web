// PENDIENTE DE CONTENIDO REAL — ver el comentario largo en
// app/terminos/page.tsx (misma razón, mismo criterio: no se enlaza desde
// el pie de página hasta tener contenido real, no se inventa texto legal).
export const metadata = {
  title: "Política de privacidad",
  robots: { index: false, follow: true },
};

export default function PrivacidadPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-headline leading-tight text-navy-500">
        Política de privacidad
      </h1>
      <p className="mt-8 text-[16.5px] font-light leading-relaxed text-navy-400">
        Esta página está pendiente de redactar. Para cualquier consulta sobre
        tus datos, escribinos desde la página de{" "}
        <a href="/contacto" className="underline underline-offset-2 hover:text-navy-500">
          contacto
        </a>.
      </p>
    </section>
  );
}

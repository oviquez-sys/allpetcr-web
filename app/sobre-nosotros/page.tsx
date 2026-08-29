export const metadata = {
  // Sin sufijo manual: app/layout.tsx ya agrega " | AllPet" vía su template.
  title: "Sobre nosotros",
};

// NOTA: borrador de copy. Reemplazar con la historia real de AllPetcr
// (fundación, ubicación, equipo) antes de publicar.

export default function SobreNosotrosPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-headline leading-tight text-navy-500">
        Sobre nosotros
      </h1>
      <div className="mt-8 space-y-5 text-[16.5px] font-light leading-relaxed text-navy-400">
        <p>
          AllPet es una tienda de productos para mascotas en Heredia Central,
          Costa Rica.
        </p>
        <p>
          Encontrá la dirección, horario y canales de atención verificados en
          nuestra página de contacto.
        </p>
      </div>
    </section>
  );
}

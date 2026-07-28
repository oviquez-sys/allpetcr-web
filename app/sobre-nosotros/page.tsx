export const metadata = {
  title: "Sobre nosotros | AllPet",
};

// NOTA: borrador de copy. Reemplazar con la historia real de AllPetcr
// (fundación, ubicación, equipo) antes de publicar.

export default function SobreNosotrosPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-[38px] font-light leading-tight text-navy-500">
        Sobre nosotros
      </h1>
      <div className="mt-8 space-y-5 text-[16.5px] font-light leading-relaxed text-navy-400">
        <p>
          AllPet es una tienda de productos para mascotas en Costa Rica. Nuestro
          punto de partida es simple: recomendar lo que realmente le sirve a tu
          perro o gato, no lo que más se vende.
        </p>
        <p className="rounded-card bg-dorado-50 p-5 text-sm text-dorado-800">
          [Placeholder: historia real de la tienda — cuándo empezó, quiénes la
          fundaron, qué la hace distinta. Reemplazar con contenido real.]
        </p>
        <p className="rounded-card bg-dorado-50 p-5 text-sm text-dorado-800">
          [Placeholder: filosofía de atención, criterios de selección de
          productos, compromiso con el cliente.]
        </p>
      </div>
    </section>
  );
}

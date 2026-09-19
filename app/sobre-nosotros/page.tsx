import Link from "next/link";
import { negocio } from "@/lib/negocio";
export const metadata = {
  // Sin sufijo manual: app/layout.tsx ya agrega " | AllPet" vía su template.
  title: "Sobre nosotros",
  alternates: { canonical: "/sobre-nosotros" },
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
          Reunimos productos para el juego, el paseo y el cuidado de perros y gatos.
          Podés explorar el catálogo online, preparar tu pedido y confirmarlo con la tienda por WhatsApp.
        </p>
        <p>{negocio.horarioTexto}</p>
        <p>Si necesitás ayuda para elegir talla, material o uso, consultanos indicando el código del producto.</p>
        <Link href="/contacto" className="inline-block rounded-full bg-navy-500 px-6 py-3 text-sm text-white">Conocer la tienda y contactar</Link>
      </div>
    </section>
  );
}

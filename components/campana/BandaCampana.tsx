import BeneficiosCampana from "./BeneficiosCampana";
import BotonCampana from "./BotonCampana";

/**
 * Reemplaza la franja de La manada en la portada mientras el sorteo está
 * abierto (16/11/2026): en vez del 10 % de bienvenida, que el ERP deja de
 * emitir durante la campaña, cuenta cómo sumar números y el envío gratis.
 */
export default function BandaCampana({ zonas }: { zonas: string[] }) {
  return (
    <section aria-labelledby="titulo-banda-campana" className="superficie-navy text-crema-100">
      <div className="franja-dorada" />
      <div className="mx-auto max-w-contenido px-4 py-14 sm:px-6 lg:py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-label uppercase text-dorado-300">Navidad AllPet 2026</p>
            <h2 id="titulo-banda-campana" className="mt-2 font-display text-seccion">Más compras, más números</h2>
            <p className="mt-3 max-w-xl text-[16px] font-light text-crema-200">
              Registrate gratis y cada compra te acerca a la canasta. El sorteo es el 24 de diciembre.
            </p>
          </div>
          <div className="shrink-0"><BotonCampana href="/navidad#registro" tono="oscuro" /></div>
        </div>
        <div className="mt-8">
          <BeneficiosCampana zonas={zonas} variante="oscuro" />
        </div>
      </div>
      <div className="franja-dorada" />
    </section>
  );
}

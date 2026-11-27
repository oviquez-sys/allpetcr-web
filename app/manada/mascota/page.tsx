import Link from "next/link";
import { cookies } from "next/headers";
import FormularioMascotas from "@/components/manada/FormularioMascotas";
import { erpGet } from "@/lib/erpServidor";
import { COOKIE_BIENVENIDA, verificar, type Bienvenida } from "@/lib/manada";
import { leerCampana } from "@/lib/campanaServidor";
import { estadoCampana } from "@/lib/campana";

export const metadata = {
  title: "Tu peludo también es parte de la manada",
  robots: { index: false, follow: false },
};

/** Se llega de dos formas: con el enlace del correo (?t=llave) o desde la
 * pantalla de bienvenida después de Google (la llave va en la cookie). */
export default async function MascotaPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const token = t || verificar<Bienvenida>((await cookies()).get(COOKIE_BIENVENIDA)?.value)?.token_mascotas || "";

  // Sorteo de Navidad (17/11/2026): mientras está abierto, contar de la
  // mascota da 1 número extra (lo otorga el ERP, una vez por persona).
  const conSorteo = estadoCampana(await leerCampana()) === "abierta";

  let estado: { valido: boolean; nombre?: string } = { valido: false };
  if (token) {
    try {
      estado = await erpGet(`/api/manada/mascotas/?t=${encodeURIComponent(token)}`);
    } catch {
      estado = { valido: false };
    }
  }

  return (
    <section className="bg-crema-100">
      <div className="mx-auto max-w-md px-6 py-14">
        <p className="text-label uppercase text-dorado-700">La manada AllPetcr.com</p>
        <h1 className="mt-3 font-display text-headline text-navy-500">Tu peludo también es parte de la manada</h1>
        {estado.valido ? (
          <>
            {conSorteo ? (
              <>
                <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-[15px] font-medium text-emerald-800">
                  🎄 Ganá 1 número extra para el sorteo de Navidad
                </p>
                <p className="mt-3 text-[15px] font-light leading-relaxed text-navy-400">
                  {estado.nombre ? `${estado.nombre}, d` : "D"}ecinos cómo se llama, qué animal es (perro, gato, conejo, hámster u otro) y su edad
                  aproximada. Raza, peso y foto son opcionales. Así te avisamos cuando se le esté acabando el
                  alimento y te saludamos en su cumpleaños.
                </p>
              </>
            ) : (
              <p className="mt-3 text-[15px] font-light leading-relaxed text-navy-400">
                {estado.nombre ? `${estado.nombre}, c` : "C"}ontanos quién es y subí su foto: así lo conocemos por su nombre
                y te recomendamos lo que de verdad le sirve. Lo que no sepás, dejalo en blanco.
              </p>
            )}
            <FormularioMascotas token={token} conSorteo={conSorteo} />
          </>
        ) : (
          <div className="mt-6 rounded-card bg-white p-6 ring-1 ring-crema-400">
            <p className="text-[15px] font-light leading-relaxed text-navy-400">
              Este enlace ya se usó o no es válido. Si ya sumaste a tu peludo, ¡ya es parte de la manada!
              Si querés corregir algo, escribinos por WhatsApp.
            </p>
            <Link href="/" className="mt-4 inline-block text-sm text-navy-500 underline underline-offset-2">Ir al inicio</Link>
          </div>
        )}
      </div>
    </section>
  );
}

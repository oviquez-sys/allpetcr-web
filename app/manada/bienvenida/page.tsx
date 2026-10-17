import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_BIENVENIDA, verificar, type Bienvenida } from "@/lib/manada";

export const metadata = {
  title: "Bienvenido a la manada",
  // Página personal: muestra el código de quien la abre. Nada que indexar.
  robots: { index: false, follow: false },
};

function fecha(iso?: string | null) {
  if (!iso) return "";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

export default async function BienvenidaPage() {
  const b = verificar<Bienvenida>((await cookies()).get(COOKIE_BIENVENIDA)?.value);
  if (!b) redirect("/manada");
  // "Doña Rosa Jiménez" → "Doña Rosa", no "Doña" a secas.
  const partes = (b.nombre ?? "").split(" ").filter(Boolean);
  const nombre = /^(don|doña|dona|sr\.?|sra\.?|srta\.?)$/i.test(partes[0] ?? "") ? partes.slice(0, 2).join(" ") : (partes[0] ?? "");
  const disponible = b.codigo && b.estado === "DISPONIBLE";

  return (
    <section className="bg-crema-100">
      <div className="mx-auto max-w-md px-6 py-14 text-center">
        <p className="text-label uppercase text-dorado-700">
          {b.nuevo === false ? "Ya eras parte de la manada" : "¡Bienvenido a la manada!"}
        </p>
        <h1 className="mt-3 font-display text-headline text-navy-500">
          {nombre ? `Hola, ${nombre}` : "¡Hola!"}
        </h1>

        {disponible ? (
          <>
            <div className="mt-8 rounded-card border-2 border-dashed border-dorado-500 bg-white px-6 py-8">
              <p className="text-label uppercase text-dorado-700">Tu código</p>
              <p className="mt-3 select-all font-mono text-[2.25rem] font-semibold tracking-[0.12em] text-navy-500">
                {b.codigo}
              </p>
              <p className="mt-2 text-[15px] text-navy-500">{b.descripcion}</p>
              <p className="mt-1 text-sm text-navy-400">
                {b.vence_en ? `Válido hasta el ${fecha(b.vence_en)}` : "Para tu primera compra · No vence"}
              </p>
            </div>
            <p className="mt-6 text-[15px] font-light leading-relaxed text-navy-400">
              Usalo en tu primera compra: mostralo en la caja, o escribilo en «Código de La manada» al
              confirmar un pedido en la web o en tu mensaje de WhatsApp. Es de un solo uso.
              {b.correo_enviado !== false && " También te lo mandamos al correo."}
            </p>
            <p className="mt-2 text-[14px] text-navy-400">
              ¿Se te olvida el código? Basta con decir o escribir tu número de WhatsApp.
            </p>
          </>
        ) : b.estado === "USADO" ? (
          <p className="mt-6 text-[15px] font-light leading-relaxed text-navy-400">
            Tu cupón de bienvenida ya se usó. ¡Gracias por comprar con nosotros! Te avisaremos de las
            próximas promociones si nos diste permiso.
          </p>
        ) : b.estado === "VENCIDO" ? (
          <p className="mt-6 text-[15px] font-light leading-relaxed text-navy-400">
            Tu cupón de bienvenida venció el {fecha(b.vence_en)}. Escribinos y vemos qué podemos hacer.
          </p>
        ) : (
          <p className="mt-6 text-[15px] font-light leading-relaxed text-navy-400">
            Ya quedaste registrado. Te vamos a contar primero de lo nuevo para tu mascota.
          </p>
        )}

        {b.token_mascotas && (
          <div className="mt-10 rounded-card bg-white p-6 text-left ring-1 ring-crema-400">
            <p className="font-display text-bloque text-navy-500">Tu peludo también es parte de la manada</p>
            <p className="mt-2 text-[14px] font-light leading-relaxed text-navy-400">
              Contanos quién es y subí su foto, para conocerlo por su nombre cuando venga a la tienda. Toma un minuto.
            </p>
            <Link href="/manada/mascota"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy-500 px-6 py-3 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
              <span aria-hidden="true">🐾</span> Sumalo a la manada
            </Link>
          </div>
        )}

        <Link href="/catalogo" className="mt-10 inline-block text-sm text-navy-400 underline underline-offset-2 hover:text-navy-500">
          Ver el catálogo
        </Link>
      </div>
    </section>
  );
}

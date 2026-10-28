import Link from "next/link";
import { negocio, direccionCompleta } from "@/lib/negocio";

export const metadata = {
  title: "Entregas y cómo comprar",
  description:
    "Retiro sin costo en nuestra tienda de Heredia o envío a domicilio cotizado por WhatsApp. " +
    "Te confirmamos existencias, costo de envío y total antes de que pagués.",
  alternates: { canonical: "/envios" },
};

/**
 * Entregas (auditoría F12-02 y F7-02, 16/10/2026).
 *
 * Todavía no hay tarifas fijas de envío (decisión de los dueños, 16/10/2026):
 * no se publican montos ni plazos que no se puedan sostener. En su lugar, la
 * página dice exactamente qué datos hacen falta para cotizar, qué se responde
 * y que el total completo llega antes de aceptar. Cuando haya tarifas por
 * zona, van en la sección "Envío a domicilio".
 */
export default function EntregasPage() {
  return <section className="mx-auto max-w-2xl px-6 py-16 text-navy-500">
    <h1 className="font-display text-headline">Entregas y cómo comprar</h1>

    <h2 className="mt-8 text-xl">Retiro en tienda</h2>
    <p className="mt-3 leading-relaxed">Retirá sin costo en nuestra tienda: {direccionCompleta().replace(/^De /, "de ")}. Esperá la confirmación de que tu pedido está listo antes de visitarnos.</p>
    <p className="mt-3 leading-relaxed">{negocio.horarioTexto}</p>

    <h2 className="mt-8 text-xl">Envío a domicilio</h2>
    <p className="mt-3 leading-relaxed">
      Todavía no tenemos tarifas fijas: el costo y el plazo dependen de la dirección de entrega, así que
      te los cotizamos para cada pedido. Así funciona:
    </p>
    <ol className="mt-3 list-decimal space-y-3 pl-5 leading-relaxed">
      <li>
        Al confirmar el pedido elegí <strong>Coordinar envío</strong> y escribí provincia, cantón,
        distrito y señas exactas. Marcar tu casa en el mapa es opcional, pero ayuda.
      </li>
      <li>
        Enviá el mensaje por WhatsApp. Te respondemos en horario de atención con la cobertura (si
        llegamos a tu zona), el costo del envío y el plazo de entrega.
      </li>
      <li>
        Antes de que aceptés, te enviamos el resumen completo: productos, envío, cualquier otro cargo o
        descuento y el total final. Si el envío no te conviene, podés cambiar a retiro en tienda o
        cancelar, sin ningún costo.
      </li>
    </ol>
    <p className="mt-3 leading-relaxed">
      El subtotal que ves en el carrito incluye únicamente los productos.
    </p>

    <h2 className="mt-8 text-xl">Confirmación y pago</h2>
    <ol className="mt-3 list-decimal space-y-3 pl-5">
      <li>Agregá los productos y revisá las cantidades en el carrito.</li>
      <li>Completá tus datos y verificá los precios y existencias.</li>
      <li>Revisá el mensaje preparado y envialo por WhatsApp.</li>
      <li>Coordiná con la tienda la entrega, el total y el medio de pago.</li>
    </ol>
    <p className="mt-5">La web no cobra ni reserva productos al preparar el mensaje.</p>
    <p className="mt-3">
      ¿Tenés un código de <Link href="/manada" className="underline underline-offset-2">La manada</Link>?
      Escribilo al confirmar el pedido y te confirmamos el total con el descuento antes de que pagués.
    </p>
    <Link href="/contacto" className="mt-8 inline-block rounded-full bg-navy-500 px-6 py-3 text-white">Consultar con la tienda</Link>
  </section>;
}

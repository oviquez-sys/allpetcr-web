import Link from "next/link";
import { negocio, direccionCompleta } from "@/lib/negocio";

export const metadata = { title: "Entregas y cómo comprar", alternates: { canonical: "/envios" } };
export default function EntregasPage() {
  return <section className="mx-auto max-w-2xl px-6 py-16 text-navy-500">
    <h1 className="font-display text-headline">Entregas y cómo comprar</h1>
    <h2 className="mt-8 text-xl">Retiro en tienda</h2>
    <p className="mt-3 leading-relaxed">Retirá sin costo en {direccionCompleta()}. Esperá la confirmación de que tu pedido está listo antes de visitarnos.</p>
    <p className="mt-3 leading-relaxed">{negocio.horarioTexto}</p>
    <h2 className="mt-8 text-xl">Envío a coordinar</h2>
    <p className="mt-3 leading-relaxed">Ingresá provincia, cantón, distrito y señas al preparar el pedido. La tienda confirma cobertura, costo y plazo por WhatsApp antes de que aceptés la compra. El subtotal del carrito incluye únicamente los productos.</p>
    <h2 className="mt-8 text-xl">Confirmación y pago</h2>
    <ol className="mt-3 list-decimal space-y-3 pl-5">
      <li>Agregá los productos y revisá las cantidades en el carrito.</li>
      <li>Completá tus datos y verificá los precios y existencias.</li>
      <li>Revisá el mensaje preparado y envialo por WhatsApp.</li>
      <li>Coordiná con la tienda la entrega, el total y el medio de pago.</li>
    </ol>
    <p className="mt-5">La web no cobra ni reserva productos al preparar el mensaje.</p>
    <Link href="/contacto" className="mt-8 inline-block rounded-full bg-navy-500 px-6 py-3 text-white">Consultar con la tienda</Link>
  </section>;
}

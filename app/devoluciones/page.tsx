import Link from "next/link";
import { negocio } from "@/lib/negocio";

export const metadata = {
  title: "Cambios y devoluciones",
  description: "Cómo coordinar un cambio de producto o la devolución de dinero en AllPet Costa Rica.",
};

export default function DevolucionesPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <p className="text-label uppercase text-dorado-700">Compra con tranquilidad</p>
      <h1 className="font-display text-headline leading-tight text-navy-500">
        Cambios y devoluciones
      </h1>
      <p className="mt-6 text-[16.5px] font-light leading-relaxed text-navy-400">
        Si necesitás cambiar un producto, podés escoger otro artículo o solicitar
        la devolución de tu dinero. Escribinos para coordinarlo y te ayudamos a
        resolverlo.
      </p>

      <div className="mt-10 space-y-8 text-[16px] font-light leading-relaxed text-navy-400">
        <section aria-labelledby="como-solicitar">
          <h2 id="como-solicitar" className="font-display text-title text-navy-500">Cómo solicitarlo</h2>
          <p className="mt-3">
            Contactanos con el código del artículo y tu comprobante de compra.
            Si hiciste el pedido por la web, podés usar el número de pedido o la
            conversación de WhatsApp como referencia.
          </p>
        </section>

        <section aria-labelledby="opciones">
          <h2 id="opciones" className="font-display text-title text-navy-500">Tus opciones</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Cambiar el producto por otro disponible.</li>
            <li>Recibir la devolución del dinero por el mismo medio con que pagaste (efectivo, SINPE Móvil o a la misma tarjeta).</li>
            <li>Si el nuevo artículo tiene otro precio, coordinamos contigo el cobro o la devolución de la diferencia antes de finalizar el cambio.</li>
          </ul>
        </section>

        <section aria-labelledby="donde-cuando">
          <h2 id="donde-cuando" className="font-display text-title text-navy-500">Dónde y cuándo</h2>
          <p className="mt-3">
            Podés coordinar el proceso en nuestra tienda física de lunes a sábado,
            de 9:00 a. m. a 7:00 p. m. El local está cerrado los domingos, pero
            la tienda web recibe tu solicitud todos los días.
          </p>
        </section>

        <section aria-labelledby="envios-cambios">
          <h2 id="envios-cambios" className="font-display text-title text-navy-500">Compras con envío</h2>
          <p className="mt-3">
            Antes de enviar o trasladar un producto, escribinos para acordarlo.
            Podés traerlo a la tienda sin costo; si preferís que lo recojamos, el
            transporte corre por tu cuenta y te decimos el costo antes. Si el
            producto llegó dañado, defectuoso o no es el que pediste, el
            transporte lo pagamos nosotros. Si compraste por el sitio o por
            WhatsApp, además tenés el{" "}
            <Link href="/terminos#retracto" className="underline underline-offset-2">derecho de retracto</Link>.
          </p>
        </section>
      </div>

      <div className="mt-10 rounded-card border border-crema-400 bg-white p-6">
        <h2 className="font-display text-title text-navy-500">¿Necesitás ayuda?</h2>
        <p className="mt-2 text-sm font-light leading-relaxed text-navy-400">Escribinos y coordinamos tu cambio o devolución contigo.</p>
        <Link href="/contacto" className="mt-4 inline-block rounded-full bg-navy-500 px-5 py-3 text-sm font-medium text-crema-100 transition-colors hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
          Contactar a AllPet
        </Link>
        <p className="mt-4 text-xs text-navy-400">{negocio.horarioTexto}</p>
      </div>
    </section>
  );
}

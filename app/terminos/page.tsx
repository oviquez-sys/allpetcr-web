import Link from "next/link";
import { negocio, direccionCompleta } from "@/lib/negocio";
import { PaginaLegal, Seccion, Lista, enlaceLegal } from "@/components/PaginaLegal";

// Términos y condiciones (21/09/2026).
//
// Tiene DOS versiones de "Cómo se hace un pedido" y "Pago": la de hoy (pedido
// por WhatsApp, sin cobro en línea) y la del pago con tarjeta en el sitio
// (pasarela del Banco Nacional). Cambia sola según
// `negocio.pagoEnLinea.activo`; no hay que tocar este archivo el día que se
// encienda el pago.
//
// Base legal, con los artículos del texto vigente en SINALEVI (numeración del
// Decreto 44400 de 2024):
// - Ley 7472: art. 34 (obligaciones del comerciante), 40 (retracto),
//   42 (cláusulas abusivas), 43 (garantía; duración escrita para bienes
//   duraderos).
// - Reglamento 37899-MEIC: art. 72-77 (retracto: 8 días hábiles, devolver sin
//   uso con comprobante, reintegro en 8 días NATURALES y, en comercio
//   electrónico, por el mismo medio de pago; excepciones), 183 (identidad del
//   comerciante), 186 (información de la transacción), 187 (precio total y
//   desglose), 189-191 (resumen, aceptación expresa, comprobante), 192
//   (seguridad de pago), 194 (plazo de entrega; si no se informa son 24 h),
//   195 (reclamos), 196 (reseñas).
// Borrador para revisión de un abogado; no reemplaza asesoría legal.
export const metadata = {
  title: "Términos y condiciones",
  description:
    "Condiciones de compra en AllPet Costa Rica: precios, pedidos, pago, entregas, retracto, cambios, garantía y reclamos.",
  alternates: { canonical: "/terminos" },
};

const VIGENCIA = "21 de setiembre de 2026";

export default function TerminosPage() {
  const direccion = direccionCompleta();
  const pago = negocio.pagoEnLinea;
  const enLinea = pago.activo;
  return (
    <PaginaLegal etiqueta="Condiciones de compra" titulo="Términos y condiciones" vigencia={VIGENCIA}>
      <Seccion id="quienes-somos" titulo="1. Quiénes somos">
        <p>
          AllPetcr.com es el nombre comercial de la tienda de <strong>{negocio.razonSocial}</strong>, cédula
          jurídica {negocio.cedulaJuridica} (en adelante, «AllPet»), sociedad costarricense que opera este
          sitio y la tienda física.
        </p>
        <Lista>
          {direccion && <li>Domicilio y tienda: {direccion}.</li>}
          <li>Teléfono y WhatsApp: {negocio.telefonoVisible}.</li>
          <li>Correo: {negocio.correo}.</li>
          <li>Horario de la tienda: {negocio.horarioTexto}</li>
        </Lista>
      </Seccion>

      <Seccion id="aceptacion" titulo="2. Aceptación de estos términos">
        <p>
          Antes de {enLinea ? "pagar" : "enviar tu pedido"} te pedimos que leás estos términos y marqués la
          casilla que dice que los aceptás. Se aplica la versión vigente el día de tu compra. Podés guardar o
          imprimir esta página cuando quieras.
        </p>
        <p>
          Estos términos no limitan ningún derecho que la ley de Costa Rica te da como consumidor: si algo de
          lo que dice acá chocara con la ley, manda la ley.
        </p>
      </Seccion>

      <Seccion id="productos" titulo="3. Productos, fotos y descripciones">
        <p>
          Describimos cada producto con la información que tenemos del fabricante o del proveedor. Las fotos
          son de referencia: el color, el estampado o el tamaño aparente pueden variar un poco. Si tenés dudas
          sobre una medida, talla o material, preguntanos por WhatsApp antes de comprar.
        </p>
      </Seccion>

      <Seccion id="precios" titulo="4. Precios">
        <Lista>
          <li>
            Todos los precios están en colones costarricenses e <strong>incluyen el IVA</strong>. Tu
            comprobante muestra el desglose del impuesto.
          </li>
          <li>
            El envío no está incluido en el precio del producto. Si pedís entrega a domicilio, el costo del
            envío aparece en el resumen de tu compra, junto con el total, antes de que{" "}
            {enLinea ? "pagués" : "confirmés"}.
          </li>
          <li>
            Los precios pueden cambiar, pero el que vale para vos es el que aceptaste en el resumen de tu
            compra.
          </li>
          <li>
            Si un precio publicado tiene un error evidente (por ejemplo, un cero de menos), te avisamos antes de
            entregar. Podés aceptar el precio correcto o cancelar la compra y recibir todo tu dinero de vuelta.
          </li>
        </Lista>
      </Seccion>

      {enLinea ? (
        <Seccion id="pedidos" titulo="5. Cómo se hace una compra">
          <Lista>
            <li>Agregás los productos al carrito y escribís tus datos y la forma de entrega.</li>
            <li>
              Antes de pagar te mostramos un <strong>resumen</strong> con los productos, cantidades, precios,
              costo de envío, plazo de entrega y total. Ahí podés corregir o cancelar.
            </li>
            <li>Marcás la casilla de aceptación y pasás a la página de pago segura del {pago.banco}.</li>
            <li>
              La compra queda hecha cuando el banco aprueba el pago. En ese momento te enviamos por correo el
              comprobante con el detalle de la compra.
            </li>
          </Lista>
          <p>
            Si después de pagar un producto resulta no estar disponible, te avisamos a más tardar el siguiente
            día hábil. Escogés entre un producto de reemplazo que te parezca bien o la devolución de lo que
            pagaste por él, a la misma tarjeta.
          </p>
        </Seccion>
      ) : (
        <Seccion id="pedidos" titulo="5. Cómo se hace un pedido">
          <p>
            Armás tu carrito en el sitio y preparás el pedido, que se envía por WhatsApp. Ese mensaje es una{" "}
            <strong>solicitud</strong>: todavía no es una compra ni reserva los productos.
          </p>
          <p>
            La compra queda hecha cuando te respondemos por WhatsApp con las existencias, el total, el plazo y
            la forma de entrega y el medio de pago, y vos lo aceptás. Si algún producto ya no está disponible,
            te lo decimos y podés cambiarlo, quitarlo o cancelar el pedido.
          </p>
        </Seccion>
      )}

      {enLinea ? (
        <Seccion id="pago" titulo="6. Pago y seguridad">
          <Lista>
            <li>
              Aceptamos {pago.tarjetas}. El cobro se hace en colones y lo procesa el {pago.banco} en su propia
              página de pago.
            </li>
            <li>
              <strong>AllPet no ve ni guarda los datos de tu tarjeta.</strong> Los escribís directamente en la
              página del banco, protegida con {pago.seguridad}. La plataforma de pago está certificada por{" "}
              {pago.certificadora}.
            </li>
            <li>
              De nuestro lado solo recibimos la confirmación del banco: si el pago se aprobó, el monto, la fecha y
              el número de autorización.
            </li>
            <li>
              Si preferís, también podés coordinar tu pedido por WhatsApp y pagar en la tienda con efectivo,
              tarjeta o SINPE Móvil.
            </li>
            <li>
              Cuando corresponda devolverte dinero de una compra pagada con tarjeta, lo hacemos a esa misma
              tarjeta. El tiempo que tarda en verse en tu estado de cuenta depende del banco que emitió la
              tarjeta.
            </li>
          </Lista>
        </Seccion>
      ) : (
        <Seccion id="pago" titulo="6. Pago y comprobante">
          <p>
            El sitio no cobra en línea: no te vamos a pedir datos de tarjeta en esta página. El pago se hace por
            el medio que acordemos al confirmar el pedido: efectivo, tarjeta o SINPE Móvil. Con cada compra te
            entregamos el comprobante que exige la ley.
          </p>
        </Seccion>
      )}

      <Seccion id="entregas" titulo="7. Retiro y entregas">
        <Lista>
          <li>
            <strong>Retiro en tienda:</strong> sin costo, cuando te confirmemos que el pedido está listo.
          </li>
          <li>
            <strong>Entrega a domicilio:</strong> el costo y el plazo de entrega te los decimos en el resumen,
            antes de {enLinea ? "pagar" : "confirmar"}. Más detalles en{" "}
            <Link href="/envios" className={enlaceLegal}>Entregas y cómo comprar</Link>.
          </li>
          <li>
            Si no cumplimos el plazo de entrega que aceptaste, podés cancelar la compra y te devolvemos todo lo
            que pagaste, sin ninguna deducción.
          </li>
          <li>
            Si la entrega no se puede hacer porque la dirección está incompleta o no hay nadie para recibir,
            coordinamos contigo una nueva entrega; ese segundo envío tiene costo.
          </li>
          <li>
            Al recibir, revisá que el pedido esté completo y en buen estado. Si algo no está bien, avisanos por
            WhatsApp lo antes posible, con fotos si se puede.
          </li>
        </Lista>
      </Seccion>

      <Seccion id="retracto" titulo="8. Derecho de retracto (compras por el sitio o WhatsApp)">
        <p>
          Si compraste por este sitio o por WhatsApp, podés arrepentirte de la compra dentro de los{" "}
          <strong>ocho (8) días hábiles</strong> siguientes a la entrega, sin tener que dar explicaciones y sin
          ninguna penalización.
        </p>
        <Lista>
          <li>
            <strong>Cómo avisar:</strong> por escrito, por el mismo medio que usaste para comprar: al correo{" "}
            {negocio.correo} o por WhatsApp al {negocio.telefonoVisible}. También podés venir a la tienda con el
            producto.
          </li>
          <li>
            <strong>Cómo devolverlo:</strong> sin usar, en las mismas condiciones en que lo recibiste, con su
            empaque, accesorios e instructivos, y con el comprobante de compra.
          </li>
          <li>
            <strong>Transporte:</strong> podés devolverlo en la tienda sin costo. Si preferís que lo recojamos,
            el costo de ese transporte de devolución corre por tu cuenta y te lo decimos antes.
          </li>
          <li>
            <strong>Tu dinero:</strong> te devolvemos todo lo que pagaste, incluido el envío original, en un
            plazo máximo de <strong>ocho (8) días naturales</strong> contados desde que recibimos el producto
            (o desde tu aviso, si todavía no te lo habíamos entregado). La devolución se hace por el mismo medio
            con que pagaste.
          </li>
        </Lista>
        <p>
          Como lo permite la ley, el retracto <strong>no aplica</strong> a productos que se consumen o que no se
          pueden volver a vender una vez abiertos o usados: alimentos, premios y snacks, arena, champús y
          productos de higiene o cuidado cuyo empaque se haya abierto, y cualquier producto que ya se haya
          usado. Si el empaque de estos productos sigue cerrado, sí podés ejercer el retracto.
        </p>
      </Seccion>

      <Seccion id="cambios-garantia" titulo="9. Cambios y garantía">
        <p>
          Además del retracto, podés pedir un cambio según lo que explicamos en{" "}
          <Link href="/devoluciones" className={enlaceLegal}>Cambios y devoluciones</Link>.
        </p>
        <p>
          <strong>Garantía:</strong> todos los productos tienen la garantía que establece la Ley 7472. Si un
          producto sale defectuoso, llegó dañado o no es el que compraste, lo cambiamos por otro igual, te damos
          otro de valor equivalente o te devolvemos el dinero, según prefieras y según haya existencias. En
          estos casos, el transporte corre por nuestra cuenta.
        </p>
        <p>
          Los aparatos (fuentes de agua, comederos automáticos, lámparas y juguetes eléctricos o de batería)
          tienen una garantía de <strong>{negocio.garantiaAparatosMeses} meses</strong> desde la entrega
          contra defectos de fabricación. No cubre daños por golpes, mordidas, mojaduras fuera de lo que indica
          el fabricante, mal uso o desgaste normal. Para hacerla valer, escribinos con tu comprobante y una foto
          o video del problema.
        </p>
      </Seccion>

      <Seccion id="reclamos" titulo="10. Consultas y reclamos">
        <p>
          Si algo no salió bien, escribinos al correo {negocio.correo} o por WhatsApp al{" "}
          {negocio.telefonoVisible}. Es gratis. Te respondemos a más tardar en{" "}
          <strong>{negocio.diasRespuestaReclamo} días hábiles</strong>, y podés dar seguimiento en la misma
          conversación. Siempre podés acudir también al Ministerio de Economía, Industria y Comercio (MEIC),
          que atiende las denuncias de los consumidores.
        </p>
        {negocio.resenasUrl && (
          <p>
            Tu opinión, buena o mala, nos sirve y ayuda a otros clientes. Podés dejarla y leer las de otros en{" "}
            <a href={negocio.resenasUrl} target="_blank" rel="noopener noreferrer" className={enlaceLegal}>
              nuestras reseñas
            </a>
            .
          </p>
        )}
      </Seccion>

      <Seccion id="uso" titulo="11. Uso de los productos">
        <p>
          Elegí la talla y el tipo de producto de acuerdo con el tamaño y la edad de tu mascota, y seguí las
          indicaciones del empaque. Los juguetes no son indestructibles: supervisá a tu mascota mientras juega y
          retirá el juguete si se rompe. Ante dudas de salud o alimentación, consultá con tu veterinario.
        </p>
      </Seccion>

      <Seccion id="propiedad" titulo="12. Contenido del sitio">
        <p>
          Los textos, fotos, logotipo y diseño de este sitio pertenecen a AllPet o a sus proveedores. No se
          pueden copiar ni usar con fines comerciales sin autorización.
        </p>
      </Seccion>

      <Seccion id="datos" titulo="13. Tus datos">
        <p>
          Cómo usamos y protegemos tus datos personales está explicado en la{" "}
          <Link href="/privacidad" className={enlaceLegal}>Política de privacidad</Link>.
        </p>
      </Seccion>

      <Seccion id="cambios-terminos" titulo="14. Cambios a estos términos">
        <p>
          Podemos actualizar estos términos. La fecha de vigencia de arriba indica la versión actual. Un cambio
          nunca afecta una compra que ya hiciste.
        </p>
      </Seccion>

      <Seccion id="ley" titulo="15. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República de Costa Rica, en especial la Ley 7472 de
          Promoción de la Competencia y Defensa Efectiva del Consumidor y su reglamento. La compra se considera
          hecha en tu domicilio, como lo establece la ley para el comercio electrónico.
        </p>
      </Seccion>
    </PaginaLegal>
  );
}

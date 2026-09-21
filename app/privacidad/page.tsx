import Link from "next/link";
import { negocio, direccionCompleta } from "@/lib/negocio";
import { PaginaLegal, Seccion, Lista, enlaceLegal } from "@/components/PaginaLegal";

// Política de privacidad (21/09/2026).
//
// Base legal: Ley 8968 de Protección de la Persona frente al Tratamiento de
// sus Datos Personales (art. 5 consentimiento informado, art. 7 derechos de
// acceso, rectificación y supresión con respuesta en 5 días hábiles, art. 14
// transferencias). Autoridad: Agencia de Protección de Datos de los
// Habitantes (PRODHAB).
//
// Describe lo que el sitio hace DE VERDAD, verificado en el código ese día:
// - Checkout: nombre, teléfono, forma de entrega, dirección, nota y ubicación
//   en el mapa (opcional). Viajan en el mensaje de WhatsApp que envía el
//   cliente; las coordenadas pasan por /api/geocodificar → Nominatim.
// - Aviso de disponibilidad: correo + producto → se guarda en el ERP.
// - localStorage: carrito y "volver a pedir" (caduca a los 180 días).
// - Sin analítica ni publicidad. El mapa de /contacto es de Google.
// - Servidores en DigitalOcean, Nueva York.
// El pago con tarjeta ya está descrito: aparece solo cuando
// `negocio.pagoEnLinea.activo` es true. Si se agrega analítica o cuentas de
// cliente, esta página se actualiza ANTES de publicar ese cambio. Borrador para revisión de un
// abogado; no reemplaza asesoría legal.
export const metadata = {
  title: "Política de privacidad",
  description: "Qué datos personales recoge AllPet Costa Rica, para qué los usa, con quién los comparte y cómo ejercer tus derechos.",
  alternates: { canonical: "/privacidad" },
};

const VIGENCIA = "21 de setiembre de 2026";

export default function PrivacidadPage() {
  const direccion = direccionCompleta();
  const pago = negocio.pagoEnLinea;
  const enLinea = pago.activo;
  return (
    <PaginaLegal etiqueta="Tus datos" titulo="Política de privacidad" vigencia={VIGENCIA}>
      <p>
        En AllPet pedimos solo los datos que necesitamos para venderte y entregarte tus productos. No los
        vendemos ni los usamos para publicidad de terceros. Esta política cumple con la Ley 8968 de
        Protección de la Persona frente al Tratamiento de sus Datos Personales.
      </p>

      <Seccion id="responsable" titulo="1. Quién es responsable de tus datos">
        <p>
          {negocio.razonSocial}, cédula jurídica {negocio.cedulaJuridica}, que opera la tienda AllPetcr.com.
        </p>
        <Lista>
          {direccion && <li>Dirección: {direccion}.</li>}
          <li>Correo para temas de datos: {negocio.correo}.</li>
          <li>Teléfono y WhatsApp: {negocio.telefonoVisible}.</li>
        </Lista>
      </Seccion>

      <Seccion id="datos" titulo="2. Qué datos recogemos y para qué">
        <Lista>
          <li>
            <strong>Al preparar un pedido:</strong> tu nombre, teléfono, la forma de entrega y, si pedís
            envío, la dirección y una nota. Sirven para confirmar el pedido, coordinar la entrega y
            emitir tu comprobante.{" "}
            {enLinea
              ? "Si pagás en el sitio, también te pedimos un correo para enviarte el comprobante."
              : "Estos datos viajan en el mensaje de WhatsApp que vos enviás."}
          </li>
          {enLinea && (
            <li>
              <strong>Al pagar con tarjeta:</strong> los datos de tu tarjeta los escribís en la página del{" "}
              {pago.banco}; nosotros no los vemos ni los guardamos. Del banco solo recibimos si el pago se
              aprobó, el monto, la fecha y el número de autorización.
            </li>
          )}
          <li>
            <strong>Ubicación en el mapa (opcional):</strong> si marcás tu casa en el mapa, usamos esas
            coordenadas para sugerir la dirección y facilitar la entrega. Podés escribir la dirección sin
            usar el mapa.
          </li>
          <li>
            <strong>Aviso de disponibilidad (opcional):</strong> si pedís que te avisemos cuando vuelva un
            producto, guardamos tu correo y el producto, solo para mandarte ese aviso.
          </li>
          <li>
            <strong>Comprobante de compra:</strong> si pedís factura a tu nombre, necesitamos los datos
            que exige Hacienda (nombre o razón social, cédula y correo).
          </li>
        </Lista>
        <p>
          El nombre y el teléfono son necesarios para coordinar tu pedido: sin ellos no lo podemos
          confirmar. Todo lo demás es opcional. No pedimos datos sensibles (salud, religión, origen
          étnico, orientación sexual u otros).
        </p>
      </Seccion>

      <Seccion id="navegador" titulo="3. Lo que queda en tu navegador">
        <p>
          Tu carrito y la lista para «volver a pedir» se guardan en tu propio navegador (almacenamiento
          local), no en nuestros servidores. La lista para volver a pedir se borra sola a los 180 días.
          Podés borrar ambas cosas cuando quieras, borrando los datos del sitio en tu navegador.
        </p>
        <p>
          No usamos cookies de publicidad ni herramientas de analítica. El mapa de nuestra página de{" "}
          <Link href="/contacto" className={enlaceLegal}>contacto</Link> lo muestra Google Maps, que puede
          usar sus propias cookies según su política.
        </p>
      </Seccion>

      <Seccion id="compartimos" titulo="4. Con quién los compartimos">
        <p>Solo con quienes nos ayudan a darte el servicio, y solo lo necesario:</p>
        <Lista>
          <li>
            <strong>WhatsApp (Meta):</strong> el canal por el que nos mandás el pedido y coordinamos. Lo
            elegís vos al enviar el mensaje.
          </li>
          <li>
            <strong>DigitalOcean:</strong> la empresa donde están alojados el sitio y nuestro sistema de
            ventas. Sus servidores están en Estados Unidos, así que tus datos se guardan allá, con acceso
            restringido.
          </li>
          {enLinea && (
            <li>
              <strong>{pago.banco}:</strong> procesa el pago con tarjeta y recibe los datos que le das en su
              página, bajo sus propias reglas de seguridad y confidencialidad.
            </li>
          )}
          <li>
            <strong>OpenStreetMap:</strong> solo si usás el mapa, recibe las coordenadas (sin tu nombre)
            para devolvernos la dirección aproximada.
          </li>
          <li>
            <strong>Ministerio de Hacienda y nuestro proveedor de factura electrónica:</strong> los datos de
            tu comprobante, porque la ley nos obliga a reportarlo.
          </li>
          <li>
            <strong>Autoridades:</strong> solo cuando una ley o una orden judicial lo exija.
          </li>
        </Lista>
        <p>
          Antes de {enLinea ? "pagar" : "enviar tu pedido"} te pedimos marcar una casilla para aceptar esta
          política. Con eso das tu consentimiento para que tus datos se traten y se guarden como explicamos
          acá, incluido el alojamiento en Estados Unidos. No vendemos tus datos ni te inscribimos en
          publicidad sin que lo pidás.
        </p>
      </Seccion>

      <Seccion id="conservacion" titulo="5. Cuánto tiempo los guardamos">
        <Lista>
          <li>
            Datos de compras y comprobantes: el tiempo que exige la legislación tributaria y contable.
          </li>
          <li>Correo del aviso de disponibilidad: hasta enviarte el aviso, o hasta que nos pidas borrarlo.</li>
          <li>Conversaciones de WhatsApp: mientras sean útiles para atender tu pedido o un reclamo.</li>
        </Lista>
      </Seccion>

      <Seccion id="derechos" titulo="6. Tus derechos">
        <p>Según la Ley 8968, en cualquier momento y sin costo podés:</p>
        <Lista>
          <li>
            <strong>Acceder</strong> a los datos que tenemos de vos.
          </li>
          <li>
            <strong>Rectificarlos</strong> si están incompletos o equivocados.
          </li>
          <li>
            <strong>Pedir que los borremos</strong>, salvo los que la ley nos obliga a conservar.
          </li>
          <li>
            <strong>Retirar tu consentimiento</strong>, por el mismo medio en que lo diste.
          </li>
        </Lista>
        <p>
          Escribinos a {negocio.correo} o por WhatsApp al {negocio.telefonoVisible}. Te respondemos dentro
          de los <strong>cinco (5) días hábiles</strong> siguientes. Si considerás que no atendimos tu
          solicitud, podés presentar una denuncia ante la Agencia de Protección de Datos de los Habitantes
          (PRODHAB).
        </p>
      </Seccion>

      <Seccion id="seguridad" titulo="7. Cómo los protegemos">
        <p>
          El sitio funciona con conexión cifrada (HTTPS). El acceso a nuestro sistema de ventas es
          restringido, con usuario y contraseña, y solo lo usa el personal que atiende tu pedido.
          {enLinea &&
            ` Los pagos con tarjeta se hacen en la página del ${pago.banco}, protegida con ${pago.seguridad} y certificada por ${pago.certificadora}.`}{" "}
          Ningún sistema es infalible: si alguna vez hubiera un incidente que afecte tus datos, te lo
          avisaremos.
        </p>
      </Seccion>

      <Seccion id="menores" titulo="8. Menores de edad">
        <p>
          El sitio está dirigido a personas adultas. Si sos menor de edad, pedile a una persona adulta que
          haga el pedido.
        </p>
      </Seccion>

      <Seccion id="cambios" titulo="9. Cambios a esta política">
        <p>
          Si cambiamos cómo usamos tus datos, actualizamos esta página y la fecha de vigencia de arriba.
          Si el cambio es importante, lo avisamos en el sitio.
        </p>
      </Seccion>
    </PaginaLegal>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  DATOS DEL NEGOCIO — EDITAR ESTE ARCHIVO ANTES DE PUBLICAR
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Todo lo que el sitio dice sobre AllPet sale de aquí: el pie de página, la
 * página de contacto, los datos estructurados para Google, el enlace de
 * WhatsApp y el pedido del checkout.
 *
 * Está centralizado a propósito. Antes la cédula jurídica estaba escrita a
 * mano dentro del componente Footer y el teléfono no existía en ninguna
 * parte; cambiar un dato obligaba a buscarlo por todo el código. Ahora se
 * cambia una vez, aquí, y se actualiza en todo el sitio.
 *
 * ⚠ CAMPOS OBLIGATORIOS ANTES DE PUBLICAR
 * Los marcados con  PENDIENTE  hacen que el sitio muestre avisos y que
 * `npm run build` falle con un mensaje claro. Es deliberado: es preferible
 * que el build se detenga a que se publique una cédula inventada o un
 * teléfono que no existe.
 */

import { sitioUrl } from "./sitio";
export const PENDIENTE = "PENDIENTE" as const;

export const negocio = {
  nombre: "AllPet",
  nombreLegal: "AllPetcr",

  /** Nombre registral de la sociedad (Registro Nacional). */
  razonSocial: "3-102-969361 Sociedad de Responsabilidad Limitada",

  /** Cédula jurídica REAL. Proviene de Empresa.identificacion en el ERP. */
  cedulaJuridica: "3-102-969361",

  /** Inscrita en Hacienda en el régimen tradicional (IVA 13 % incluido en precios). */
  regimen: "Régimen tradicional",

  /** Solo dígitos, con código de país (506 para Costa Rica).
   *  Ej: "50688887777". Se usa para el enlace de WhatsApp. */
  whatsapp: "50688562992",

  /** Como se muestra en pantalla. Ej: "8888-7777". */
  telefonoVisible: "+506 8856-2992",

  /** Correos de contacto. El primero se usa por defecto en formularios. */
  correos: {
    sac: "servicioalcliente@allpetcr.com",
    soporte: "soporte@allpetcr.com",
  },

  /** Para compatibilidad con código que espera un solo correo. */
  get correo(): string {
    return this.correos.sac;
  },

  direccion: {
    /** Ej: "200 m norte de la iglesia, Local 3" */
    linea: "De la entrada principal de la UNA, 100 m oeste y 15 m norte",
    /** Ej: "San José" */
    canton: "Heredia Central",
    /** Ej: "San José" */
    provincia: "Heredia",
    pais: "Costa Rica",
    /** Coordenadas para Google Maps y datos estructurados.
     *  Se obtienen en Google Maps: clic derecho sobre el local → copiar. */
    lat: null as number | null,
    lng: null as number | null,
  },

  /** Horario en formato schema.org. Mo,Tu,We,Th,Fr,Sa,Su
   *  Ej: [{ dias: "Mo-Fr", abre: "08:00", cierra: "18:00" }] */
  horario: [{ dias: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], abre: "09:00", cierra: "19:00" }],

  /** Texto legible del horario, para mostrar en la página de contacto. */
  horarioTexto: "Lunes a sábado, 9:00 a.m. – 7:00 p.m. Domingo: local cerrado. La web recibe pedidos todos los días.",

  /** Dominio final, sin barra al final. Necesario para el sitemap,
   *  las URLs canónicas y las vistas previas al compartir. */
  sitioUrl,

  redes: {
    facebook: "",
    instagram: "",
  },

  /**
   * Pago con tarjeta en el sitio (pasarela del Banco Nacional).
   *
   * Mientras `activo` sea false, los términos y la política de privacidad
   * describen la compra por WhatsApp, que es lo que el sitio hace hoy. El día
   * que la pasarela quede funcionando se cambia a true y ambas páginas pasan
   * solas a describir el pago en línea. No encenderlo antes: la ley obliga a
   * que los términos digan lo que el sitio hace de verdad.
   *
   * `seguridad` y `certificadora` los exige el Reglamento 37899-MEIC art. 192
   * (tecnología que protege los datos de pago y quién la certifica). Se
   * llenan con lo que diga el Banco Nacional al afiliar el comercio; si
   * `activo` es true y están vacíos, las pruebas fallan y no se publica.
   */
  pagoEnLinea: {
    activo: false,
    banco: "Banco Nacional de Costa Rica",
    /** Ej: "Visa y Mastercard, de crédito y débito". */
    tarjetas: "",
    /** Ej: "conexión cifrada y autenticación 3-D Secure". */
    seguridad: "",
    /** Ej: "PCI Security Standards Council (norma PCI DSS)". */
    certificadora: "",
  },

  /**
   * Enlace público a las reseñas de clientes (ej. el perfil de Google de la
   * tienda). El Reglamento 37899-MEIC art. 196 pide un medio visible para
   * opiniones buenas y malas. Obligatorio antes de encender el pago en línea.
   */
  resenasUrl: "",

  /** Garantía de aparatos (fuentes, comederos automáticos, lámparas, juguetes
   *  eléctricos). Ley 7472 art. 43: para bienes duraderos la duración se
   *  tiene que decir por escrito. */
  garantiaAparatosMeses: 3,

  /** Días hábiles máximos para responder un reclamo (Reglamento 37899-MEIC art. 195). */
  diasRespuestaReclamo: 5,

  /** Monto mínimo de pedido en colones. 0 = sin mínimo. */
  pedidoMinimo: 0,
} as const;
/** true si el dato está sin completar. */
export function faltante(valor: unknown): boolean {
  return valor === PENDIENTE || valor === "" || valor === null || valor === undefined;
}

/** Lista de campos obligatorios que siguen sin completar. */
export function camposPendientes(): string[] {
  const faltan: string[] = [];
  if (faltante(negocio.cedulaJuridica)) faltan.push("cedulaJuridica");
  if (faltante(negocio.whatsapp)) faltan.push("whatsapp");
  if (faltante(negocio.telefonoVisible)) faltan.push("telefonoVisible");
  if (faltante(negocio.correos.sac)) faltan.push("correos.sac");
  if (faltante(negocio.direccion.linea)) faltan.push("direccion.linea");
  if (faltante(negocio.direccion.canton)) faltan.push("direccion.canton");
  if (faltante(negocio.horarioTexto)) faltan.push("horarioTexto");
  const p = negocio.pagoEnLinea;
  if (p.activo) {
    if (faltante(p.tarjetas)) faltan.push("pagoEnLinea.tarjetas");
    if (faltante(p.seguridad)) faltan.push("pagoEnLinea.seguridad");
    if (faltante(p.certificadora)) faltan.push("pagoEnLinea.certificadora");
    if (faltante(negocio.resenasUrl)) faltan.push("resenasUrl");
  }
  return faltan;
}

/** Dirección completa en una línea, para mostrar y para el NAP.
 *  El NAP (nombre, dirección, teléfono) debe ser IDÉNTICO en todas partes:
 *  Google compara literalmente, así que una variación en el formato debilita
 *  el posicionamiento local. Por eso se genera aquí y no se escribe a mano. */
export function direccionCompleta(): string {
  const d = negocio.direccion;
  if (faltante(d.linea)) return "";
  return [d.linea, d.canton, d.provincia, d.pais].filter((x) => !faltante(x)).join(", ");
}

/** Enlace de WhatsApp con mensaje precargado. */
export function urlWhatsApp(mensaje: string): string {
  if (faltante(negocio.whatsapp)) return "";
  return `https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

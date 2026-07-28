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

export const PENDIENTE = "PENDIENTE" as const;

export const negocio = {
  nombre: "AllPet",
  nombreLegal: "AllPetcr",

  /** Cédula jurídica REAL. En el ERP vive en Empresa.identificacion.
   *  La que estaba antes en el pie (3-101-999999) era ficticia. */
  cedulaJuridica: PENDIENTE,

  regimen: "Régimen de Tributación Simplificada",

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
    linea: PENDIENTE,
    /** Ej: "San José" */
    canton: PENDIENTE,
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
  horario: [{ dias: "Mo-Fr", abre: "08:30", cierra: "19:00" }],

  /** Texto legible del horario, para mostrar en la página de contacto. */
  horarioTexto: "Lunes a viernes, 8:30 a.m. – 7:00 p.m.",

  /** Dominio final, sin barra al final. Necesario para el sitemap,
   *  las URLs canónicas y las vistas previas al compartir. */
  sitioUrl: "https://allpetcr.com",

  redes: {
    facebook: "",
    instagram: "",
  },

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

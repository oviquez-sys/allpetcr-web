import "server-only";

/**
 * Único punto por el que este sitio le habla al ERP para lo que NO es
 * catálogo de solo lectura (eso vive en lib/data.ts): avisos de
 * disponibilidad, pedidos, estado de pedido.
 *
 * `import "server-only"` (paquete de Next.js/Vercel) hace que el build
 * FALLE si algún componente cliente llega a importar este archivo, aunque
 * sea sin querer a través de otro módulo. Es la red de seguridad de que
 * ERP_API_TOKEN nunca viaja al navegador — no depende de acordarse de
 * revisarlo a mano en cada código nuevo.
 */
const ERP_API_URL = process.env.ERP_API_URL;
const ERP_API_TOKEN = process.env.ERP_API_TOKEN;

export class ErpNoConfiguradoError extends Error {
  constructor() {
    super("ERP_API_URL / ERP_API_TOKEN no están configuradas.");
    this.name = "ErpNoConfiguradoError";
  }
}

/** Error de negocio que el ERP devolvió (400/404/...), con su detalle tal
 * cual lo mandó — para poder mostrárselo al cliente sin inventar texto. */
export class ErpRespuestaError extends Error {
  status: number;
  cuerpo: unknown;
  constructor(status: number, cuerpo: unknown) {
    super(`El ERP respondió ${status}`);
    this.name = "ErpRespuestaError";
    this.status = status;
    this.cuerpo = cuerpo;
  }
}

async function erpRequest<T>(ruta: string, init: RequestInit): Promise<T> {
  if (!ERP_API_URL || !ERP_API_TOKEN) throw new ErpNoConfiguradoError();
  const respuesta = await fetch(`${ERP_API_URL}${ruta}`, {
    ...init,
    headers: {
      Authorization: `Token ${ERP_API_TOKEN}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    // Estas llamadas son transaccionales (crean o consultan un pedido, un
    // aviso): nunca deben servirse de una caché vieja.
    cache: "no-store",
  });
  const cuerpo = await respuesta.json().catch(() => null);
  if (!respuesta.ok) throw new ErpRespuestaError(respuesta.status, cuerpo);
  return cuerpo as T;
}

export function erpGet<T>(ruta: string): Promise<T> {
  return erpRequest<T>(ruta, { method: "GET" });
}

export function erpPost<T>(ruta: string, body: unknown): Promise<T> {
  return erpRequest<T>(ruta, { method: "POST", body: JSON.stringify(body) });
}

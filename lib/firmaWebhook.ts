import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verificación de firma HMAC-SHA256 para webhooks de pago (Bloque 5, ítem
 * 35). Genérica a propósito: sin credenciales reales de ninguna pasarela
 * (el encargo lo prohíbe explícitamente), este es el patrón que casi
 * todas usan (HMAC del cuerpo crudo con un secreto compartido) — cuando
 * se elija una pasarela real, esto se ajusta al formato exacto de esa
 * pasarela, no se reescribe desde cero.
 *
 * El cuerpo tiene que ser el texto CRUDO de la petición, tal cual llegó,
 * no el resultado de volver a serializar el JSON ya parseado: reordenar
 * claves o cambiar el espaciado cambia la firma calculada, y una petición
 * legítima se rechazaría por error.
 */
export function calcularFirma(secreto: string, cuerpoCrudo: string): string {
  return createHmac("sha256", secreto).update(cuerpoCrudo).digest("hex");
}

export function firmaValida(secreto: string, cuerpoCrudo: string, firmaRecibida: string | null): boolean {
  if (!secreto || !firmaRecibida) return false;
  const esperada = Buffer.from(calcularFirma(secreto, cuerpoCrudo), "hex");
  const recibida = Buffer.from(firmaRecibida, "hex");
  // Comparación de tiempo constante: comparar con === filtraría, por
  // cuánto tarda en fallar, cuántos bytes iniciales acertó un atacante
  // probando firmas — una fuga de temporización clásica. Antes hay que
  // igualar el largo a mano porque timingSafeEqual lanza (no devuelve
  // false) si los búferes no miden lo mismo.
  if (esperada.length !== recibida.length) return false;
  return timingSafeEqual(esperada, recibida);
}

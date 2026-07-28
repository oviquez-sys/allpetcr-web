import { camposPendientes } from "@/lib/negocio";

/**
 * Banda de aviso cuando faltan datos reales del negocio.
 *
 * Existe para que sea imposible publicar el sitio sin darse cuenta de que la
 * cédula jurídica o el teléfono siguen sin completar. En producción no se
 * muestra: si alguien despliega con datos faltantes, el build ya habrá
 * fallado antes (ver scripts/verificar-datos.mjs).
 *
 * Es deliberadamente feo. Un aviso discreto se ignora.
 */
export default function AvisoConfiguracion() {
  if (process.env.NODE_ENV === "production") return null;

  const faltan = camposPendientes();
  if (faltan.length === 0) return null;

  return (
    <div className="border-b-2 border-dorado-500 bg-dorado-100 px-6 py-3 text-center text-[13px] text-dorado-900">
      <strong className="font-semibold">Faltan datos reales del negocio</strong>{" "}
      — completá <code className="rounded bg-dorado-200 px-1.5 py-0.5 font-mono text-[12px]">lib/negocio.ts</code>{" "}
      antes de publicar. Pendientes: {faltan.join(", ")}.
    </div>
  );
}

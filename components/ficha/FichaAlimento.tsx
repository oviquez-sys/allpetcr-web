import type { FichaAlimento as Ficha, Nutriente } from "@/lib/types";
import { formatoNumero, idealPara } from "@/lib/alimentos";
import IconoBeneficio from "./IconoBeneficio";

/**
 * FICHA DE ALIMENTO (26/09/2026)
 *
 * VENDER PRIMERO, EXPLICAR DESPUÉS
 * La parte de arriba de la página de producto (foto, precio, botón) no
 * cambia. Esto va debajo: primero los beneficios e "Ideal para", que se leen
 * de un vistazo; después, plegado, todo lo técnico.
 *
 * POR QUÉ <details> Y NO PESTAÑAS CON JAVASCRIPT
 * <details> abre y cierra sin una línea de JS, funciona con teclado y lector
 * de pantalla, y —lo más importante para esta página— el texto de las
 * secciones cerradas ESTÁ en el HTML: Google lo lee aunque el cliente no
 * las abra. Un componente de pestañas en el cliente dejaría la información
 * nutricional fuera del HTML inicial.
 *
 * NADA VACÍO
 * Cada sección se pinta solo si tiene datos. No hay "Información no
 * disponible": un fabricante que no publica la guía de alimentación
 * simplemente no tiene esa sección.
 *
 * Todo sale del ERP (catalogo.FichaAlimento), investigado contra la fuente
 * oficial. Este componente no calcula ni completa nada.
 */

/** Valor canónico del ERP ("0.35", "1800") → formato local ("0,35", "1 800"),
 *  conservando los decimales que publicó el fabricante ("26.0" → "26,0"). */
function valorLocal(valor: string): string {
  const m = valor.match(/^(\d+)(?:\.(\d+))?(.*)$/);
  if (!m) return valor;
  const entero = formatoNumero(Number(m[1]));
  return `${entero}${m[2] ? `,${m[2]}` : ""}${m[3]}`;
}

function textoNutriente(n: Nutriente): string {
  return [n.calificador, `${valorLocal(n.valor)}${n.unidad === "%" ? " %" : n.unidad ? ` ${n.unidad}` : ""}`]
    .filter(Boolean)
    .join(" ");
}

function Seccion({ titulo, abierta = false, children }: { titulo: string; abierta?: boolean; children: React.ReactNode }) {
  return (
    <details open={abierta} className="group border-b border-crema-400">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-medium text-navy-500 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 [&::-webkit-details-marker]:hidden">
        <h3>{titulo}</h3>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
          strokeLinecap="round" aria-hidden="true"
          className="shrink-0 text-navy-400 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </summary>
      <div className="pb-6 text-sm leading-relaxed text-navy-400">{children}</div>
    </details>
  );
}

export default function FichaAlimento({ ficha, presentacion }: { ficha: Ficha; presentacion?: string }) {
  const ideal = idealPara(ficha);
  const guia = ficha.guia_alimentacion;
  const hayGuia = Boolean(guia?.columnas?.length && guia?.filas?.length);
  const hayNutricion = ficha.analisis.length > 0 || ficha.kcal_kg || ficha.kcal_unidad;
  const detalles = [
    ["Marca", ficha.marca],
    ["Línea", ficha.linea],
    ["Fórmula", ficha.nombre],
    ["Tipo", ficha.tipo?.etiqueta],
    ["Sabor", ficha.sabor],
    ["Proteína principal", ficha.proteina_principal],
    ["Presentación", presentacion],
  ].filter((d): d is [string, string] => Boolean(d[1]));

  return (
    <section aria-labelledby="ficha-titulo" className="mx-auto max-w-contenido px-6 pb-16">
      <h2 id="ficha-titulo" className="sr-only">Información del alimento</h2>

      {ficha.beneficios.length > 0 && (
        <div className="border-t border-crema-400 pt-10">
          <h3 className="text-label font-medium uppercase text-dorado-700">Beneficios</h3>
          <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            {ficha.beneficios.slice(0, 5).map((b) => (
              <li key={b.clave} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-crema-200 text-navy-500">
                  <IconoBeneficio clave={b.clave} className="h-[22px] w-[22px]" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-navy-500">{b.etiqueta}</p>
                  {b.texto && <p className="mt-1 text-sm font-light leading-snug text-navy-400">{b.texto}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {ideal.length > 0 && (
        <div className="mt-10">
          <h3 className="text-label font-medium uppercase text-dorado-700">Ideal para</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {ideal.map((i) => (
              <li key={i} className="rounded-full border border-crema-400 bg-white px-4 py-2 text-sm text-navy-500">
                {i}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-12 border-t border-crema-400">
        {ficha.descripcion && (
          <Seccion titulo="Descripción" abierta>
            <p className="max-w-prose">{ficha.descripcion}</p>
          </Seccion>
        )}

        {hayNutricion && (
          <Seccion titulo="Información nutricional">
            {ficha.analisis.length > 0 && (
              <>
                <p className="mb-3 text-xs text-navy-400">Análisis garantizado, según el fabricante.</p>
                <table className="w-full max-w-xl text-left">
                  <tbody className="divide-y divide-crema-300">
                    {ficha.analisis.map((n, i) => (
                      <tr key={`${n.clave}-${i}`}>
                        <th scope="row" className="py-2 pr-4 font-normal text-navy-500">{n.etiqueta}</th>
                        <td className="whitespace-nowrap py-2 text-right tabular-nums text-navy-500">{textoNutriente(n)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {(ficha.kcal_kg || ficha.kcal_unidad) && (
              <p className="mt-4 text-navy-500">
                <span className="font-medium">Energía metabolizable: </span>
                {[
                  ficha.kcal_kg ? `${formatoNumero(ficha.kcal_kg)} kcal/kg` : "",
                  ficha.kcal_unidad ? `${formatoNumero(ficha.kcal_unidad)} kcal por ${ficha.unidad_kcal}` : "",
                ].filter(Boolean).join(" · ")}
              </p>
            )}
          </Seccion>
        )}

        {(ficha.ingredientes || ficha.aditivos) && (
          <Seccion titulo="Ingredientes">
            {ficha.ingredientes && (
              <>
                <p className="mb-2 text-xs text-navy-400">Lista oficial del fabricante, en su orden original.</p>
                <p className="max-w-prose">{ficha.ingredientes}</p>
              </>
            )}
            {ficha.aditivos && (
              <>
                <h4 className="mt-5 font-medium text-navy-500">Aditivos (por kg)</h4>
                <p className="mt-1 max-w-prose">{ficha.aditivos}</p>
              </>
            )}
          </Seccion>
        )}

        {hayGuia && (
          <Seccion titulo="Guía de alimentación">
            {guia.titulo && <p className="mb-3 text-xs text-navy-400">{guia.titulo}. Cantidades diarias.</p>}
            {/* La tabla puede tener siete columnas: en el celular se desliza
                de lado y la columna del peso queda fija, para no perder de
                vista a qué fila corresponde cada cantidad. */}
            <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-crema-400">
                    {guia.columnas!.map((c, i) => (
                      <th key={c + i} scope="col"
                        className={`whitespace-nowrap px-3 py-2 font-medium text-navy-500 ${i === 0 ? "sticky left-0 bg-white pl-0" : ""}`}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-crema-300">
                  {guia.filas!.map((f, i) => (
                    <tr key={i}>
                      {f.map((v, j) => (
                        <td key={j} className={`whitespace-nowrap px-3 py-2 tabular-nums text-navy-500 ${j === 0 ? "sticky left-0 bg-white pl-0 font-medium" : ""}`}>
                          {v || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {guia.nota && <p className="mt-4 max-w-prose text-xs">{guia.nota}</p>}
          </Seccion>
        )}

        {detalles.length > 0 && (
          <Seccion titulo="Detalles del producto">
            <dl className="grid max-w-xl grid-cols-[auto_1fr] gap-x-6 gap-y-2">
              {detalles.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-navy-400">{k}</dt>
                  <dd className="text-navy-500">{v}</dd>
                </div>
              ))}
            </dl>
          </Seccion>
        )}
      </div>
    </section>
  );
}

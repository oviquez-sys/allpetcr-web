"use client";

import Link from "next/link";
import { useState } from "react";

interface Mascota {
  nombre: string;
  especie: "" | "PER" | "GAT" | "CON" | "ROE" | "OTR";
  raza: string;
  edad_anios: string;
  edad_meses: string;
  peso_kg: string;
  notas: string;
  /** JPEG ya achicado en el celular, como data URL; "" si no subió foto. */
  foto: string;
}

const vacia = (): Mascota => ({
  nombre: "", especie: "", raza: "", edad_anios: "", edad_meses: "", peso_kg: "", notas: "", foto: "",
});
const MAX = 5;
// Las fotos de celular pesan 3-8 MB; mandarlas así se tarda con datos móviles
// y el ERP las achica igual. Se achican acá a 1024 px (~150 KB) antes de enviar.
const LADO_FOTO = 1024;

const campo =
  "w-full rounded-lg border border-crema-500 bg-white px-3.5 py-2.5 text-[16px] outline-none transition-colors " +
  "focus-visible:border-navy-500 focus-visible:ring-2 focus-visible:ring-navy-500/30";
const rotulo = "mb-1 block text-sm text-navy-500";

const ESPECIES: { valor: Mascota["especie"]; texto: string }[] = [
  { valor: "PER", texto: "Perro" },
  { valor: "GAT", texto: "Gato" },
  // Conejos y roedores desde el 26/11/2026 (pedido de Oscar). Mismas claves
  // que el ERP (manada.Mascota.Especie).
  { valor: "CON", texto: "Conejo" },
  { valor: "ROE", texto: "Hámster o roedor" },
  { valor: "OTR", texto: "Otro" },
];

async function achicarFoto(archivo: File): Promise<string> {
  // createImageBitmap respeta la orientación de la cámara (que no quede de lado).
  const imagen = await createImageBitmap(archivo, { imageOrientation: "from-image" });
  const escala = Math.min(1, LADO_FOTO / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  lienzo.getContext("2d")!.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  imagen.close();
  return lienzo.toDataURL("image/jpeg", 0.82);
}

function listaDeNombres(nombres: string[]) {
  return nombres.length > 1 ? `${nombres.slice(0, -1).join(", ")} y ${nombres.at(-1)}` : nombres[0];
}

/**
 * `conSorteo` (17/11/2026, decisión de Oscar): durante la Navidad AllPet 2026,
 * registrar al menos una mascota con nombre, especie y edad aproximada da 1
 * número extra para el sorteo, una sola vez por persona. La foto sigue
 * siendo opcional y privada. Lo da el ERP; aquí solo se pide la edad y se
 * muestra lo que el ERP confirmó.
 */
export default function FormularioMascotas({ token, conSorteo = false }: { token: string; conSorteo?: boolean }) {
  const [mascotas, setMascotas] = useState<Mascota[]>([vacia()]);
  const [enviando, setEnviando] = useState(false);
  const [cargandoFoto, setCargandoFoto] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);
  const [extra, setExtra] = useState<{ numeroExtra: boolean; numeros: number | null } | null>(null);

  const cambiar = (i: number, campo: keyof Mascota, valor: string) =>
    setMascotas((ms) => ms.map((m, j) => (j === i ? { ...m, [campo]: valor } : m)));

  async function elegirFoto(i: number, archivo: File | undefined) {
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) {
      setError("Eso no parece una foto. Elegí una imagen.");
      return;
    }
    setError("");
    setCargandoFoto(i);
    try {
      cambiar(i, "foto", await achicarFoto(archivo));
    } catch {
      setError("No pudimos abrir esa foto. Probá con otra o tomala con la cámara.");
    }
    setCargandoFoto(null);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const falta = mascotas.findIndex((m) => !m.nombre.trim() || !m.especie);
    if (falta >= 0) {
      setError(mascotas.length > 1 ? `A la mascota ${falta + 1} le falta el nombre o qué animal es.`
        : "Falta el nombre o qué animal es.");
      return;
    }
    // Con sorteo: al menos una mascota con edad, que es lo que da el número
    // extra (y lo que sirve para avisarle de su alimento y su cumpleaños).
    if (conSorteo && !mascotas.some((m) => m.edad_anios !== "" || m.edad_meses !== "")) {
      setError("Para el número extra, decinos la edad aproximada (aunque sea solo los años).");
      return;
    }
    setEnviando(true);
    try {
      const r = await fetch("/api/manada/mascotas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          mascotas: mascotas.map((m) => ({
            nombre: m.nombre.trim(), especie: m.especie, raza: m.raza.trim(),
            edad_anios: m.edad_anios || 0, edad_meses: m.edad_meses || 0,
            peso_kg: m.peso_kg.trim(), notas: m.notas.trim(), foto: m.foto || undefined,
          })),
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(d.error ?? "No pudimos guardarlo. Probá de nuevo.");
      } else {
        setExtra({ numeroExtra: d.numeroExtra === true, numeros: typeof d.numeros === "number" ? d.numeros : null });
        setListo(true);
        // La confirmación es más corta que el formulario: sin esto quedaba
        // a la vista el pie de página y el cliente no veía el «listo».
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError("Sin conexión. Revisá el internet y probá de nuevo.");
    }
    setEnviando(false);
  }

  if (listo) {
    const nombres = mascotas.map((m) => m.nombre.trim());
    const fotos = mascotas.filter((m) => m.foto);
    return (
      <div role="status" className="mt-8 rounded-card bg-white p-8 text-center ring-1 ring-crema-400">
        {fotos.length > 0 && (
          <div className="mb-5 flex justify-center -space-x-3">
            {fotos.map((m, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- vista previa local (data URL), no pasa por next/image
              <img key={i} src={m.foto} alt={m.nombre} className="h-20 w-20 rounded-full border-4 border-white object-cover shadow" />
            ))}
          </div>
        )}
        <p className="font-display text-bloque text-navy-500">
          ¡{listaDeNombres(nombres)} ya {nombres.length > 1 ? "son" : "es"} parte de la manada! 🐾
        </p>
        <p className="mt-3 text-[15px] font-light text-navy-400">
          {nombres.length > 1 ? "Gracias por presentárnoslos. Los esperamos en la tienda."
            : "Gracias por presentárnoslo. Lo esperamos en la tienda."}
        </p>
        {extra?.numeroExtra && (
          <p className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-[15px] font-medium text-emerald-800">
            🎄 Sumaste 1 número extra para el sorteo de Navidad
            {extra.numeros ? `: ya llevás ${extra.numeros}.` : "."}
          </p>
        )}
        {conSorteo && (
          <Link href="/catalogo" className="mt-6 inline-flex h-12 items-center rounded-full bg-navy-500 px-7 text-[15px] font-medium text-crema-100 hover:bg-navy-600">
            Ver productos
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-8 space-y-6" noValidate>
      {mascotas.map((m, i) => (
        <fieldset key={i} className="space-y-4 rounded-card bg-white p-5 ring-1 ring-crema-400">
          <legend className="sr-only">Peludo {i + 1}</legend>
          {mascotas.length > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-label uppercase text-dorado-700">Peludo {i + 1}</span>
              <button type="button" onClick={() => setMascotas((ms) => ms.filter((_, j) => j !== i))}
                className="text-sm text-navy-400 underline underline-offset-2">Quitar</button>
            </div>
          )}

          <div className="flex flex-col items-center">
            <label htmlFor={`m${i}-foto`}
              className="group relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-dorado-500 bg-crema-100 text-center focus-within:ring-2 focus-within:ring-navy-500">
              {m.foto ? (
                // eslint-disable-next-line @next/next/no-img-element -- vista previa local (data URL)
                <img src={m.foto} alt={`Foto de ${m.nombre || "tu peludo"}`} className="h-full w-full object-cover" />
              ) : (
                <span className="px-3 text-[13px] leading-tight text-dorado-700">
                  {cargandoFoto === i ? "Cargando…" : <>📷<br />Subí su foto</>}
                </span>
              )}
              <input id={`m${i}-foto`} type="file" accept="image/*" className="sr-only"
                onChange={(e) => { elegirFoto(i, e.target.files?.[0]); e.target.value = ""; }} />
            </label>
            {m.foto && (
              <button type="button" onClick={() => cambiar(i, "foto", "")}
                className="mt-2 text-[13px] text-navy-400 underline underline-offset-2">Quitar foto</button>
            )}
          </div>

          <div>
            <label htmlFor={`m${i}-nombre`} className={rotulo}>¿Cómo se llama?</label>
            <input id={`m${i}-nombre`} value={m.nombre} maxLength={60} className={campo}
              onChange={(e) => cambiar(i, "nombre", e.target.value)} />
          </div>
          <div role="radiogroup" aria-label="Qué animal es" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ESPECIES.map((es) => (
              <button key={es.valor} type="button" role="radio" aria-checked={m.especie === es.valor}
                onClick={() => cambiar(i, "especie", es.valor)}
                className={`rounded-full border px-3 py-2.5 text-sm transition-colors ${
                  m.especie === es.valor ? "border-navy-500 bg-navy-500 text-crema-100" : "border-crema-500 bg-white text-navy-500"}`}>
                {es.texto}
              </button>
            ))}
          </div>
          <div>
            <label htmlFor={`m${i}-raza`} className={rotulo}>Raza o tipo <span className="text-navy-400">(«zaguate», «hámster sirio»…)</span></label>
            <input id={`m${i}-raza`} value={m.raza} maxLength={80} className={campo}
              onChange={(e) => cambiar(i, "raza", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor={`m${i}-anios`} className={rotulo}>{conSorteo ? "Edad: años" : "Años"}</label>
              <select id={`m${i}-anios`} value={m.edad_anios} className={campo}
                onChange={(e) => cambiar(i, "edad_anios", e.target.value)}>
                <option value="">—</option>
                {Array.from({ length: 26 }, (_, n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor={`m${i}-meses`} className={rotulo}>Meses</label>
              <select id={`m${i}-meses`} value={m.edad_meses} className={campo}
                onChange={(e) => cambiar(i, "edad_meses", e.target.value)}>
                <option value="">—</option>
                {Array.from({ length: 12 }, (_, n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor={`m${i}-peso`} className={rotulo}>Peso (kg)</label>
              <input id={`m${i}-peso`} value={m.peso_kg} inputMode="decimal" maxLength={6} placeholder="ej. 8,5"
                className={campo} onChange={(e) => cambiar(i, "peso_kg", e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor={`m${i}-notas`} className={rotulo}>
              ¿Algo más? <span className="text-navy-400">(qué come, alergias…)</span>
            </label>
            <input id={`m${i}-notas`} value={m.notas} maxLength={200} className={campo}
              onChange={(e) => cambiar(i, "notas", e.target.value)} />
          </div>
        </fieldset>
      ))}

      {mascotas.length < MAX && (
        <button type="button" onClick={() => setMascotas((ms) => [...ms, vacia()])}
          className="w-full rounded-full border border-dashed border-navy-200 px-6 py-3 text-sm text-navy-500 hover:bg-white">
          + Tengo otro peludo
        </button>
      )}

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={enviando || cargandoFoto !== null}
        className="w-full rounded-full bg-navy-500 px-6 py-3.5 text-[15px] font-medium text-crema-100 transition-colors hover:bg-navy-600 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
        {enviando ? "Guardando…" : mascotas.length > 1 ? "🐾 Sumarlos a la manada" : "🐾 Sumarlo a la manada"}
      </button>
      <p className="text-center text-[13px] text-navy-400">Se envía una sola vez: revisá antes de tocar el botón.</p>
    </form>
  );
}

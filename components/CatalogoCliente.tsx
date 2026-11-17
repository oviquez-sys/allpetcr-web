"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import TarjetaProducto from "@/components/TarjetaProducto";
import { ESPECIES, esParaEspecie, idsRama, type ClaveEspecie } from "@/lib/navegacion";
import { coincideProducto, puntajeCoincidencia } from "@/lib/busqueda";
import { presentacionVisible } from "@/lib/formato";
import { puntajeFicha } from "@/lib/publicacion";
import { agruparTallas } from "@/lib/variantes";
import { claveMarca, opcionesMarca, opcionesSubcategoria } from "@/lib/filtrosCatalogo";
import { urlWhatsApp } from "@/lib/negocio";
import type { Categoria, Producto } from "@/lib/types";
import { enOferta } from "@/lib/ofertas";

interface Props {
  productos: Producto[];
  categorias: Categoria[];
  busquedaInicial?: string;
  categoriaInicial?: string;
  /** Ids de categoría ya validados en el servidor (parámetro ?cats=). */
  idsIniciales?: number[];
  /** Especie preseleccionada (parámetro ?para=perro|gato). */
  especieInicial?: ClaveEspecie | null;
  ordenInicial?: Orden;
  disponiblesInicial?: boolean;
  /** Claves de marca (parámetro ?marca=zeedog,gosbi). */
  marcasIniciales?: string[];
  /** Subcategoría elegida dentro de la categoría (parámetro ?sub=). */
  subInicial?: number | null;
  /** Solo productos en oferta (parámetro ?ofertas=1, 04/11/2026). */
  ofertasInicial?: boolean;
}

/** Cuántas marcas se ven antes de «Ver todas». */
const MARCAS_A_LA_VISTA = 8;

type Orden = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

export default function CatalogoCliente({
  productos,
  categorias,
  busquedaInicial = "",
  categoriaInicial = "",
  idsIniciales = [],
  especieInicial = null,
  ordenInicial = "relevancia",
  disponiblesInicial = false,
  marcasIniciales = [],
  subInicial = null,
  ofertasInicial = false,
}: Props) {
  const [busqueda, setBusqueda] = useState(busquedaInicial);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [catsElegidas, setCatsElegidas] = useState<number[]>(() => {
    // `cats` (ids) tiene prioridad: es lo que generan los enlaces del sitio.
    // `c` (nombre) queda como respaldo para enlaces viejos ya compartidos.
    if (idsIniciales.length > 0) return idsIniciales;
    if (!categoriaInicial) return [];
    const encontrada = categorias.find(
      (c) => c.nombre.toLowerCase() === categoriaInicial.toLowerCase()
    );
    return encontrada ? [encontrada.id] : [];
  });
  const [especie, setEspecie] = useState<ClaveEspecie | null>(especieInicial);
  const [soloDisponibles, setSoloDisponibles] = useState(disponiblesInicial);
  const [orden, setOrden] = useState<Orden>(ordenInicial);
  const [marcas, setMarcas] = useState<string[]>(marcasIniciales);
  const [sub, setSub] = useState<number | null>(subInicial);
  const [soloOfertas, setSoloOfertas] = useState(ofertasInicial);
  const hayOfertas = useMemo(() => productos.some(enOferta), [productos]);
  const [todasLasMarcas, setTodasLasMarcas] = useState(false);
  useEffect(() => {
    const temporizador = setTimeout(() => {
      const params = new URLSearchParams();
      if (busqueda.trim()) params.set("q", busqueda.trim());
      if (catsElegidas.length) params.set("cats", catsElegidas.join(","));
      if (especie) params.set("para", especie);
      if (soloDisponibles) params.set("disponibles", "1");
      if (orden !== "relevancia") params.set("orden", orden);
      if (marcas.length) params.set("marca", marcas.join(","));
      if (sub !== null) params.set("sub", String(sub));
      if (soloOfertas) params.set("ofertas", "1");
      const query = params.toString();
      window.history.replaceState(null, "", `/catalogo${query ? `?${query}` : ""}`);
    }, 400);
    return () => clearTimeout(temporizador);
  }, [busqueda, catsElegidas, especie, soloDisponibles, orden, marcas, sub, soloOfertas]);

  // El ERP publica solo lo que hay en existencia (regla del 02/08/2026), así
  // que normalmente TODO lo que llega está disponible y la casilla "solo con
  // existencias" no filtraría nada. Una casilla que no filtra nada es
  // exactamente el defecto que se corrigió en la navegación: parece que hace
  // algo y no hace nada. Se muestra solo si hay algo que filtrar — que es el
  // caso cuando el exportador corre con --incluir-agotados.
  const hayAgotados = useMemo(() => productos.some((p) => !p.disponible), [productos]);

  // Solo se ofrece el filtro por especie si los datos lo soportan. Si el ERP
  // todavía no exportó `mascota`, el filtro daría cero resultados siempre.
  const hayMascota = useMemo(() => productos.some((p) => p.mascota), [productos]);

  // La búsqueda se difiere: el input se actualiza de inmediato (se siente
  // instantáneo al escribir) y el filtrado de 184 productos corre en una
  // prioridad más baja, sin bloquear la tecla siguiente. Antes, cada
  // pulsación re-filtraba y re-renderizaba la grilla completa de forma
  // síncrona, y eso es lo que producía el tirón.
  const busquedaDiferida = useDeferredValue(busqueda);
  const filtrando = busqueda !== busquedaDiferida;

  // Un Map en vez de `categorias.find()` por producto. Con .find() dentro del
  // map de la grilla eran 184 búsquedas lineales en cada render, y además
  // devolvía una función nueva por render, lo que rompía la memoización de
  // las tarjetas.
  const nombrePorCategoria = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of categorias) m.set(c.id, c.nombre);
    return m;
  }, [categorias]);

  /** Nombre de la subcategoría y de su categoría raíz, para la búsqueda. */
  const categoriasDe = useMemo(() => {
    const padre = new Map(categorias.map((c) => [c.id, c.padre_id]));
    return (id: number | null): string => {
      if (id === null) return "";
      const raiz = padre.get(id);
      return [nombrePorCategoria.get(id), raiz != null ? nombrePorCategoria.get(raiz) : ""].filter(Boolean).join(" ");
    };
  }, [categorias, nombrePorCategoria]);

  // Jerarquía de 2 niveles: Alimento y Snacks son hijas de Perros/Gatos
  // (padre_id). Elegir una categoría raíz en el filtro debe incluir también
  // los productos de sus subcategorías, no solo los que tienen ese id exacto.
  // Memoizado por `categorias` para poder usarse dentro de otros useMemo sin
  // warnings de exhaustive-deps (la función cambiaría de identidad en cada
  // render si no estuviera envuelta aquí).
  const idsConHijos = useMemo(() => {
    return (id: number): number[] => {
      return idsRama(categorias, id);
    };
  }, [categorias]);

  // En el filtro lateral solo se listan categorías raíz (padre_id === null):
  // Perros, Gatos, Higiene, Accesorios. Solo se ofrecen las que tienen al
  // menos un producto propio o de alguna subcategoría — un filtro que
  // devuelve cero resultados siempre es un error de diseño, no una opción.
  const categoriasConProductos = useMemo(() => {
    const raices = categorias.filter((c) => c.padre_id === null);
    return raices
      .map((c) => {
        const ids = idsConHijos(c.id);
        const cuantos = productos.filter(
          (p) => p.categoria_id !== null && ids.includes(p.categoria_id) && (!especie || esParaEspecie(p.mascota, especie))
        ).length;
        return { ...c, cuantos };
      })
      .filter((c) => c.cuantos > 0 || catsElegidas.includes(c.id));
  }, [productos, categorias, idsConHijos, especie, catsElegidas]);

  const whatsappBusqueda = urlWhatsApp(
    `Hola, busqué «${busquedaDiferida.trim()}» en allpetcr.com y no lo encontré. ¿Lo tienen o me lo pueden conseguir?`,
  );

  // Subcategorías (lib/filtrosCatalogo.ts): solo con UNA categoría raíz
  // elegida y solo si el ERP ya asignó subcategoría a casi todo (regla 90 %).
  const raizUnica =
    catsElegidas.length === 1 && categorias.find((c) => c.id === catsElegidas[0])?.padre_id === null
      ? catsElegidas[0]
      : null;
  const subOpciones = useMemo(() => {
    if (raizUnica === null) return [];
    const base = especie ? productos.filter((p) => esParaEspecie(p.mascota, especie)) : productos;
    return opcionesSubcategoria(categorias, base, raizUnica);
  }, [raizUnica, categorias, productos, especie]);
  const subActiva = sub !== null && subOpciones.some((o) => o.id === sub) ? sub : null;

  // Todo menos la marca: de acá salen las marcas que se ofrecen, así cada
  // marca de la lista tiene productos con los demás filtros puestos.
  const sinMarca = useMemo(() => {
    const term = busquedaDiferida.trim().toLowerCase();
    // Expandir cada categoría raíz elegida a [ella misma, ...sus hijas].
    const idsElegidos = subActiva !== null ? idsConHijos(subActiva) : catsElegidas.flatMap((id) => idsConHijos(id));
    return productos.filter((p) => {
      if (soloOfertas && !enOferta(p)) return false;
      if (soloDisponibles && !p.disponible) return false;
      if (especie && !esParaEspecie(p.mascota, especie)) return false;
      if (catsElegidas.length > 0) {
        if (p.categoria_id === null || !idsElegidos.includes(p.categoria_id)) return false;
      }
      if (term) {
        // El SKU es un código, no lenguaje: un típeo ahí no "significa
        // casi lo mismo" como con una palabra (75341 no es "casi" 75342).
        // Se busca exacto por substring, nunca aproximado.
        const enSku = p.sku.toLowerCase().includes(term);
        // El nombre tolera errores de escritura (ítem 32): "coyar"
        // encuentra "collar". De la presentación entra solo la
        // presentación que el cliente puede ver: buscar "paquete" devolvía
        // 141 de 184 productos por un dato que no está en pantalla. La
        // descripción entra porque es donde están el material, la talla y
        // el uso ("arnés acolchado", "para cachorro"), que es como la
        // gente busca de verdad.
        //
        // Buscador "inteligente" (20/10/2026): cada palabra en el nombre, la
        // presentación, la descripción, la categoría o las `etiquetas` que
        // manda el ERP (sinónimos, mascota, etapa y tamaño de la ficha).
        // "comida perro cachorro" encuentra los "Puppy". Ver lib/busqueda.ts.
        const coincide = coincideProducto(
          {
            nombre: p.nombre,
            presentacion: presentacionVisible(p.presentacion),
            descripcion: p.descripcion,
            categorias: categoriasDe(p.categoria_id),
            etiquetas: p.etiquetas,
          },
          term,
        );
        if (!enSku && !coincide) return false;
      }
      return true;
    });
  }, [productos, busquedaDiferida, catsElegidas, subActiva, especie, soloDisponibles, soloOfertas, idsConHijos, categoriasDe]);

  const marcasOfrecidas = useMemo(() => opcionesMarca(sinMarca, marcas), [sinMarca, marcas]);
  const nombreMarca = useMemo(() => new Map(marcasOfrecidas.map((m) => [m.clave, m.nombre])), [marcasOfrecidas]);

  const filtrados = useMemo(() => {
    const term = busquedaDiferida.trim().toLowerCase();
    let lista = marcas.length ? sinMarca.filter((p) => marcas.includes(claveMarca(p.marca))) : [...sinMarca];
    if (orden === "precio-asc") lista.sort((a, b) => a.precio_venta - b.precio_venta);
    else if (orden === "precio-desc") lista.sort((a, b) => b.precio_venta - a.precio_venta);
    else if (orden === "nombre") lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    else {
      // Relevancia: lo que se puede comprar hoy va primero. Mostrar agotados
      // arriba es una de las formas más rápidas de frustrar a un cliente.
      // Después, las fichas completas (foto, descripción, marca) antes que
      // las que faltan terminar — ver puntajeFicha en lib/publicacion.ts.
      // sort es estable: a igual puntaje se conserva el orden del ERP.
      // Con búsqueda (28/10/2026): entre los disponibles, primero lo que
      // mejor coincide (la palabra en el NOMBRE pesa más que en la
      // descripción; ver puntajeCoincidencia en lib/busqueda.ts).
      const coincidencia = new Map<string, number>();
      if (term) {
        for (const p of lista) {
          coincidencia.set(
            p.sku,
            puntajeCoincidencia({ nombre: p.nombre, categorias: categoriasDe(p.categoria_id) }, term),
          );
        }
      }
      lista.sort(
        (a, b) =>
          Number(b.disponible) - Number(a.disponible) ||
          (coincidencia.get(b.sku) ?? 0) - (coincidencia.get(a.sku) ?? 0) ||
          puntajeFicha(b) - puntajeFicha(a),
      );
    }
    return lista;
  }, [sinMarca, marcas, busquedaDiferida, orden, categoriasDe]);

  // Catálogo por bloques de 24, no los 184 de una sola pasada — hallazgo de
  // la auditoría: sin corte, recorrer el catálogo completo (~28.000px) no
  // tiene ningún punto de referencia de cuánto falta, sobre todo en mobile.
  const [visibles, setVisibles] = useState(24);

  // Se reinicia a 24 cuando cambia algún filtro real, para no arrastrar "ya
  // cargué 96" a una categoría distinta que el visitante recién eligió.
  // Ajustado durante el render, no en un efecto — mismo patrón que NavBar.tsx
  // usa para cerrar el menú al navegar: comparar contra el valor anterior en
  // el cuerpo del componente evita el fotograma de conteo viejo que un
  // useEffect dejaría ver antes de correr.
  const filtroClave = `${catsElegidas.join(",")}|${subActiva ?? ""}|${marcas.join(",")}|${especie ?? ""}|${soloDisponibles}|${busquedaDiferida}|${orden}`;
  const [filtroClavePrevia, setFiltroClavePrevia] = useState(filtroClave);
  if (filtroClave !== filtroClavePrevia) {
    setFiltroClavePrevia(filtroClave);
    setVisibles(24);
  }

  // Tallas del mismo producto en una sola tarjeta (lib/variantes.ts). Se
  // agrupa DESPUÉS de filtrar y ordenar: cada grupo queda donde estaba su
  // primera talla, y si un filtro deja una sola talla se ve como normal.
  const items = useMemo(() => agruparTallas(filtrados), [filtrados]);
  const paraMostrar = items.slice(0, visibles);

  // Cambiar de categoría borra la subcategoría: «Seco» no tiene sentido
  // dentro de Juguetes.
  const alternarCategoria = (id: number) => {
    setSub(null);
    setCatsElegidas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  /** Chips del celular: una categoría a la vez; tocar la activa la quita. */
  const elegirSoloCategoria = (id: number | null) => {
    setSub(null);
    setCatsElegidas((prev) => (id === null || (prev.length === 1 && prev[0] === id) ? [] : [id]));
  };
  const alternarMarca = (clave: string) =>
    setMarcas((prev) => (prev.includes(clave) ? prev.filter((x) => x !== clave) : [...prev, clave]));

  const hayFiltros =
    catsElegidas.length > 0 || marcas.length > 0 || especie !== null || soloDisponibles || soloOfertas || busqueda.trim() !== "";

  // Cuántos filtros hay puestos: lo dice el botón «Filtrar (3)» del celular.
  const cantidadFiltros =
    catsElegidas.length + marcas.length + (subActiva !== null ? 1 : 0) + (especie ? 1 : 0) +
    (soloDisponibles ? 1 : 0) + (soloOfertas ? 1 : 0) + (busqueda.trim() ? 1 : 0);

  // Celular (17/11/2026): los filtros se abren como panel a pantalla
  // completa, con «Ver N productos» abajo. Mientras está abierto, la página
  // de atrás no se mueve, y Escape lo cierra.
  const refCerrarFiltros = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!filtrosAbiertos) return;
    const esCelular = window.matchMedia("(max-width: 767px)").matches;
    if (!esCelular) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    refCerrarFiltros.current?.focus();
    const alTeclear = (e: KeyboardEvent) => { if (e.key === "Escape") setFiltrosAbiertos(false); };
    window.addEventListener("keydown", alTeclear);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", alTeclear);
    };
  }, [filtrosAbiertos]);

  const limpiar = () => {
    setSub(null);
    setMarcas([]);
    setCatsElegidas([]);
    setEspecie(null);
    setSoloDisponibles(false);
    setSoloOfertas(false);
    setBusqueda("");
  };

  return (
    <div className="mx-auto max-w-contenido px-4 py-6 sm:px-6 sm:py-12">
      <h1 className="font-display text-[1.75rem] leading-tight text-navy-500 sm:text-headline">{soloOfertas ? "Ofertas" : especie ? `Productos para ${especie === "perro" ? "perros" : "gatos"}` : "Catálogo"}</h1>
      {hayFiltros && <p className="mt-2 text-sm text-navy-400 sm:mt-3">{[busqueda && `Búsqueda: ${busqueda}`, ...catsElegidas.map((id) => nombrePorCategoria.get(id)), subActiva !== null && nombrePorCategoria.get(subActiva), ...marcas.map((m) => nombreMarca.get(m) ?? m), soloDisponibles && "Con existencias"].filter(Boolean).join(" · ")}</p>}

      {/* md, no lg: a ~900px (tablet) el panel de filtros a ancho completo
          enterraba la grilla de 184 productos bajo el fold. Con dos columnas
          desde md (768px) el filtro ocupa una franja angosta y el catálogo es
          visible de inmediato en todo el rango donde ya hay espacio real. */}
      {/* Barra del celular (17/11/2026): Filtrar, Ordenar y cuántos hay, en
          una sola línea que se queda pegada debajo del encabezado al bajar.
          Antes, título, botón de filtros, conteo y orden ocupaban casi tres
          cuartos de la primera pantalla. */}
      <div className="sticky top-[var(--alto-encabezado,64px)] z-30 -mx-4 mt-3 border-b border-crema-300 bg-white/95 px-4 py-2 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-expanded={filtrosAbiertos}
            aria-controls="filtros-catalogo"
            onClick={() => setFiltrosAbiertos(true)}
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium ${
              cantidadFiltros ? "border-navy-500 bg-navy-500 text-crema-100" : "border-navy-500 bg-white text-navy-500"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
            Filtrar{cantidadFiltros ? ` (${cantidadFiltros})` : ""}
          </button>
          <label className="relative inline-flex h-10 min-w-0 items-center rounded-full border border-crema-500 bg-white pl-4 pr-9 text-sm text-navy-500">
            <span className="sr-only">Ordenar</span>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as Orden)}
              className="w-full min-w-0 appearance-none truncate bg-transparent outline-none"
            >
              <option value="relevancia">Disponibles primero</option>
              <option value="precio-asc">Menor precio</option>
              <option value="precio-desc">Mayor precio</option>
              <option value="nombre">Nombre A–Z</option>
            </select>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute right-3.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </label>
          <p role="status" aria-atomic="true" className="ml-auto shrink-0 text-xs tabular-nums text-navy-400">
            {items.length} {items.length === 1 ? "producto" : "productos"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-6 md:mt-8 md:grid-cols-[200px_1fr] md:gap-6 lg:grid-cols-[230px_1fr] lg:gap-10">
        {/* Con marca, la columna puede pasar el alto de la pantalla: se desliza por dentro para que el final no quede inalcanzable. */}
        <aside className="min-w-0 md:sticky md:top-40 md:max-h-[calc(100vh-11rem)] md:self-start md:overflow-y-auto md:overscroll-contain">
          <div
            id="filtros-catalogo"
            role={filtrosAbiertos ? "dialog" : undefined}
            aria-modal={filtrosAbiertos ? true : undefined}
            aria-label="Filtros"
            className={`${filtrosAbiertos ? "fixed inset-0 z-[60] block overflow-y-auto overscroll-contain bg-white px-5 pb-28 pt-3" : "hidden"} md:static md:z-auto md:block md:overflow-visible md:rounded-card md:border md:border-crema-400 md:p-5 md:pb-5`}
          >
            <div className="-mx-5 mb-4 flex items-center justify-between border-b border-crema-300 px-5 pb-3 md:hidden">
              <p className="font-display text-xl text-navy-500">Filtros</p>
              <button
                ref={refCerrarFiltros}
                type="button"
                onClick={() => setFiltrosAbiertos(false)}
                aria-label="Cerrar filtros"
                className="grid h-11 w-11 place-items-center rounded-full text-navy-500 hover:bg-crema-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>
            <label className="block text-xs font-medium uppercase tracking-wider text-navy-400">
              Buscar
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre o código"
                className="mt-2 w-full rounded-lg border border-crema-400 bg-crema-200 px-3 py-2 text-sm font-normal normal-case tracking-normal text-navy-500 outline-none focus:border-navy-300"
              />
            </label>

            {(hayOfertas || soloOfertas) && (
              <button
                type="button"
                aria-pressed={soloOfertas}
                onClick={() => setSoloOfertas(!soloOfertas)}
                className={`mt-5 w-full rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                  soloOfertas ? "border-orange-700 bg-orange-700 text-white" : "border-orange-300 bg-orange-50 text-orange-800 hover:border-orange-700"
                }`}
              >
                🔥 Solo ofertas
              </button>
            )}

            {hayMascota && (
              <fieldset className="mt-6">
                <legend className="text-xs font-medium uppercase tracking-wider text-navy-400">
                  Para
                </legend>
                {/* Filtro cruzado, no una segunda navegación: se combina con
                    la categoría. Un producto "Perro y gato" aparece en los
                    dos — ver ESPECIES en lib/navegacion.ts. */}
                <div className="mt-2 flex gap-2">
                  {ESPECIES.map((e) => {
                    const activo = especie === e.clave;
                    return (
                      <button
                        key={e.clave}
                        type="button"
                        aria-pressed={activo}
                        onClick={() => setEspecie(activo ? null : e.clave)}
                        className={`flex-1 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                          activo
                            ? "border-navy-500 bg-navy-500 text-crema-100"
                            : "border-crema-400 text-navy-400 hover:border-navy-300 hover:text-navy-500"
                        }`}
                      >
                        {e.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {categoriasConProductos.length > 0 && (
              <fieldset className="mt-6">
                <legend className="text-xs font-medium uppercase tracking-wider text-navy-400">
                  Categoría
                </legend>
                <div className="mt-2 space-y-1.5">
                  {categoriasConProductos.map((c) => (
                    <label key={c.id} className="flex min-h-11 items-center gap-2.5 text-sm text-navy-400">
                      <input
                        type="checkbox"
                        checked={catsElegidas.includes(c.id)}
                        onChange={() => alternarCategoria(c.id)}
                        className="h-3.5 w-3.5 accent-navy-500"
                      />
                      <span className="flex-1">{c.nombre}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {/* Marca (28/10/2026): solo marcas con 2+ productos con los
                filtros actuales, de la más a la menos frecuente. */}
            {marcasOfrecidas.length >= 2 && (
              <fieldset className="mt-6">
                <legend className="text-xs font-medium uppercase tracking-wider text-navy-400">
                  Marca
                </legend>
                <div className="mt-2 space-y-1.5">
                  {(todasLasMarcas ? marcasOfrecidas : marcasOfrecidas.filter((m, i) => i < MARCAS_A_LA_VISTA || marcas.includes(m.clave))).map((m) => (
                    <label key={m.clave} className="flex min-h-11 items-center gap-2.5 text-sm text-navy-400">
                      <input
                        type="checkbox"
                        checked={marcas.includes(m.clave)}
                        onChange={() => alternarMarca(m.clave)}
                        className="h-3.5 w-3.5 accent-navy-500"
                      />
                      <span className="flex-1">{m.nombre}</span>
                      <span className="text-xs tabular-nums text-navy-300">{m.cuantos}</span>
                    </label>
                  ))}
                </div>
                {marcasOfrecidas.length > MARCAS_A_LA_VISTA && (
                  <button
                    type="button"
                    aria-expanded={todasLasMarcas}
                    onClick={() => setTodasLasMarcas(!todasLasMarcas)}
                    className="mt-1 min-h-11 text-sm text-navy-500 underline underline-offset-4 hover:text-navy-600"
                  >
                    {todasLasMarcas ? "Ver menos" : `Ver todas (${marcasOfrecidas.length})`}
                  </button>
                )}
              </fieldset>
            )}

            {/* Solo aparece si de verdad hay algo agotado que filtrar.
                Ver `hayAgotados` arriba. */}
            {hayAgotados && (
              <label className="mt-6 flex items-center gap-2.5 text-sm text-navy-400">
                <input
                  type="checkbox"
                  checked={soloDisponibles}
                  onChange={(e) => setSoloDisponibles(e.target.checked)}
                  className="h-3.5 w-3.5 accent-navy-500"
                />
                Solo con existencias
              </label>
            )}

            {hayFiltros && (
              <button
                onClick={limpiar}
                className="mt-6 w-full rounded-lg border border-crema-400 py-2 text-xs text-navy-400 transition-colors hover:border-navy-300 hover:text-navy-500"
              >
                Limpiar filtros
              </button>
            )}

            {/* Celular: cerrar y ver lo que quedó. */}
            <div className="fixed inset-x-0 bottom-0 border-t border-crema-300 bg-white px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:hidden">
              <button
                type="button"
                onClick={() => setFiltrosAbiertos(false)}
                className="h-12 w-full rounded-full bg-navy-500 text-[15px] font-medium text-crema-100 hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
              >
                Ver {items.length} {items.length === 1 ? "producto" : "productos"}
              </button>
            </div>
          </div>
        </aside>

        {/* min-w-0: sin esto la fila de chips (más ancha que la pantalla)
            estiraba la columna y la página entera se corría de lado. */}
        <div className="min-w-0">
          {/* sr-only: sin esto el H1 "Catálogo" saltaba directo a los H3 de
              cada tarjeta de producto (×184), rompiendo la navegación por
              encabezados de lectores de pantalla. No cambia nada visible. */}
          <h2 className="sr-only">Resultados</h2>

          {/* Categorías a un toque en el celular (28/10/2026): antes había
              que abrir «Buscar y filtrar» para elegir una. Fila que se
              desliza de lado; en tablet y compu ya están en la columna. */}
          {categoriasConProductos.length > 1 && (
            <nav aria-label="Categorías" className="-mx-4 mb-4 md:hidden">
              <ul className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <li>
                  <Chip activo={catsElegidas.length === 0} onClick={() => elegirSoloCategoria(null)}>
                    Todo
                  </Chip>
                </li>
                {categoriasConProductos.map((c) => (
                  <li key={c.id}>
                    <Chip activo={catsElegidas.length === 1 && catsElegidas[0] === c.id} onClick={() => elegirSoloCategoria(c.id)}>
                      {c.nombre}
                    </Chip>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Subcategorías: aparecen solas cuando la categoría elegida las
              tiene bien asignadas en el ERP (lib/filtrosCatalogo.ts). */}
          {raizUnica !== null && subOpciones.length > 0 && (
            <nav aria-label={`Tipos de ${nombrePorCategoria.get(raizUnica) ?? "producto"}`} className="-mx-4 mb-4 sm:-mx-6 md:mx-0">
              <ul className="flex gap-2 overflow-x-auto px-4 pb-1 sm:px-6 md:flex-wrap md:overflow-visible md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <li>
                  <Chip activo={subActiva === null} onClick={() => setSub(null)} suave>
                    Todo {nombrePorCategoria.get(raizUnica)?.toLowerCase()}
                  </Chip>
                </li>
                {subOpciones.map((o) => (
                  <li key={o.id}>
                    <Chip activo={subActiva === o.id} onClick={() => setSub(subActiva === o.id ? null : o.id)} suave>
                      {o.nombre} <span className="tabular-nums opacity-70">{o.cuantos}</span>
                    </Chip>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div className="mb-6 hidden flex-wrap items-center justify-between gap-4 border-b border-crema-400 pb-4 md:flex">
            <p role="status" aria-atomic="true" className="text-sm text-navy-400">
              {items.length}{" "}
              {items.length === 1 ? "producto" : "productos"}
            </p>
            <label className="flex items-center gap-2 text-sm text-navy-400">
              Ordenar
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as Orden)}
                className="rounded-lg border border-crema-400 bg-white px-3 py-1.5 text-sm text-navy-500 outline-none focus:border-navy-300"
              >
                <option value="relevancia">Disponibles primero</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre">Nombre A–Z</option>
              </select>
            </label>
          </div>

          {filtrados.length === 0 ? (
            <div className="rounded-card border border-dashed border-crema-500 py-20 text-center">
              {/* Búsqueda sin resultados (28/10/2026): en vez de un callejón sin
                  salida, WhatsApp con lo que buscó ya escrito. Puede estar en
                  tienda sin cargar todavía, o se puede conseguir; y a la
                  tienda le llega qué busca la gente que no encuentra. */}
              {busquedaDiferida.trim() ? (
                <>
                  <p className="px-6 font-display text-xl text-navy-500">
                    No encontramos «{busquedaDiferida.trim()}»
                  </p>
                  <p className="mx-auto mt-2 max-w-sm px-6 text-sm leading-relaxed text-navy-400">
                    Puede que lo tengamos en la tienda o que te lo podamos conseguir. Escribinos y te
                    respondemos.
                  </p>
                </>
              ) : (
                <p className="text-navy-400">No encontramos productos con esos filtros.</p>
              )}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 px-6">
                {busquedaDiferida.trim() && whatsappBusqueda && (
                  <a
                    href={whatsappBusqueda}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                  >
                    Preguntar por WhatsApp
                  </a>
                )}
                <button
                  onClick={limpiar}
                  className={`rounded-full px-6 py-2.5 text-sm transition-colors ${
                    busquedaDiferida.trim()
                      ? "border border-crema-500 text-navy-500 hover:border-navy-300"
                      : "bg-navy-500 text-crema-100 hover:bg-navy-600"
                  }`}
                >
                  {busquedaDiferida.trim() ? "Ver todo el catálogo" : "Limpiar filtros"}
                </button>
              </div>
            </div>
          ) : (
            <div
              // Mientras el filtrado va en camino, la grilla se atenúa un
              // poco en vez de congelarse. Es una señal honesta de "estoy
              // trabajando" y evita la sensación de que la página se trabó.
              className={`grid grid-cols-2 gap-x-3 gap-y-8 transition-opacity duration-150 sm:gap-x-4 sm:gap-y-10 xl:grid-cols-3 motion-reduce:transition-none ${
                filtrando ? "opacity-60" : "opacity-100"
              }`}
            >
              {paraMostrar.map(({ principal: p, tallas }, indice) => (
                <TarjetaProducto
                  key={p.sku}
                  producto={p}
                  tallas={tallas}
                  // La grilla es de 2 columnas en móvil/tablet y 3 en xl: las
                  // primeras 3 tarjetas están siempre visibles sin scroll en
                  // cualquier ancho. Antes solo la primera tenía prioridad —
                  // la segunda y tercera, aunque visibles de entrada, cargaban
                  // en "lazy" y llegaban tarde. Con prioridad, el navegador
                  // las pide de inmediato en vez de esperar a que el
                  // IntersectionObserver las note casi-en-pantalla.
                  cargaPrioritaria={indice < 3}
                  categoria={
                    p.categoria_id === null
                      ? undefined
                      : nombrePorCategoria.get(p.categoria_id)
                  }
                />
              ))}
            </div>
          )}

          {items.length > visibles && (
            <div className="mt-10 border-t border-crema-400 pt-8 text-center">
              <p className="text-sm text-navy-400">
                Mostrando <span className="font-medium text-navy-500">{paraMostrar.length}</span> de{" "}
                <span className="font-medium text-navy-500">{items.length}</span>
              </p>
              <button
                onClick={() => setVisibles((v) => v + 24)}
                className="mt-4 rounded-full border border-crema-400 px-8 py-3 text-sm font-medium text-navy-500 transition-colors hover:border-navy-300 hover:bg-crema-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
              >
                Cargar más
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({
  activo,
  onClick,
  suave = false,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  /** Subcategorías: mismo chip, en tono crema para distinguirlas de la categoría. */
  suave?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 ${
        activo
          ? "border-navy-500 bg-navy-500 text-crema-100"
          : suave
            ? "border-crema-400 bg-crema-200 text-navy-500 hover:border-navy-300"
            : "border-crema-400 bg-white text-navy-500 hover:border-navy-300"
      }`}
    >
      {children}
    </button>
  );
}

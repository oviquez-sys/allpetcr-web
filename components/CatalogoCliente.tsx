"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import TarjetaProducto from "@/components/TarjetaProducto";
import { ESPECIES, esParaEspecie, idsRama, type ClaveEspecie } from "@/lib/navegacion";
import { coincideAproximado } from "@/lib/busqueda";
import { presentacionVisible } from "@/lib/formato";
import type { Categoria, Producto } from "@/lib/types";

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
}

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
  useEffect(() => {
    const temporizador = setTimeout(() => {
      const params = new URLSearchParams();
      if (busqueda.trim()) params.set("q", busqueda.trim());
      if (catsElegidas.length) params.set("cats", catsElegidas.join(","));
      if (especie) params.set("para", especie);
      if (soloDisponibles) params.set("disponibles", "1");
      if (orden !== "relevancia") params.set("orden", orden);
      const query = params.toString();
      window.history.replaceState(null, "", `/catalogo${query ? `?${query}` : ""}`);
    }, 400);
    return () => clearTimeout(temporizador);
  }, [busqueda, catsElegidas, especie, soloDisponibles, orden]);

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

  const filtrados = useMemo(() => {
    const term = busquedaDiferida.trim().toLowerCase();
    // Expandir cada categoría raíz elegida a [ella misma, ...sus hijas].
    const idsElegidos = catsElegidas.flatMap((id) => idsConHijos(id));
    let lista = productos.filter((p) => {
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
        // Nombre, presentación y descripción sí toleran errores de
        // escritura (ítem 32): "coyar" encuentra "collar". Solo la
        // presentación que el cliente puede ver: buscar "paquete" devolvía
        // 141 de 184 productos por un dato que no está en pantalla. La
        // descripción entra porque es donde están el material, la talla y
        // el uso ("arnés acolchado", "para cachorro"), que es como la
        // gente busca de verdad.
        const enNombre = coincideAproximado(p.nombre, term);
        const enPres = coincideAproximado(presentacionVisible(p.presentacion), term);
        const enDesc = coincideAproximado(p.descripcion, term);
        if (!enNombre && !enSku && !enPres && !enDesc) return false;
      }
      return true;
    });

    lista = [...lista];
    if (orden === "precio-asc") lista.sort((a, b) => a.precio_venta - b.precio_venta);
    else if (orden === "precio-desc") lista.sort((a, b) => b.precio_venta - a.precio_venta);
    else if (orden === "nombre") lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    else {
      // Relevancia: lo que se puede comprar hoy va primero. Mostrar agotados
      // arriba es una de las formas más rápidas de frustrar a un cliente.
      lista.sort((a, b) => Number(b.disponible) - Number(a.disponible));
    }
    return lista;
  }, [productos, busquedaDiferida, catsElegidas, especie, soloDisponibles, orden, idsConHijos]);

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
  const filtroClave = `${catsElegidas.join(",")}|${especie ?? ""}|${soloDisponibles}|${busquedaDiferida}|${orden}`;
  const [filtroClavePrevia, setFiltroClavePrevia] = useState(filtroClave);
  if (filtroClave !== filtroClavePrevia) {
    setFiltroClavePrevia(filtroClave);
    setVisibles(24);
  }

  const paraMostrar = filtrados.slice(0, visibles);

  const alternarCategoria = (id: number) =>
    setCatsElegidas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const hayFiltros =
    catsElegidas.length > 0 || especie !== null || soloDisponibles || busqueda.trim() !== "";

  const limpiar = () => {
    setCatsElegidas([]);
    setEspecie(null);
    setSoloDisponibles(false);
    setBusqueda("");
  };

  return (
    <div className="mx-auto max-w-contenido px-6 py-12">
      <h1 className="font-display text-headline text-navy-500">{especie ? `Productos para ${especie === "perro" ? "perros" : "gatos"}` : "Catálogo"}</h1>
      {hayFiltros && <p className="mt-3 text-sm text-navy-400">{[busqueda && `Búsqueda: ${busqueda}`, ...catsElegidas.map((id) => nombrePorCategoria.get(id)), soloDisponibles && "Con existencias"].filter(Boolean).join(" · ")}</p>}

      {/* md, no lg: a ~900px (tablet) el panel de filtros a ancho completo
          enterraba la grilla de 184 productos bajo el fold. Con dos columnas
          desde md (768px) el filtro ocupa una franja angosta y el catálogo es
          visible de inmediato en todo el rango donde ya hay espacio real. */}
      <div className="mt-8 grid gap-8 md:grid-cols-[200px_1fr] md:gap-6 lg:grid-cols-[230px_1fr] lg:gap-10">
        <aside className="md:sticky md:top-40 md:self-start">
          <button type="button" aria-expanded={filtrosAbiertos} aria-controls="filtros-catalogo" onClick={() => setFiltrosAbiertos(!filtrosAbiertos)} className="w-full rounded-lg border border-navy-500 px-5 py-3 text-left text-sm text-navy-500 md:hidden">{filtrosAbiertos ? "Ocultar filtros" : "Buscar y filtrar"}{hayFiltros ? " · filtros activos" : ""}</button>
          <div id="filtros-catalogo" className={`${filtrosAbiertos ? "block" : "hidden"} rounded-card border border-crema-400 bg-white p-5 md:block`}>
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
                      <span className="text-xs text-navy-400">{c.cuantos}</span>
                    </label>
                  ))}
                </div>
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
          </div>
        </aside>

        <div>
          {/* sr-only: sin esto el H1 "Catálogo" saltaba directo a los H3 de
              cada tarjeta de producto (×184), rompiendo la navegación por
              encabezados de lectores de pantalla. No cambia nada visible. */}
          <h2 className="sr-only">Resultados</h2>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-crema-400 pb-4">
            <p role="status" aria-atomic="true" className="text-sm text-navy-400">
              {filtrados.length}{" "}
              {filtrados.length === 1 ? "producto" : "productos"}
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
              <p className="text-navy-400">No encontramos productos con esos filtros.</p>
              <button
                onClick={limpiar}
                className="mt-4 rounded-full bg-navy-500 px-6 py-2.5 text-sm text-crema-100 transition-colors hover:bg-navy-600"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div
              // Mientras el filtrado va en camino, la grilla se atenúa un
              // poco en vez de congelarse. Es una señal honesta de "estoy
              // trabajando" y evita la sensación de que la página se trabó.
              className={`grid gap-5 transition-opacity duration-150 sm:grid-cols-2 xl:grid-cols-3 motion-reduce:transition-none ${
                filtrando ? "opacity-60" : "opacity-100"
              }`}
            >
              {paraMostrar.map((p) => (
                <TarjetaProducto
                  key={p.sku}
                  producto={p}
                  categoria={
                    p.categoria_id === null
                      ? undefined
                      : nombrePorCategoria.get(p.categoria_id)
                  }
                />
              ))}
            </div>
          )}

          {filtrados.length > visibles && (
            <div className="mt-10 border-t border-crema-400 pt-8 text-center">
              <p className="text-sm text-navy-400">
                Mostrando <span className="font-medium text-navy-500">{paraMostrar.length}</span> de{" "}
                <span className="font-medium text-navy-500">{filtrados.length}</span>
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

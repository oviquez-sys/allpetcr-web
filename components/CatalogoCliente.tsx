"use client";

import { useMemo, useState } from "react";
import TarjetaProducto from "@/components/TarjetaProducto";
import type { Categoria, Producto } from "@/lib/types";

interface Props {
  productos: Producto[];
  categorias: Categoria[];
  busquedaInicial?: string;
  categoriaInicial?: string;
}

type Orden = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

export default function CatalogoCliente({
  productos,
  categorias,
  busquedaInicial = "",
  categoriaInicial = "",
}: Props) {
  const [busqueda, setBusqueda] = useState(busquedaInicial);
  const [catsElegidas, setCatsElegidas] = useState<number[]>(() => {
    if (!categoriaInicial) return [];
    const encontrada = categorias.find(
      (c) => c.nombre.toLowerCase() === categoriaInicial.toLowerCase()
    );
    return encontrada ? [encontrada.id] : [];
  });
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [orden, setOrden] = useState<Orden>("relevancia");

  const nombreCategoria = (id: number | null) =>
    categorias.find((c) => c.id === id)?.nombre ?? undefined;

  // Jerarquía de 2 niveles: Alimento y Snacks son hijas de Perros/Gatos
  // (padre_id). Elegir una categoría raíz en el filtro debe incluir también
  // los productos de sus subcategorías, no solo los que tienen ese id exacto.
  // Memoizado por `categorias` para poder usarse dentro de otros useMemo sin
  // warnings de exhaustive-deps (la función cambiaría de identidad en cada
  // render si no estuviera envuelta aquí).
  const idsConHijos = useMemo(() => {
    return (id: number): number[] => {
      const hijos = categorias.filter((c) => c.padre_id === id).map((c) => c.id);
      return [id, ...hijos];
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
          (p) => p.categoria_id !== null && ids.includes(p.categoria_id)
        ).length;
        return { ...c, cuantos };
      })
      .filter((c) => c.cuantos > 0);
  }, [productos, categorias, idsConHijos]);

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    // Expandir cada categoría raíz elegida a [ella misma, ...sus hijas].
    const idsElegidos = catsElegidas.flatMap((id) => idsConHijos(id));
    let lista = productos.filter((p) => {
      if (soloDisponibles && !p.disponible) return false;
      if (catsElegidas.length > 0) {
        if (p.categoria_id === null || !idsElegidos.includes(p.categoria_id)) return false;
      }
      if (term) {
        const enNombre = p.nombre.toLowerCase().includes(term);
        const enSku = p.sku.toLowerCase().includes(term);
        const enPres = p.presentacion.toLowerCase().includes(term);
        if (!enNombre && !enSku && !enPres) return false;
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
  }, [productos, busqueda, catsElegidas, soloDisponibles, orden, idsConHijos]);

  const alternarCategoria = (id: number) =>
    setCatsElegidas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const hayFiltros = catsElegidas.length > 0 || soloDisponibles || busqueda.trim() !== "";

  const limpiar = () => {
    setCatsElegidas([]);
    setSoloDisponibles(false);
    setBusqueda("");
  };

  return (
    <div className="mx-auto max-w-contenido px-6 py-12">
      <h1 className="font-display text-[38px] font-light text-navy-500">Catálogo</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[230px_1fr]">
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-card border border-crema-400 bg-white p-5">
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

            {categoriasConProductos.length > 0 && (
              <fieldset className="mt-6">
                <legend className="text-xs font-medium uppercase tracking-wider text-navy-400">
                  Categoría
                </legend>
                <div className="mt-2 space-y-1.5">
                  {categoriasConProductos.map((c) => (
                    <label key={c.id} className="flex items-center gap-2.5 text-sm text-navy-400">
                      <input
                        type="checkbox"
                        checked={catsElegidas.includes(c.id)}
                        onChange={() => alternarCategoria(c.id)}
                        className="h-3.5 w-3.5 accent-navy-500"
                      />
                      <span className="flex-1">{c.nombre}</span>
                      <span className="text-xs text-navy-200">{c.cuantos}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <label className="mt-6 flex items-center gap-2.5 text-sm text-navy-400">
              <input
                type="checkbox"
                checked={soloDisponibles}
                onChange={(e) => setSoloDisponibles(e.target.checked)}
                className="h-3.5 w-3.5 accent-navy-500"
              />
              Solo con existencias
            </label>

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
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-crema-400 pb-4">
            <p className="text-sm text-navy-400">
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
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtrados.map((p) => (
                <TarjetaProducto
                  key={p.sku}
                  producto={p}
                  categoria={nombreCategoria(p.categoria_id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

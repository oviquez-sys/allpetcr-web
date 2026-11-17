import Image from "next/image";
import Link from "next/link";

export interface CategoriaConFoto {
  id: number;
  nombre: string;
  href: string;
  total: number;
  imagen: string | null;
}

/**
 * TODO LO QUE HAY, DE UN VISTAZO (17/11/2026)
 *
 * Una fila con cada categoría y la foto de un producto real de ella. Baymard
 * (estudio de portadas de tiendas en línea) encontró que quien no ve un tipo
 * de producto en la portada supone que no se vende, y que en el celular pasa
 * más, porque el menú no está a la vista. Recomiendan mostrar al menos 40 %
 * de los tipos de producto. Con esta fila se ven todos.
 *
 * Celular: se desliza de lado (cuatro y media a la vista: la media invita a
 * deslizar). Compu: grilla de siete columnas.
 *
 * La foto sale del catálogo (lib en app/page.tsx elige un producto con foto
 * de cada categoría), así que no hay fotos que mantener a mano.
 */
export default function CategoriasConFoto({ categorias }: { categorias: CategoriaConFoto[] }) {
  if (categorias.length < 3) return null;
  return (
    <ul className="sin-barra -mx-4 flex snap-x gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-7 lg:gap-x-4 lg:gap-y-6 lg:overflow-visible lg:px-0">
      {categorias.map((c) => (
        <li key={c.id} className="w-[23%] min-w-[84px] shrink-0 snap-start sm:w-[16%] lg:w-auto">
          <Link
            href={c.href}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
          >
            <span className="marco-foto relative block aspect-square overflow-hidden rounded-2xl">
              {c.imagen && (
                <Image
                  src={c.imagen}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 150px, 24vw"
                  className="object-contain p-[12%] transition-transform duration-300 ease-out group-hover:scale-[1.06] motion-reduce:transition-none"
                />
              )}
            </span>
            <span className="mt-2 block text-center text-[12.5px] font-medium leading-tight text-navy-500 sm:text-sm">
              {c.nombre}
            </span>
            <span className="block text-center text-[11px] text-navy-400 tabular-nums sm:text-xs">{c.total}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

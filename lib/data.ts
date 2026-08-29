import type { Categoria, Producto } from "./types";
import productosJson from "@/data/productos.json";
import categoriasJson from "@/data/categorias.json";

// Capa única de acceso a datos del catálogo.
//
// Bloque 5 (2026-08-29): el ERP ya expone la API real (Django REST
// Framework, ver allpetcr-erp/api/). Estas dos funciones son el ÚNICO lugar
// que cambió — como estaba previsto acá desde antes de que existiera la API.
// Ningún componente de página lee la API ni los JSON directamente: todos
// pasan por acá.
//
// POR QUÉ HAY UN RESPALDO A LOS JSON ESTÁTICOS
// --------------------------------------------
// El ERP "corre solo en local" (no está pensado para exponerse a internet
// todavía — ver REPORTE-NOCHE.md del ERP). Si este sitio se compila en un
// servidor que no tiene forma de llegar al ERP (ej. un build en Vercel sin
// ERP_API_URL configurada), `generateStaticParams` de la ficha de producto
// necesita datos igual para poder compilar. Por eso: con ERP_API_URL y
// ERP_API_TOKEN definidas, se lee la API real (en vivo). Sin ellas, se cae a
// data/productos.json y data/categorias.json — la última foto que exportó
// el ERP, igual que funcionaba el sitio hasta ahora. Es un respaldo, no la
// fuente de verdad: la fuente de verdad es siempre el ERP.
//
// El token NUNCA se expone al navegador: estas funciones corren en el
// servidor (Server Components / Route Handlers de Next.js), y ERP_API_TOKEN
// no lleva el prefijo NEXT_PUBLIC_ que Next.js exige para mandar una
// variable al cliente. Si algún día un componente cliente necesita datos
// del catálogo, tiene que pedírselos a una ruta de este mismo sitio, nunca
// llamar al ERP directo con el token.
const ERP_API_URL = process.env.ERP_API_URL;
const ERP_API_TOKEN = process.env.ERP_API_TOKEN;
const ERP_CONFIGURADO = Boolean(ERP_API_URL && ERP_API_TOKEN);

// Cuánto tiempo puede tener una respuesta del ERP antes de volver a pedirla.
// Valor de arranque razonado, no medición (mismo criterio que
// ReservaStock.PLAZO_MINUTOS en el ERP): un minuto es imperceptible para
// quien navega y evita que cada visita al catálogo golpee el ERP directo.
const REVALIDAR_SEGUNDOS = 60;

interface RespuestaPaginada<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

async function erpFetch<T>(ruta: string): Promise<T> {
  const url = `${ERP_API_URL}${ruta}`;
  const respuesta = await fetch(url, {
    headers: { Authorization: `Token ${ERP_API_TOKEN}` },
    next: { revalidate: REVALIDAR_SEGUNDOS },
  });
  if (!respuesta.ok) {
    throw new Error(`ERP respondió ${respuesta.status} en ${ruta}`);
  }
  return respuesta.json() as Promise<T>;
}

/** Sigue `next` hasta traer todas las páginas. El catálogo (~500
 * productos) es chico: pedirlo completo es más simple que enseñarle
 * paginación a cada página del sitio que hoy espera un array completo. */
async function erpFetchTodasLasPaginas<T>(rutaInicial: string): Promise<T[]> {
  const items: T[] = [];
  let ruta: string | null = rutaInicial;
  while (ruta) {
    const pagina: RespuestaPaginada<T> = await erpFetch<RespuestaPaginada<T>>(ruta);
    items.push(...pagina.results);
    // `next` viene absoluta (con ERP_API_URL incluido); se recorta para
    // volver a pasar por erpFetch, que antepone ERP_API_URL otra vez.
    ruta = pagina.next ? pagina.next.replace(ERP_API_URL!, "") : null;
  }
  return items;
}

// No hace falta memoizar a mano: Next.js deduplica automáticamente llamadas
// a fetch() con la misma URL dentro de una misma renderización ("Request
// Memoization"), y `next: {revalidate}` ya maneja la vigencia entre
// visitas. Un caché propio acá pisaría esa revalidación (una vez resuelto,
// quedaría fijo para siempre en este proceso) sin ganar nada a cambio.
export async function getProductos(): Promise<Producto[]> {
  if (!ERP_CONFIGURADO) return productosJson as Producto[];
  return erpFetchTodasLasPaginas<Producto>("/api/catalogo/productos/");
}

export async function getCategorias(): Promise<Categoria[]> {
  if (!ERP_CONFIGURADO) return categoriasJson as Categoria[];
  return erpFetch<Categoria[]>("/api/catalogo/categorias/");
}

export async function getProductoPorSku(sku: string): Promise<Producto | undefined> {
  const productos = await getProductos();
  return productos.find((p) => p.sku === sku);
}

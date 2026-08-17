import Link from "next/link";
import Image from "next/image";
import IconoCategoria from "./IconoCategoria";

interface Props {
  /** "Para perro" — el texto grande de la puerta. */
  nombre: string;
  /** Cuántos productos hay del otro lado. Se muestra siempre: una puerta
   *  sin conteo pide un clic a ciegas. */
  conteo: number;
  href: string;
  /** Ruta en /public. Sin foto, la puerta usa su tinte: se ve intencional,
   *  no rota. Ver la nota de fotografía más abajo. */
  imagen?: string;
  posicion?: string;
  tinte?: string;
  icono?: string;
  prioridad?: boolean;
}

/**
 * PUERTA DE ESPECIE — elemento firma del inicio.
 *
 * ── QUÉ ES
 * Una de las dos entradas grandes ("Para perro" / "Para gato") que abren la
 * portada, justo debajo del hero. Es la primera pregunta del mostrador
 * traducida a pantalla.
 *
 * ── POR QUÉ EXISTE, SI navegacion.ts DICE QUE LA ESPECIE NO ES SECCIÓN
 * `lib/navegacion.ts` argumenta —con razón— que "Perros" no sirve como
 * sección del MENÚ: 159 de 184 productos sirven para perro, así que un
 * enlace de especie sola no filtra casi nada y desperdicia una ranura de
 * navegación. Ese argumento sigue vigente y el menú no cambió.
 *
 * Lo que cambia acá es el contexto, no el dato. En un menú una entrada vale
 * por lo que descarta; en una portada vale por lo que orienta. Para quien
 * tiene gato, la puerta le quita de encima 101 productos que no le sirven y
 * le dice "esta tienda también es para vos" —que es lo que una portada tiene
 * que resolver en los primeros tres segundos—. Por eso el conteo va a la
 * vista: la asimetría (159 contra 83) se muestra en vez de disimularse.
 *
 * Decisión de Oscar, 17/08/2026. Si alguien quiere revertirla, el argumento
 * a batir es ese, no el de navegacion.ts —que sigue siendo correcto para lo
 * que cubre—.
 *
 * ── SOBRE LA FOTOGRAFÍA
 * Hoy hay una sola foto de gato en `public/categorias/` y es un gato siendo
 * bañado: transmite estrés, no ganas de comprar. Antes que poner una foto que
 * juega en contra, la puerta de gato va con tinte. Cuando exista una foto
 * buena, se agrega `imagen` en `PUERTAS` (lib/navegacion.ts) y ya. Criterios
 * de selección y licencias: `docs/DIRECCION-DE-ARTE.md`.
 *
 * ── EL MARCO
 * El filete dorado por dentro del borde es el mismo recurso que el marco de
 * la fachada: metal fino, nunca relleno. Es más grande que un hairline porque
 * esta es la pieza que la portada tiene que hacer memorable, y la regla del
 * sistema permite el dorado como TRAZO a cualquier escala —lo que prohíbe es
 * que rellene—.
 */
export default function PuertaEspecie({
  nombre,
  conteo,
  href,
  imagen,
  posicion = "center",
  tinte = "bg-crema-300",
  icono,
  prioridad = false,
}: Props) {
  return (
    <Link
      href={href}
      className="group relative flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-card transition-transform duration-300 hover:-translate-y-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500 sm:aspect-[16/11]"
    >
      {imagen ? (
        <>
          <Image
            src={imagen}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            priority={prioridad}
            style={{ objectPosition: posicion }}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-navy-900/10" aria-hidden="true" />
          <div
            className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/35 to-navy-900/5"
            aria-hidden="true"
          />
        </>
      ) : (
        <div className={`absolute inset-0 ${tinte}`} aria-hidden="true" />
      )}

      {/* El filete: por dentro del borde, no sobre él, para que se lea como
          moldura y no como contorno del componente. */}
      <span
        className={`pointer-events-none absolute inset-3.5 rounded-lg border transition-colors sm:inset-4 ${
          imagen
            ? "border-dorado-400/50 group-hover:border-dorado-400/75"
            : "border-dorado-500/45 group-hover:border-dorado-500/70"
        }`}
        aria-hidden="true"
      />

      <div className="relative p-7 sm:p-8">
        {icono && (
          <span
            className={`mb-4 grid h-11 w-11 place-items-center rounded-full border ${
              imagen
                ? "border-white/45 bg-white/10 text-white backdrop-blur-sm"
                : "border-dorado-500/40 text-navy-500"
            }`}
            aria-hidden="true"
          >
            <IconoCategoria nombre={icono} className="h-[22px] w-[22px]" />
          </span>
        )}
        <h3
          className={`font-display text-[28px] font-light leading-tight sm:text-[32px] ${
            imagen ? "text-crema-100" : "text-navy-500"
          }`}
        >
          {nombre}
        </h3>
        {/* El conteo en dorado sobre foto (5.07:1 contra el scrim navy) y en
            dorado-700 sobre tinte claro (5.78:1): el 500 no pasa AA sobre
            crema y este texto hay que poder leerlo. */}
        <p
          className={`mt-2 text-[11px] font-medium uppercase tracking-[0.12em] ${
            imagen ? "text-dorado-300" : "text-dorado-700"
          }`}
        >
          {conteo} productos
        </p>
      </div>
    </Link>
  );
}

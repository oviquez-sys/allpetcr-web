/**
 * La marca AllPetcr.com.
 *
 * POR QUÉ UN COMPONENTE Y NO UN <img src="/marca/...svg">
 * El logo va en el encabezado, que es lo primero que pinta el navegador. Un
 * <img> externo es una petición de red más y, hasta que llega, deja un hueco
 * que desplaza el contenido (CLS, uno de los Core Web Vitals). Un SVG en
 * línea llega dentro del HTML: cero peticiones, cero salto de diseño, y
 * hereda `currentColor` cuando hace falta pintarlo de un solo color.
 *
 * POR QUÉ TRES VARIANTES
 * El logo original es vertical (isotipo arriba, "AllPetcr.com" abajo). En un
 * encabezado de 64 px de alto esa composición obliga a reducir el conjunto
 * hasta que el texto queda ilegible. Por eso existe la variante horizontal:
 * misma marca, proporción usable. Es la práctica estándar de identidad —un
 * logo que solo existe en una proporción es un logo incompleto.
 *
 * La geometría no está dibujada a mano: sale del SVG oficial, midiendo las
 * cajas reales de cada grupo (isotipo 431.8×488.9, texto 736.6×99.8) y
 * componiéndolas. Ver public/marca/ para los archivos sueltos.
 *
 * ⚠ EL PERRO ES BLANCO SÓLIDO, NO UN CALADO
 * Esto se hizo mal en la primera versión y conviene que quede explicado.
 *
 * En el archivo original la silueta del perro está recortada dentro de un
 * rectángulo de fondo blanco. La primera solución fue volverlo transparente
 * con una máscara, para que no arrastrara un cuadro blanco sobre el fondo
 * crema. Funcionaba… sobre crema.
 *
 * Sobre el hero navy se rompía: el perro se llenaba de azul oscuro y el gato
 * —que también es navy— desaparecía dentro de él. La marca perdía uno de sus
 * dos animales, que es justo lo que la hace funcionar.
 *
 * En el logo real el perro es BLANCO, no un hueco. Se reconstruye combinando
 * la P dorada con PERRO_SUB bajo `fill-rule="evenodd"`: la P menos esa forma
 * deja el contorno exacto del perro, que se pinta en blanco. Así la marca es
 * idéntica al original y se sostiene sobre cualquier fondo —una sola versión
 * para todo el sitio, sin variantes por color de fondo.
 */

import { P_DORADA, GATO, TEXTO, PERRO_SUB } from "./marcaPaths";

type Variante = "horizontal" | "vertical" | "iso";

interface Props {
  variante?: Variante;
  className?: string;
  /** Marca el logo como decorativo. Úsalo cuando el enlace que lo envuelve
   *  ya tiene su propio texto accesible: si no, el lector de pantalla
   *  anuncia el nombre dos veces. */
  decorativo?: boolean;
  /** Pinta toda la marca de un solo color (hereda del contenedor).
   *  Para el pie de página, donde conviene una versión de una sola tinta. */
  monocromo?: boolean;
}

export default function Marca({
  variante = "horizontal",
  className = "",
  decorativo = false,
  monocromo = false,
}: Props) {
  const a11y = decorativo
    ? ({ "aria-hidden": true } as const)
    : ({ role: "img", "aria-label": "AllPetcr.com" } as const);

  const oro = monocromo ? "currentColor" : "#CC9539";
  const tinta = monocromo ? "currentColor" : "#092E5E";
  // En monocromo el perro se omite: sobre una marca de un solo color, un
  // perro blanco abriría un hueco en medio de la P.
  const perro = monocromo ? null : (
    <path d={`${P_DORADA} ${PERRO_SUB}`} fill="#FFFFFF" fillRule="evenodd" />
  );

  // El isotipo: P dorada → perro blanco → gato navy. Ese orden importa; el
  // gato va encima del perro, recortado contra él.
  const isotipo = (
    <>
      <path d={P_DORADA} fill={oro} />
      {perro}
      <path d={GATO} fill={tinta} />
    </>
  );

  if (variante === "iso") {
    return (
      <svg viewBox="445.2 286.5 447.8 504.9" fill="none" className={className} {...a11y}>
        {isotipo}
      </svg>
    );
  }

  if (variante === "vertical") {
    return (
      <svg viewBox="254.8 280.5 764.6 664.4" fill="none" className={className} {...a11y}>
        {isotipo}
        {TEXTO.map((d, i) => (
          <path key={i} d={d} fill={tinta} />
        ))}
      </svg>
    );
  }

  // Horizontal: isotipo a escala 100/488.9, texto a 62/99.8, separados 26 u.
  return (
    <svg viewBox="0 0 570.9 100" fill="none" className={className} {...a11y}>
      <g transform="translate(-92.706,-60.246) scale(0.20454)">{isotipo}</g>
      <g transform="translate(-53.815,-488.723) scale(0.62124)">
        {TEXTO.map((d, i) => (
          <path key={i} d={d} fill={tinta} />
        ))}
      </g>
    </svg>
  );
}

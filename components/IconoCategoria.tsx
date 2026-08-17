/**
 * ICONOS DE CATEGORÍA
 *
 * ── DE DÓNDE SALEN
 * El local tiene, junto a la puerta, un rótulo vertical con cuatro iconos
 * dentro de círculos: Alimentos, Accesorios, Juguetes, Higiene. Es lo que
 * permite orientarse desde la acera, antes de entrar. La web necesita lo
 * mismo, y por el mismo motivo: reconocer una forma es más rápido que leer
 * una palabra.
 *
 * ── POR QUÉ DIBUJADOS A MANO Y NO UNA LIBRERÍA
 * lucide-react o react-icons pesan decenas de KB y traen mil iconos para usar
 * seis. Estos son seis trazados SVG en línea: ~1 KB en total, sin dependencia
 * que actualizar y sin nada que descargar.
 *
 * ── POR QUÉ TODOS COMPARTEN GROSOR Y CAJA
 * Los seis usan viewBox 24, `stroke-width` 1.6 y solo trazo (nunca relleno).
 * Es lo que los hace parecer una familia en vez de seis iconos sueltos —el
 * mismo criterio por el que las jardineras del local son del mismo azul que
 * la fachada. Un icono con grosor distinto salta a la vista inmediatamente.
 *
 * Heredan `currentColor`: sirven sobre crema y sobre navy sin duplicar nada.
 */

interface Props {
  /** id de sección de lib/navegacion.ts */
  nombre: string;
  className?: string;
}

const trazos: Record<string, React.ReactNode> = {
  // Juguetes → pelota con las costuras curvas
  juguetes: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M4.2 9.5c4.6 1.2 11 1.2 15.6 0" />
      <path d="M4.2 14.5c4.6-1.2 11-1.2 15.6 0" />
      <path d="M12 3.5c-2.2 5.4-2.2 11.6 0 17" />
    </>
  ),

  // Collares y paseo → collar con placa colgante
  paseo: (
    <>
      <path d="M4 8.5a8 8 0 0 0 16 0" />
      <path d="M4 8.5a8 8 0 0 1 16 0" />
      <circle cx="12" cy="17.5" r="2.6" />
      <path d="M12 14.9v-1.4" />
    </>
  ),

  // Salud e higiene → gota de shampoo sobre el cepillo
  higiene: (
    <>
      <path d="M12 2.8s4.3 4.9 4.3 7.8a4.3 4.3 0 0 1-8.6 0c0-2.9 4.3-7.8 4.3-7.8Z" />
      <path d="M4.6 16.6h14.8" />
      <path d="M6.9 16.6v3.4M10.3 16.6v3.4M13.7 16.6v3.4M17.1 16.6v3.4" />
    </>
  ),

  // Gatos → cabeza de gato con orejas y bigotes.
  // Las orejas son picos que arrancan del contorno, no triángulos sueltos:
  // así no se ven cortadas cuando el icono va pequeño.
  gatos: (
    <>
      <path d="M4.8 11.2 4.1 5.6l4.4 2.9" />
      <path d="M19.2 11.2l.7-5.6-4.4 2.9" />
      <path d="M4.8 11.2a7.2 7.2 0 0 0 14.4 0" />
      <path d="M4.8 11.2a7.2 7.2 0 0 1 14.4 0" />
      <path d="M1.6 13.9h3.1M19.3 13.9h3.1" />
      <circle cx="9.5" cy="11.6" r=".75" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11.6" r=".75" fill="currentColor" stroke="none" />
    </>
  ),

  // Hogar y accesorios → cama con techo, como las camitas de la vitrina
  hogar: (
    <>
      <path d="M3.4 11.6 12 5l8.6 6.6" />
      <path d="M5.4 10.6v7.8a1.4 1.4 0 0 0 1.4 1.4h10.4a1.4 1.4 0 0 0 1.4-1.4v-7.8" />
      <path d="M9.2 19.8v-4.4a2.8 2.8 0 0 1 5.6 0v4.4" />
    </>
  ),

  // Genérico → huella. Es la firma de la marca: aparece tres veces en la
  // fachada (rótulo, tagline y caballete).
  huella: (
    <>
      <ellipse cx="7.2" cy="9.4" rx="1.9" ry="2.5" />
      <ellipse cx="12" cy="7.6" rx="1.9" ry="2.6" />
      <ellipse cx="16.8" cy="9.4" rx="1.9" ry="2.5" />
      <path d="M12 12.6c-2.9 0-4.9 2-4.9 4.1 0 1.6 1.2 2.6 2.7 2.6 1 0 1.5-.4 2.2-.4s1.2.4 2.2.4c1.5 0 2.7-1 2.7-2.6 0-2.1-2-4.1-4.9-4.1Z" />
    </>
  ),
};

export default function IconoCategoria({ nombre, className = "" }: Props) {
  const trazo = trazos[nombre] ?? trazos.huella;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {trazo}
    </svg>
  );
}

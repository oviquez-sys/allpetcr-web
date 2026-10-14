"use client";

import { useEffect, useState } from "react";

/**
 * ¿Este celular ya se unió a la manada? Para dejar de invitarlo.
 *
 * Arranca en `false` (el servidor no sabe) y se corrige al cargar: quien ya
 * es miembro puede ver la invitación una fracción de segundo. Se prefirió eso
 * a leer la cookie en el servidor, que obligaría a armar cada página desde
 * cero en cada visita y haría lento todo el sitio por un aviso.
 */
export function useEsMiembro() {
  const [miembro, setMiembro] = useState(false);
  useEffect(() => {
    // La cookie la pone el sitio al unirse; ver lib/manada.ts COOKIE_MIEMBRO.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de una cookie al montar
    setMiembro(/(?:^|;\s*)manada_miembro=1/.test(document.cookie));
  }, []);
  return miembro;
}

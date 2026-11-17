"use client";

import { useEffect, useRef, useState } from "react";
import { resumirBeneficios, yaParticipaEnNavegador, type BeneficiosErp, type ResumenBeneficios } from "@/lib/campana";

interface Consulta {
  lineas: { sku: string; cantidad: number }[];
  entrega: "RET" | "ENV";
  canton?: string;
  distrito?: string;
  telefono?: string;
}

/**
 * Pregunta al ERP (vía /api/campana/beneficios) qué le da la campaña a este
 * carrito: números del sorteo, cuánto falta para el bono y si el envío sale
 * gratis. Se vuelve a preguntar solo cuando cambia algo que importa (líneas,
 * entrega, cantón, distrito o teléfono), con una pausa corta para no
 * preguntar en cada tecla. Si llega una respuesta vieja, se descarta.
 *
 * El sitio NO calcula: si el ERP no responde, no se muestra nada (mejor
 * callar que prometer un número o un envío gratis que la caja no va a dar).
 */
export function useBeneficiosCampana(consulta: Consulta, activo: boolean) {
  const [datos, setDatos] = useState<BeneficiosErp | null>(null);
  const [cargando, setCargando] = useState(false);
  const [participaLocal, setParticipaLocal] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de una cookie al montar
  useEffect(() => setParticipaLocal(yaParticipaEnNavegador()), []);
  const turno = useRef(0);
  const clave = JSON.stringify(consulta);

  useEffect(() => {
    if (!activo || consulta.lineas.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sin campaña o sin líneas no hay nada que mostrar
      setDatos(null);
      return;
    }
    const mio = ++turno.current;
    setCargando(true);
    const control = new AbortController();
    const espera = setTimeout(async () => {
      try {
        const r = await fetch("/api/campana/beneficios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: clave,
          signal: control.signal,
        });
        const d = (await r.json().catch(() => null)) as BeneficiosErp | null;
        if (mio === turno.current) setDatos(r.ok ? d : null);
      } catch {
        if (mio === turno.current && !control.signal.aborted) setDatos(null);
      } finally {
        if (mio === turno.current) setCargando(false);
      }
    }, 400);
    return () => { clearTimeout(espera); control.abort(); };
    // `clave` resume la consulta completa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, activo]);

  const resumen: ResumenBeneficios | null = resumirBeneficios(datos, participaLocal);
  return { datos, resumen, cargando };
}

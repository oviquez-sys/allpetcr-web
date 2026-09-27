/**
 * ÍCONOS DE BENEFICIO (fichas de alimento, 26/09/2026)
 *
 * Mismo lenguaje que IconoCategoria: caja de 24, solo trazo, 1.6 de grosor,
 * `currentColor`. Dibujados a mano en vez de una librería: son una veintena,
 * pesan menos de 3 KB y no agregan nada a la ruta crítica.
 *
 * La clave es la de BENEFICIOS en allpetcr-erp/catalogo/alimentos.py. Una
 * clave sin dibujo cae en el círculo con check: nunca rompe la ficha.
 */
const trazos: Record<string, React.ReactNode> = {
  digestion: <path d="M12 3c-4 3-6 6-6 9a6 6 0 0 0 12 0c0-3-2-6-6-9Zm0 6v9m0-5 2.5-2.5M12 15l-2.5-2.5" />,
  prebioticos_probioticos: <><circle cx="8" cy="9" r="3" /><circle cx="16" cy="8" r="2" /><circle cx="14.5" cy="15.5" r="3.5" /><circle cx="7" cy="16.5" r="1.5" /></>,
  piel_pelaje: <><path d="M5 19c3-1 4-4 4-8m4 8c1-3 1-7 0-11m4 11c0-3 1-5 3-7" /><path d="m17 4 .8 1.7L19.5 6.5l-1.7.8L17 9l-.8-1.7-1.7-.8 1.7-.8Z" /></>,
  omega: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Zm-2.5 11.5a2.5 2.5 0 0 0 2.5 2.5" />,
  inmunidad: <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4" />,
  articulaciones: <path d="M7.5 4.5a2 2 0 1 0-3 2.6L9 11.6v.8l-4.5 4.5a2 2 0 1 0 2.6 3l4.5-4.5h.8l4.5 4.5a2 2 0 1 0 3-2.6L15.4 12.4v-.8l4.5-4.5a2 2 0 1 0-2.6-3L12.8 8.6H12Z" />,
  control_peso: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9 9.5a4 4 0 0 1 6 0M12 9.5l1.5-1.5" /></>,
  urinaria: <><path d="M12 3s5 5.5 5 9.5a5 5 0 0 1-10 0C7 8.5 12 3 12 3Z" /><path d="M10 13h4" /></>,
  alta_proteina: <path d="M4 10v4m3-6v8m10-8v8m3-6v4M7 12h10" />,
  desarrollo: <path d="M12 20v-9m0 0c0-3-2-5-5-5 0 3 2 5 5 5Zm0 0c0-3 2-5 5-5 0 3-2 5-5 5Z" />,
  dha: <path d="M9 4a4 4 0 0 0-4 4c0 1 .4 2 1 2.7A3.5 3.5 0 0 0 8.5 17H12V4H9Zm6 0a4 4 0 0 1 4 4c0 1-.4 2-1 2.7a3.5 3.5 0 0 1-2.5 6.3H12M12 17v3" />,
  corazon: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
  dental: <path d="M8 4c-2.5 0-4 1.8-4 4.5 0 2.2 1 3.3 1.5 5 .5 2 1 6.5 2.5 6.5s1.5-4 3-4h2c1.5 0 1.5 4 3 4s2-4.5 2.5-6.5c.5-1.7 1.5-2.8 1.5-5C20 5.8 18.5 4 16 4c-1.7 0-2.6 1-4 1S9.7 4 8 4Z" />,
  masa_muscular: <path d="M6 7v10M3.5 9.5v5M18 7v10m2.5-7.5v5M6 12h12" />,
  energia: <path d="m13 3-7 10h5l-1 8 7-10h-5l1-8Z" />,
  vision: <><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
  bolas_pelo: <><circle cx="12" cy="12" r="7" /><path d="M8 9c2-1 5-1 8 1M7.5 13c3-1 6-.5 9 1.5M9 16.5c2-.8 4-.6 5.5.3" /></>,
  hidratacion: <><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" /><path d="M8.5 14h7" /></>,
  sabor: <path d="m12 4 2.3 4.8 5.2.7-3.8 3.6.9 5.2L12 15.8l-4.6 2.5.9-5.2-3.8-3.6 5.2-.7Z" />,
  antioxidantes: <><circle cx="12" cy="12" r="1.5" /><ellipse cx="12" cy="12" rx="8" ry="3.2" /><ellipse cx="12" cy="12" rx="8" ry="3.2" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="8" ry="3.2" transform="rotate(-60 12 12)" /></>,
};

export default function IconoBeneficio({ clave, className = "" }: { clave: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {trazos[clave] ?? <><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>}
    </svg>
  );
}

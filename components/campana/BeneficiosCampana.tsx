import { zonasLegibles } from "@/lib/campana";

/**
 * Los dos beneficios de la campaña, CADA UNO POR SEPARADO (pedido de Oscar):
 * el doble puntaje vale en tienda y en web; el envío gratis solo en pedidos
 * web dentro de la zona. Juntarlos en una frase hacía creer que en la tienda
 * también había «envío gratis».
 */
export default function BeneficiosCampana({ zonas = [], variante = "claro" }: {
  zonas?: string[];
  variante?: "claro" | "oscuro";
}) {
  const oscuro = variante === "oscuro";
  const lugares = zonasLegibles(zonas);
  const items = [
    {
      titulo: "Comprá más de ₡20.000 en tienda o en la web y ganá doble puntaje.",
      detalle: "Cada compra te da 1 número para el sorteo; si supera ₡20.000, te da 1 más.",
    },
    {
      titulo: "En pedidos web de más de ₡20.000, el envío es gratis en nuestra zona de cobertura en Heredia.",
      detalle: lugares ? `Zona: ${lugares}, del cantón central de Heredia. Fuera de esa zona el envío se cotiza.` : "",
    },
  ];
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((i) => (
        <li key={i.titulo}
          className={`rounded-card p-5 ${oscuro ? "bg-white/5 ring-1 ring-white/15" : "bg-white ring-1 ring-crema-400"}`}>
          <p className={`text-[15.5px] font-medium leading-snug ${oscuro ? "text-crema-100" : "text-navy-500"}`}>{i.titulo}</p>
          {i.detalle && (
            <p className={`mt-1.5 text-[13.5px] leading-relaxed ${oscuro ? "text-crema-200" : "text-navy-400"}`}>{i.detalle}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

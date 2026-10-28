import Marca from "@/components/Marca";

/**
 * Lo que se ve en lugar de la foto de un producto que todavía no la tiene
 * (27/10/2026). Antes decía «FOTO PENDIENTE»: es lenguaje de trabajo
 * interno, y en una tienda se lee como algo sin terminar. Ahora es el
 * isotipo de AllPet en una sola tinta, tenue, que ocupa el lugar sin gritar;
 * en la ficha grande lo acompaña un texto honesto.
 *
 * Decorativo para lectores de pantalla: el nombre del producto ya está al
 * lado, y en la ficha el texto visible lo dice.
 */
export default function SinFoto({ tamano = "tarjeta" }: { tamano?: "tarjeta" | "ficha" | "mini" }) {
  if (tamano === "mini") {
    return <Marca variante="iso" monocromo decorativo className="h-8 w-8 text-navy-200" />;
  }
  if (tamano === "ficha") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <Marca variante="iso" monocromo decorativo className="h-24 w-24 text-navy-200" />
        <p className="text-sm text-navy-400">Todavía no tenemos foto de este producto.</p>
      </div>
    );
  }
  return <Marca variante="iso" monocromo decorativo className="h-14 w-14 text-navy-200" />;
}

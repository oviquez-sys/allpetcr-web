export const metadata = {
  title: "Contacto | AllPet",
};

// NOTA: sin backend de envío de formulario todavía.
// Placeholder de datos de contacto — reemplazar con los reales.

const datos = [
  { rotulo: "WhatsApp / Teléfono", valor: "(por definir)" },
  { rotulo: "Correo", valor: "(por definir)" },
  { rotulo: "Dirección", valor: "(por definir)" },
  { rotulo: "Horario", valor: "(por definir)" },
];

export default function ContactoPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-[38px] font-light leading-tight text-navy-500">
        Contacto
      </h1>
      <p className="mt-3 text-[16.5px] font-light text-navy-400">
        Escribinos o visitanos en la tienda.
      </p>

      <dl className="mt-12 divide-y divide-crema-400 border-y border-crema-400">
        {datos.map((d) => (
          <div key={d.rotulo} className="py-5">
            <dt className="text-[10.5px] uppercase tracking-[0.09em] text-dorado-700">
              {d.rotulo}
            </dt>
            <dd className="mt-1.5 text-lg font-light text-navy-500">{d.valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

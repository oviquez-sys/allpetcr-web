import PedidoSeguimientoCliente from "@/components/PedidoSeguimientoCliente";

export const metadata = {
  title: "Seguimiento de pedido",
  robots: { index: false, follow: false },
};

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;
  return <PedidoSeguimientoCliente numero={decodeURIComponent(numero)} />;
}

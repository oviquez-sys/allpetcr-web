# Campaña Navidad AllPet 2026 en el sitio (16/11/2026)

El ERP manda (app `campanas`). El sitio solo muestra lo que el ERP responde:
- `lib/campana.ts`: estados (abierta / cerrada / finalizada / ninguna), textos, zona.
- `lib/campanaServidor.ts`: GET campana/, POST campana/inscripcion/, campana/beneficios/, pedidos/por-confirmar/.
- Portada: `HeroCampana` primer bloque; `BandaCampana` en lugar de La manada.
- `/navidad`: formulario (`FormularioCampana`), «¡Ya estás participando!», bases del ERP.
- `/manada` redirige a `/navidad` mientras haya campaña (QR viejos).
- Franja superior y menú del celular: `AvisoCampanaBarra`.
- Carrito y confirmación: `CajaSorteo` + `useBeneficiosCampana`; el pedido se anota
  en el ERP (WEB-n) con una clave por pedido (`lib/clavePedido.ts`), sin duplicar.
- `/envios`: envío gratis según el ERP.

Encendido: nada que tocar en el sitio. Aparece cuando la campaña está ACTIVA en el
ERP; sin campaña activa, la portada es la de siempre. Después del sorteo la portada
dice «Este sorteo finalizó» hasta el 31/01/2027 (`CAMPANA_IMPRESA.avisoFinalHasta`).
Pruebas: `lib/campana.test.ts`.

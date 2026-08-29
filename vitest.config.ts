import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // "server-only" solo distingue cliente/servidor a través de las
      // condiciones de resolución del bundler de Next.js. Bajo Vitest (Node
      // llano) siempre resuelve a la variante que lanza el error, así que
      // cualquier prueba que importe algo con "server-only" (ej.
      // lib/erpServidor.ts) fallaría sin poder probar nada. Acá se
      // reemplaza por un módulo vacío — la protección real sigue intacta
      // en el build de Next, que es donde tiene que estarlo.
      "server-only": fileURLToPath(new URL("./lib/testing/server-only-stub.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "components/**/*.test.ts", "app/**/*.test.ts"],
  },
});

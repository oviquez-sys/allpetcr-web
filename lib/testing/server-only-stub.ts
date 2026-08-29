// Reemplazo de "server-only" solo para las pruebas (ver vitest.config.ts).
// No hace nada a propósito: bajo Vitest no hay navegador al que protegerle
// nada. La protección real la sigue haciendo el paquete "server-only" de
// verdad en el build de Next.js.
export {};

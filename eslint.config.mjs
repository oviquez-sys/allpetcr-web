// Configuración "flat" de ESLint 9 (el formato .eslintrc quedó obsoleto).
import coreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  { ignores: [".next/**", "node_modules/**", "out/**"] },
  ...coreWebVitals,
];

export default config;

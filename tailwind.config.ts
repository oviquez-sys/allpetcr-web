import type { Config } from "tailwindcss";

// PALETA — muestreada del logo oficial (public/marca/allpetcr-original.svg).
//
// Los dos valores 500 NO son una elección estética: son los colores exactos
// del logo vectorizado. El azul aparece en el archivo como catorce variantes
// entre rgb(8,43,92) y rgb(10,48,96) —ruido del vectorizado, no intención de
// diseño— y se normalizan al valor dominante rgb(9,46,94) = #092E5E. El
// dorado sí es un único valor limpio: rgb(204,149,57) = #CC9539.
//
// La regla que mantiene esto ordenado, y que NO hay que romper:
//   · un solo fondo  → los cálidos (crema/arena)
//   · una sola tinta → navy
//   · un solo acento → dorado, en dosis pequeñas
//
// ⚠ CONTRASTE — el dorado 500 NO sirve para texto.
// Sobre crema da 2.50:1, muy por debajo del 4.5:1 que exige WCAG AA. Es
// correcto para superficies, iconos grandes y bordes; para texto hay que
// usar dorado-700 (#7F5B25 → 5.78:1) o dorado-600 oscurecido (#96692A →
// 4.55:1). Esto no es pedantería: el precio y las etiquetas de categoría son
// justo el texto que más gente necesita leer.
//
// El día que alguien meta un tercer color o un blanco puro de fondo en medio
// de la página, la paleta se rompe. Si el dorado empieza a usarse para
// rellenar superficies grandes, deja de verse caro.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fondos cálidos: la base que da el aire.
        crema: {
          DEFAULT: "#FAF8F4",
          50: "#FDFCFA",
          100: "#FAF8F4",
          200: "#F5F0E8",
          300: "#F0EBE1",
          400: "#E6DFD4",
          500: "#D8CDBC",
        },
        // Tinta: la identidad de marca. El 500 es el azul exacto del logo.
        navy: {
          DEFAULT: "#092E5E",
          50: "#E8ECF1",
          100: "#CBD7E6",
          200: "#9DA8B6",
          300: "#7B8A9D",
          400: "#556479",
          500: "#092E5E", // ← rgb(9,46,94), muestreado del logo
          600: "#07264D",
          700: "#061D3A",
          800: "#041326",
          900: "#020913",
        },
        // Acento: solo para detalles pequeños. El 500 es el dorado del logo.
        // Para TEXTO usar 700 (5.78:1) o 650 (4.55:1) — ver nota de contraste.
        dorado: {
          DEFAULT: "#CC9539",
          50: "#FBF6EC",
          100: "#F5EBD9",
          200: "#ECD8B3",
          300: "#E1BF84",
          400: "#D8AB5D",
          500: "#CC9539", // ← rgb(204,149,57), muestreado del logo
          600: "#A87830",
          650: "#96692A", // mínimo que pasa AA sobre crema (4.55:1)
          700: "#7F5B25", // texto sobre crema (5.78:1)
          800: "#543C19",
          900: "#2A1D0C",
        },
      },
      fontFamily: {
        // Autohospedadas vía @fontsource (npm): cero peticiones externas.
        display: ["'Fraunces Variable'", "Georgia", "serif"],
        sans: ["'Inter Variable'", "system-ui", "sans-serif"],
      },
      // Escala tipográfica documentada en DESIGN.md. Antes de esto el sitio
      // tenía 15+ tamaños arbitrarios (text-[38px], text-[34px], text-[32px],
      // text-[28px] usados indistintamente como "título de página", por
      // ejemplo) sin ningún paso compartido. Estos cinco cubren los roles que
      // de verdad se repiten; los tamaños de ayuda/disclaimer puntuales (12.5,
      // 13, 11.5px…) se dejan como texto arbitrario a propósito — son casos
      // de uso único y forzarlos a esta escala los volvería menos legibles en
      // su contexto real, no más consistentes.
      fontSize: {
        headline: ["2rem", { lineHeight: "1.15", fontWeight: "300" }], // 32px
        title: ["0.90625rem", { lineHeight: "1.4" }], // 14.5px
        price: ["1.0625rem", { lineHeight: "1.3", fontWeight: "500" }], // 17px
        label: ["0.6875rem", { lineHeight: "1.3", letterSpacing: "0.09em" }], // 11px
      },
      borderRadius: {
        card: "16px",
      },
      maxWidth: {
        contenido: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;

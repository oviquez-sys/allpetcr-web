import type { Config } from "tailwindcss";

// PALETA C — "el mix" (aprobada por Oscar).
//
// La regla que mantiene esto ordenado, y que NO hay que romper:
//   · un solo fondo  → los cálidos (crema/arena)
//   · una sola tinta → navy
//   · un solo acento → dorado, en dosis pequeñas
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
        // Tinta: la identidad de marca.
        navy: {
          DEFAULT: "#0B3161",
          50: "#E9EDF1",
          100: "#CCD9E7",
          200: "#9EA9B7",
          300: "#7C8B9E",
          400: "#56657A",
          500: "#0B3161",
          600: "#092950",
          700: "#071F3C",
          800: "#041428",
          900: "#020A14",
        },
        // Acento: solo para detalles pequeños.
        dorado: {
          DEFAULT: "#CD963A",
          50: "#FBF6EC",
          100: "#F5EBDA",
          200: "#EDD9B4",
          300: "#E2C085",
          400: "#D9AC5E",
          500: "#CD963A",
          600: "#A97930",
          700: "#7F5B25",
          800: "#553D19",
          900: "#2B1E0D",
        },
      },
      fontFamily: {
        // Autohospedadas vía @fontsource (npm): cero peticiones externas.
        display: ["'Fraunces Variable'", "Georgia", "serif"],
        sans: ["'Inter Variable'", "system-ui", "sans-serif"],
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

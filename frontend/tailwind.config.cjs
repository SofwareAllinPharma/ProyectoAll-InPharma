/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* Fuentes (coinciden con las que importaste en index.css) */
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        playfair: ["Playfair Display", "serif"],
        merriweather: ["Merriweather", "serif"],
        roboto: ["Roboto", "sans-serif"],
      },

      /* Colores de marca: elegí una de las dos opciones 👇 */
      // Opción A: usar los HEX directamente
      colors: {
        brand: {
          beige: "#f5f1e8",
          brown: "#5d5448",
        },
        "brown-dark": "#3e3529",
        "brown-medium": "#7c6a55",
        cream: "#f3efe6",
        "beige-light": "#bdaf9e",
        "brown-light": "#9d977b",
      },

      // Opción B (alternativa): mapear variables CSS definidas en :root
      // colors: {
      //   brand: {
      //     beige: "var(--brand-beige)",
      //     brown: "var(--brand-brown)",
      //   },
      // },
    },
  },
  plugins: [
    // Activalos si los usás:
    // require("@tailwindcss/forms"),
    // require("@tailwindcss/typography"),
    // require("@tailwindcss/aspect-ratio"),
  ],
};

/**
 * Tailwind CSS – Configuración (v4)
 *
 * Objetivo:
 *  - Indicar a Tailwind qué archivos debe escanear para generar las clases (content).
 *  - Extender tokens de diseño (colores, tipografías, espacios) en `theme.extend`.
 *  - Registrar plugins si los usamos (forms, typography, etc).
 *
 * Notas:
 *  - Usamos CommonJS (`module.exports`) para evitar problemas de resolución con herramientas.
 *  - Si movés/renombrás carpetas, actualizá los globs de `content` o no se generarán estilos.
 *  - Los colores de marca de ejemplo te permiten usar clases como:
 *      bg-brand-beige  text-brand-brown  border-brand-brown
 
** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
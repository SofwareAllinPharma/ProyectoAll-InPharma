// Qué es cn.ts? Es un helper (función de ayuda) que se usa en muchos proyectos con Tailwind o CSS para juntar clases dinámicamente sin hacer cadenas largas y confusas.

export function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}
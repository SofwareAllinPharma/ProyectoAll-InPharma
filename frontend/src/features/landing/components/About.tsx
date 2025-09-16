import { FaReact, FaNodeJs } from "react-icons/fa";
import { SiTypescript, SiTailwindcss, SiPrisma, SiPostgresql, SiDocker, SiRailway } from "react-icons/si";

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 grid sm:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-3">¿Qué es All-In Pharma?</h2>
          <p className="leading-relaxed">
            Plataforma a medida para una farmacia con foco en <b>gestión de fábrica</b>,
            <b> catálogo de productos</b>, <b>pedidos de elaboración</b> y <b>stock</b>, con
            <b> trazabilidad por estados</b>, <b>gestión de fórmulas</b> y generación de etiquetas.
          </p>
        </div>
        {/* Tarjeta de Stack Profesional */}

        <div className="rounded-2xl border border-[#5d5448]/30 bg-white p-8 shadow-md">
          <p className="text-sm uppercase tracking-wide text-[#5d5448]/70 font-medium mb-4">
            Stack del proyecto
          </p>
          <div className="grid grid-cols-2 gap-4 text-[#5d5448]">
            <div className="flex items-center gap-2">
              <FaReact className="text-sky-500 text-xl" />
              <span className="text-sm font-medium">React</span>
            </div>
            <div className="flex items-center gap-2">
              <SiTypescript className="text-blue-600 text-xl" />
              <span className="text-sm font-medium">TypeScript</span>
            </div>
            <div className="flex items-center gap-2">
              <SiTailwindcss className="text-cyan-500 text-xl" />
              <span className="text-sm font-medium">Tailwind CSS</span>
            </div>
            <div className="flex items-center gap-2">
              <FaNodeJs className="text-green-600 text-xl" />
              <span className="text-sm font-medium">Express</span>
            </div>
            <div className="flex items-center gap-2">
              <SiPrisma className="text-indigo-600 text-xl" />
              <span className="text-sm font-medium">Prisma</span>
            </div>
            <div className="flex items-center gap-2">
              <SiPostgresql className="text-sky-700 text-xl" />
              <span className="text-sm font-medium">PostgreSQL</span>
            </div>
            <div className="flex items-center gap-2">
              <SiDocker className="text-sky-600 text-xl" />
              <span className="text-sm font-medium">Docker</span>
            </div>
            <div className="flex items-center gap-2">
              <SiRailway className="text-sky-600 text-xl" />
              <span className="text-sm font-medium">Railway</span>
            </div>
          </div>
        </div>
      </div>
    </section >
  );
}

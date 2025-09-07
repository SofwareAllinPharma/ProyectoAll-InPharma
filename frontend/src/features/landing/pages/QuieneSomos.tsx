import TeamSection from "../components/TeamSection";
export default function QuienesSomos() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 text-[#5d5448]">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">¿Quiénes somos?</h1>
          <p className="mt-2 max-w-2xl">
            Somos el equipo responsable de diseñar y construir All-In Pharma, un sistema
            a medida para una operación farmacéutica real, priorizando trazabilidad,
            calidad de datos y una arquitectura que soporte el crecimiento.
          </p>
        </header>

        {/* Valores y foco */}
        <div className="grid gap-6 sm:grid-cols-3 mb-10">
          <div className="rounded-2xl border border-[#5d5448]/20 bg-white p-6 shadow-sm">
            <h3 className="font-semibold mb-1">Enfoque</h3>
            <p className="text-sm opacity-80">
              Primero lo esencial, con estados de trazabilidad y reglas claras.
            </p>
          </div>
          <div className="rounded-2xl border border-[#5d5448]/20 bg-white p-6 shadow-sm">
            <h3 className="font-semibold mb-1">Calidad</h3>
            <p className="text-sm opacity-80">
              Código tipado, linting, revisiones, y decisiones documentadas por sprint.
            </p>
          </div>
          <div className="rounded-2xl border border-[#5d5448]/20 bg-white p-6 shadow-sm">
            <h3 className="font-semibold mb-1">Escalabilidad</h3>
            <p className="text-sm opacity-80">
              Diseño modular para agregar módulos futuros sin reescribir el core.
            </p>
          </div>
        </div>

        {/* Equipo (roles) */}
        <div className="rounded-2xl border border-[#5d5448]/20 bg-white p-8 shadow-sm">
          <TeamSection />
        </div>
      </div>
    </section>
  );
}

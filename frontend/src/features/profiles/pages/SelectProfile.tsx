import ProfileCard from "../components/ProfileCard";

const ROLES = [
    { key: "tecnico", label: "Técnico", description: "Gestión técnica y operaciones." },
    { key: "atencion", label: "Atención al Público", description: "Ventas, mostrador y turnos." },
    { key: "admin", label: "Administrador", description: "Configuración y usuarios." },
];

export default function SelectProfile() {
    return (
        <section className="mt-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-3">¿Quién usa All-In Pharma?</h1>
                <p className="text-lg font-medium opacity-80">Elegí un perfil para continuar</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-20">
                {ROLES.map((r) => (
                    <ProfileCard
                        key={r.key}
                        role={r.key as "tecnico" | "atencion" | "admin"}
                        title={r.label}
                        to={`/${r.key}`}
                        description={r.description}
                    />
                ))}
            </div>
        </section>
    );
}

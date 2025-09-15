import ProfileCard from "../components/ProfileCard";

import tecnicoIcon from "../../../assets/icons/tecnico/tecnico_icono_perfil.png";
import atencionIcon from "../../../assets/icons/atencion/atencion_icono_perfil.png";
import adminIcon from "../../../assets/icons/admin/admin_icono_perfil.png";

const ROLES = [
    { key: "tecnico", label: "Técnico", description: "Gestión técnica y operaciones.", icon: tecnicoIcon },
    { key: "atencion", label: "Atención al Público", description: "Ventas, mostrador y turnos.", icon: atencionIcon },
    { key: "admin", label: "Administrador", description: "Configuración y usuarios.", icon: adminIcon },
];

export default function SelectProfile() {
    return (
        <section className="mx-auto max-w-7xl px-4 py-10 text-[#5d5448] mt-2">
            {/* Encabezado como en el ZIP original */}
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-2">¿Quién usa All-In Pharma?</h1>
                <p className="text-lg font-semibold opacity-80">Elegí tu perfil para ingresar al sistema</p>
            </div>

            {/* Tarjetas de perfiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-18">
                {ROLES.map((r) => (
                    <ProfileCard
                        key={r.key}
                        role={r.key as "tecnico" | "atencion" | "admin"}
                        title={r.label}
                        description={r.description}
                        to={`/${r.key}`}
                        icon={r.icon}
                    />
                ))}
            </div>
        </section>
    );
}

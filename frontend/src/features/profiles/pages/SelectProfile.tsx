import ProfileCard from "../components/ProfileCard";
import { useAuth } from '../../../lib/auth';

import tecnicoIcon from "../../../assets/icons/tecnico/tecnico_icono_perfil.png";
import atencionIcon from "../../../assets/icons/atencion/atencion_icono_perfil.png";
import adminIcon from "../../../assets/icons/admin/admin_icono_perfil.png";

const ROLES = [
    { key: "tecnico", roleCode: 'TECNICO', label: "Técnico", description: "Gestión técnica y operaciones.", icon: tecnicoIcon, path: "/tecnico" },
    { key: "adminFab", roleCode: 'ADMINFAB', label: "Administrador de Fábrica", description: "Varios.", icon: atencionIcon, path: "/atencion" },
    { key: "adminSis", roleCode: 'ADMINSIS', label: "Administrador del Sistema", description: "Configuración y usuarios.", icon: adminIcon, path: "/admin" },
];

export default function SelectProfile() {
    const { user } = useAuth();
    const roles = user?.roles ?? [];

    // Si el usuario tiene ADMINSIS, muestra todas. Sino muestra sólo las que coinciden con sus roles.
    const visible = roles.includes('ADMINSIS')
        ? ROLES
        : ROLES.filter(r => roles.includes(r.roleCode));

    // Si hay menos de 3 perfiles visibles los centramos con flex; si hay 3 o más usamos grid de 3 columnas
    const useCenteredLayout = visible.length > 0 && visible.length < 3;

    return (
        <section className="mx-auto max-w-7xl px-4 py-10 text-[#5d5448] mt-2">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-2">¿Quién usa All-In Pharma?</h1>
                <p className="text-lg font-semibold opacity-80">Elegí tu perfil para ingresar al sistema</p>
            </div>

            {/* Tarjetas de perfiles: grid para 3+, flex centrado para 1-2 */}
            <div className={`${useCenteredLayout ? 'flex flex-wrap justify-center items-stretch' : 'grid grid-cols-1 sm:grid-cols-3 items-stretch'} gap-6 max-w-4xl mx-auto mt-18`}>
                {visible.length === 0 ? (
                    <div className="col-span-1 sm:col-span-3 text-center text-lg opacity-80">No tienes perfiles asignados.</div>
                ) : (
                    visible.map((r) => (
                        <ProfileCard
                            key={r.key}
                            role={r.key as "tecnico" | "adminFab" | "adminSis"}
                            title={r.label}
                            description={r.description}
                            to={r.path}
                            icon={r.icon}
                        />
                    ))
                )}
            </div>
        </section>
    );
}

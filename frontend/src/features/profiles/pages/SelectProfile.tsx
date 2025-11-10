import ProfileCard from "../components/ProfileCard";
import { useAuth } from '../../../lib/auth';

import tecnicoIcon from "../../../assets/icons/tecnico/tecnico_icono_perfil.png";
import adminFabIcon from "../../../assets/icons/adminfab/adminfab_icono_perfil.png";
import adminSisIcon from "../../../assets/icons/adminsis/admin_icono_perfil.png";
import encPtoVentaIcon from "../../../assets/icons/encptoventa/encptoventa_icono_perfil.png";

const ROLES = [
    { key: "tecnico", roleCode: 'TECNICO', label: "Técnico", description: "Ejecución del trabajo operativo en fábrica", icon: tecnicoIcon, path: "/tecnico" },
    { key: "adminfab", roleCode: 'ADMINFAB', label: "Administrador de Fábrica", description: "Gestión operativa dentro de la fábrica", icon: adminFabIcon, path: "/adminfab" },
    { key: "adminsis", roleCode: 'ADMINSIS', label: "Administrador del Sistema", description: "SuperAdmin, gestión y control total", icon: adminSisIcon, path: "/adminsis" },
    { key: "encptoventa", roleCode: 'ENCPTOVENTA', label: "Encargado Punto de Venta", description: "Registra egresos y solicita traslados/egresos.", icon: encPtoVentaIcon, path: "/puntoventa" },
];

export default function SelectProfile() {
    const { user } = useAuth();
    const roles = user?.roles ?? [];

    // Si el usuario tiene ADMINSIS, muestra todas. Sino muestra sólo las que coinciden con sus roles.
    const visible = roles.includes('ADMINSIS')
        ? ROLES
        : ROLES.filter(r => roles.includes(r.roleCode));

    // Usar grid responsivo con columnas automáticas para que las cards se distribuyan proporcionalmente
    // usando minmax para adaptarse al ancho de pantalla.
    return (
        <section className="mx-auto max-w-7xl px-4 py-10 text-[#5d5448] mt-2">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-2">¿Quién usa All-In Pharma?</h1>
                <p className="text-lg font-semibold opacity-80">Elegí tu perfil para ingresar al sistema</p>
            </div>

                        {/* Tarjetas de perfiles: grid responsivo con auto-fit para mantener proporciones */}
                                    <div className="max-w-7xl mx-auto mt-8">
                            {visible.length === 0 ? (
                                <div className="text-center text-lg opacity-80">No tienes perfiles asignados.</div>
                            ) : (
                                <div
                                    className="grid gap-6"
                                                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', justifyContent: 'center' }}
                                >
                                    {visible.map((r) => (
                                        <ProfileCard
                                            key={r.key}
                                            role={r.key as "tecnico" | "adminfab" | "adminsis" | "encptoventa"}
                                            title={r.label}
                                            description={r.description}
                                            to={r.path}
                                            icon={r.icon}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
        </section>
    );
}

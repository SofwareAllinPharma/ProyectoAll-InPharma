import { Link } from "react-router-dom";

type Props = {
    role: "tecnico" | "atencion" | "admin";
    title: string;
    to: string;
    description?: string;
};

const icons: Record<Props["role"], string> = {
    tecnico: "🧪",
    atencion: "🧍‍♀️",
    admin: "🛠️",
};

export default function ProfileCard({ role, title, to, description }: Props) {
    return (
        <Link
            to={to}
            className="group rounded-2xl border border-[#5d5448] bg-white/70 p-6 text-center shadow-sm transform transition duration-300 hover:scale-110 hover:shadow-lg"
            aria-label={`Entrar a perfil ${title}`}
        >
            <div className="text-6xl mb-4 leading-none" aria-hidden="true">
                {icons[role]}
            </div>
            <h2 className="text-xl font-semibold mb-1">{title}</h2>
            {description && <p className="text-sm opacity-80">{description}</p>}
        </Link>
    );
}

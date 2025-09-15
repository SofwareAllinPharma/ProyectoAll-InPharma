import { Link } from "react-router-dom";

type ProfileCardProps = {
    role: "tecnico" | "atencion" | "admin";
    title: string;
    description: string;
    to: string;
    icon: string;
};

export default function ProfileCard({
    role,
    title,
    description,
    to,
    icon,
}: ProfileCardProps) {
    return (
        <Link
            to={to}
            data-role={role}
            className="bg-[#faf8f2] border border-[#5d5448] rounded-lg p-6 flex flex-col items-center transition-transform transform hover:scale-110 hover:shadow-lg"
        >
            {/* Contenedor para que el ícono no se deforme */}
            <div className="w-30 h-30 mb-4 flex items-center justify-center">
                <img
                    src={icon}
                    alt={title}
                    className="max-w-full max-h-full object-contain"
                />
            </div>

            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm opacity-80 text-center">{description}</p>
        </Link>
    );
}

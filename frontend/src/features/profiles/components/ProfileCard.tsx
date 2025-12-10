import { Link } from "react-router-dom";

type ProfileCardProps = {
    role: "tecnico" | "adminfab" | "adminsis" | "encptoventa";
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
            className="bg-[#faf8f2] border border-[#5d5448] rounded-lg p-6 flex flex-col items-center justify-start text-center transition-transform transform hover:scale-105 hover:shadow-lg w-full h-full min-h-[14rem]"
        >
            {/* Contenedor para que el ícono no se deforme */}
            <div className="w-24 h-24 mb-4 flex items-center justify-center">
                <img
                    src={icon}
                    alt={title}
                    className="max-w-full max-h-full object-contain"
                />
            </div>

            <h2 className="text-lg font-bold h-12 flex items-center justify-center">{title}</h2>
            <p className="text-sm opacity-80 mt-2">{description}</p>
        </Link>
    );
}

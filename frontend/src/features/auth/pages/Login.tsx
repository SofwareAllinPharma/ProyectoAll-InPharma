import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: reemplazar por autenticación real
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 600));
      navigate("/perfiles", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-2">Iniciar sesión</h1>
        <p className="text-sm opacity-80 mb-8">
          Accede a tu cuenta para gestionar el sistema All-In Pharma.
        </p>

        <form
          className="rounded-2xl border border-[#5d5448] bg-white/70 backdrop-blur p-6 shadow-sm"
          onSubmit={onSubmit}
        >
          <label className="block text-sm mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full rounded-lg border border-[#5d5448] bg-white/80 px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-[#5d5448]/30"
            placeholder="tu@email.com"
          />

          <label className="block text-sm mb-1" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            className="w-full rounded-lg border border-[#5d5448] bg-white/80 px-3 py-2 mb-6 outline-none focus:ring-2 focus:ring-[#5d5448]/30"
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#5d5448] text-white px-4 py-2 font-medium hover:bg-[#5d5448]/90 disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>


          <div className="mt-4 text-sm flex items-center justify-between">
            <Link to="/" className="underline">
              ← Volver al inicio
            </Link>
            <a href="#" className="underline">
              Olvidé mi contraseña
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}

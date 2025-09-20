import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiFetch, setToken } from "../../../lib/api"; 

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const mail = String(form.get("email"));
      const password = String(form.get("password"));

      const { accessToken } = await apiFetch<{ accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ mail, password }),
      });

      setToken(accessToken);
      navigate("/perfiles", { replace: true });
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message || "Error de autenticación");
      } else {
        setErr("Error de autenticación");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-2">Iniciar sesión</h1>
        <p className="text-sm opacity-80 mb-8">Accede a tu cuenta para gestionar el sistema All-In Pharma.</p>

        {err && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-300 text-red-700 px-3 py-2 text-sm">
            {err}
          </div>
        )}

        <form className="rounded-2xl border border-[#5d5448] bg-white/70 backdrop-blur p-6 shadow-sm" onSubmit={onSubmit}>
          <label className="block text-sm mb-1" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="w-full rounded-lg border border-[#5d5448] bg-white/80 px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-[#5d5448]/30" placeholder="tu@email.com" />

          <label className="block text-sm mb-1" htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" required className="w-full rounded-lg border border-[#5d5448] bg-white/80 px-3 py-2 mb-6 outline-none focus:ring-2 focus:ring-[#5d5448]/30" placeholder="••••••••" />

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#5d5448] text-white px-4 py-2 font-medium hover:bg-[#5d5448]/90 disabled:opacity-60">
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          <div className="mt-4 text-sm flex items-center justify-between">
            <Link to="/" className="underline">← Volver al inicio</Link>
            <Link to="/auth/forgot" className="underline">Olvidé mi contraseña</Link>
          </div>
        </form>
      </div>
    </section>
  );
}

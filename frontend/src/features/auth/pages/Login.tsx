import { Link } from "react-router-dom";

export default function Login() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-2">Iniciar sesión</h1>
        <p className="text-sm opacity-80 mb-8">
          Accede a tu cuenta para gestionar el sistema All-In Pharma.
        </p>

        <form
          className="rounded-2xl border border-[#5d5448] bg-white/70 backdrop-blur p-6 shadow-sm"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="block text-sm mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-lg border border-[#5d5448]/40 px-4 py-2 mb-4 outline-none focus:ring-2 focus:ring-[#5d5448]/40 bg-white"
            placeholder="tu@correo.com"
            required
          />

          <label className="block text-sm mb-1" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-lg border border-[#5d5448]/40 px-4 py-2 mb-6 outline-none focus:ring-2 focus:ring-[#5d5448]/40 bg-white"
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            className="w-full rounded-lg border border-[#5d5448] bg-[#5d5448] text-white font-semibold py-2.5 hover:opacity-90 transition"
          >
            Ingresar
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

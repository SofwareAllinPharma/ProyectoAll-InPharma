import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from '../../../lib/auth';
import PasswordField from '../../../components/PasswordField';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState<{ type: string; msg: string } | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlert(null);
    try {
      await login(mail, password);
      navigate('/perfiles', { replace: true });
    } catch {
      setAlert({ type: 'danger', msg: 'Credenciales inválidas. Mail y/o contraseña incorrectos. Por favor, intente nuevamente' });
    }
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-2">Iniciar sesión</h1>
        <p className="text-sm opacity-80 mb-8">
          Accede a tu cuenta para gestionar el sistema All-In Pharma.
        </p>

        {alert && (
          <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${
            alert.type === 'success'
              ? 'bg-green-100 text-green-800'
              : alert.type === 'danger'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {alert.msg}
          </div>
        )}

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
            value={mail}
            onChange={(e) => { setMail(e.target.value); setAlert(null); }}
            className="w-full rounded-lg border border-[#5d5448] bg-white/80 px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-[#5d5448]/30"
            placeholder="tu@email.com"
          />

          <PasswordField
            id="password"
            label="Contraseña"
            required
            value={password}
            onChange={(e) => { setPassword(e.target.value); setAlert(null); }}
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
            <Link to="/auth/forgot" className="underline">
              Olvidé mi contraseña
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
import { type FormEvent, useState } from "react";
import { useLocation } from "react-router-dom";
import { authApi } from "../../../lib/auth";
import PasswordField from "../../../components/PasswordField";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const q = useQuery();
  const [mail, setMail] = useState(q.get("mail") ?? "");
  const [token, setToken] = useState(q.get("token") ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: string; msg: string } | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAlert(null);
    if (!mail || !token || !newPassword || !confirm) {
      setAlert({ type: "warning", msg: "Completá todos los campos." });
      return;
    }
    if (newPassword !== confirm) {
      setAlert({ type: "warning", msg: "Las contraseñas no coinciden." });
      return;
    }
    try {
      setLoading(true);
      await authApi.resetPassword(mail, token, newPassword);
      setAlert({ type: "success", msg: "¡Contraseña cambiada con éxito!" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg = String(err.message ?? "");
      setAlert({
        type: "danger",
        msg: /token/i.test(msg) ? "El token es inválido o expiró." : msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-2">Restablecer contraseña</h1>
        <p className="text-sm opacity-80 mb-8">
          Ingresá el código que recibiste por mail y tu nueva contraseña.
        </p>

        {alert && (
          <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${
            alert.type === "success"
              ? "bg-green-100 text-green-800"
              : alert.type === "danger"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}>
            {alert.msg}
          </div>
        )}

        <form
          className="rounded-2xl border border-[#5d5448] bg-white/70 backdrop-blur p-6 shadow-sm"
          onSubmit={onSubmit}
        >
          <label className="block text-sm mb-1" htmlFor="mail">
            Correo electrónico
          </label>
          <input
            id="mail"
            type="email"
            required
            value={mail}
            onChange={e => setMail(e.target.value)}
            className="w-full rounded-lg border border-[#5d5448] bg-white/80 px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-[#5d5448]/30"
            placeholder="tu@email.com"
          />
          <label className="block text-sm mb-1" htmlFor="token">
            Código (token)
          </label>
          <input
            id="token"
            type="text"
            required
            value={token}
            onChange={e => setToken(e.target.value)}
            className="w-full rounded-lg border border-[#5d5448] bg-white/80 px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-[#5d5448]/30"
            placeholder="Código recibido por mail"
          />
          <PasswordField
            id="newPassword"
            label="Nueva contraseña"
            value={newPassword}
            onChange={e => setNewPassword(e.currentTarget.value)}
          />
          <PasswordField
            id="confirm"
            label="Repetir contraseña"
            value={confirm}
            onChange={e => setConfirm(e.currentTarget.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#5d5448] text-white px-4 py-2 font-medium hover:bg-[#5d5448]/90 disabled:opacity-60 mt-2"
          >
            {loading ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </section>
  );
}

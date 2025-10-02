
import type { FormEvent } from "react";
import { useState } from "react";
import { authApi } from "../../../lib/auth";

export default function ForgotPassword() {
  const [mail, setMail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: string; msg: string } | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAlert(null);
    if (!mail.trim()) {
      setAlert({ type: "warning", msg: "Ingresá tu correo." });
      return;
    }
    try {
      setLoading(true);
      await authApi.forgotPassword(mail.trim());
      setAlert({
        type: "success",
        msg: "Si el correo existe, te enviamos un email con el código y un enlace válido por 2 horas.",
      });
      setMail("");
    } catch (err: unknown) {
      let message = "Ocurrió un error";
      if (err instanceof Error) {
        message = err.message;
      }
      setAlert({ type: "danger", msg: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-2">Recuperar contraseña</h1>
        <p className="text-sm opacity-80 mb-8">
          Ingresá tu correo y te enviaremos un email con instrucciones para restablecer tu contraseña.
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
            className="w-full rounded-lg border border-[#5d5448] bg-white/80 px-3 py-2 mb-6 outline-none focus:ring-2 focus:ring-[#5d5448]/30"
            placeholder="tu@email.com"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#5d5448] text-white px-4 py-2 font-medium hover:bg-[#5d5448]/90 disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar correo"}
          </button>
        </form>
      </div>
    </section>
  );
}

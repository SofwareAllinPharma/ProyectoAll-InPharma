import nodemailer from 'nodemailer';

const GMAIL_USER = process.env.SMTP_USER || 'softwareallinpharma@gmail.com';
const GMAIL_PASS = process.env.SMTP_PASS; // en .env sin espacios

export async function sendPasswordResetEmail(to: string, token: string) {
  // Log de dev: siempre imprime el token por consola
  console.log(`[EMAIL] Reset para ${to} | token: ${token}`);

  if (!GMAIL_PASS) {
    console.warn('[EMAIL] Falta SMTP_PASS (App Password de Gmail) en .env');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  });

  // Verificar credenciales/conexión (muestra mensajes claros)
  await transporter.verify();

  // (Opcional) link directo a la pantalla de reset en tu front
  const base = process.env.CLIENT_URL ?? 'http://localhost:5173';
  const link = `${base}/auth/reset?token=${encodeURIComponent(token)}&mail=${encodeURIComponent(to)}`;

  await transporter.sendMail({
    from: `"All-In Pharma" <${GMAIL_USER}>`,
    to,
    subject: 'Recuperar contraseña',
    text: `Usá este código para resetear tu contraseña: ${token}\n\nO hacé click en el enlace (válido 15 minutos):\n${link}`,
    html: `
      <div style="font-family:system-ui,Segoe UI,Arial,sans-serif">
        <p>Código: <b style="font-size:18px">${token}</b></p>
        <p><a href="${link}" style="display:inline-block;background:#5d5448;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">
          Restablecer contraseña
        </a></p>
        <p style="color:#666">Si no fuiste vos, ignorá este mensaje.</p>
      </div>
    `,
  });

  console.log('[EMAIL] enviado OK');
}

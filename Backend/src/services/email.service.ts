import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(to: string, token: string) {
  // Si aún no querés enviar mail real, dejá un log:
  console.log(`[EMAIL] Reset para ${to} con token: ${token}`);
  if (!process.env.SMTP_HOST) return;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Recuperar contraseña',
    text: `Usá este código/token para resetear tu contraseña: ${token}`,
  });
}  

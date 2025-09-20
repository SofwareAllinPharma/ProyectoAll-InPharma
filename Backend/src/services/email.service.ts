import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(to: string, token: string) {
  console.log(`[EMAIL] Reset para ${to} con token: ${token}`);
  if (!process.env.SMTP_HOST) return;

  //habria que definir las variables de entorno en el .env con los datos de tu proveedor SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  // La estructura del mail que vas a enviar, lo podes personalizar como quieras
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Recuperar contraseña',
    text: `Usá este código/token para resetear tu contraseña: ${token}`,
  });
}  

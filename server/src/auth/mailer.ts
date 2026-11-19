import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null | undefined;

function getTransporter() {
  if (transporter !== undefined) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    transporter = null;
    return transporter;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

/**
 * Sends the password-reset link by e-mail when SMTP_* is configured
 * (see server/ENV_SETUP.md). Without it, falls back to logging the link
 * server-side so the reset flow stays testable end-to-end.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const t = getTransporter();
  if (!t) {
    // eslint-disable-next-line no-console
    console.log(`[mailer] SMTP nao configurado - link de redefinicao para ${to}: ${resetUrl}`);
    return;
  }
  await t.sendMail({
    from: process.env.SMTP_FROM || "Cobra da Bola <no-reply@cobradabola.local>",
    to,
    subject: "Redefinicao de senha - Cobra da Bola",
    text: `Use o link abaixo para redefinir sua senha (valido por 30 minutos):\n\n${resetUrl}`,
    html: `<p>Use o link abaixo para redefinir sua senha (valido por 30 minutos):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
}

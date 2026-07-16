import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY ontbreekt in de omgevingsvariabelen.");
  return new Resend(apiKey);
}

export async function verstuurWachtwoordResetMail(email: string, resetUrl: string) {
  const resend = getResend();
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

  await resend.emails.send({
    from: `Telecombinatie Toolbox <${from}>`,
    to: email,
    subject: "Wachtwoord resetten — Telecombinatie Toolbox",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #840562;">Wachtwoord resetten</h2>
        <p>Je hebt een wachtwoordreset aangevraagd voor je account bij de Telecombinatie Toolbox.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #840562; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold;">
            Wachtwoord instellen
          </a>
        </p>
        <p>Deze link is 1 uur geldig. Heb je dit niet aangevraagd? Dan kun je deze e-mail negeren.</p>
      </div>
    `,
  });
}

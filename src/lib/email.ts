import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email verification link
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string
) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;

  try {
    await resend.emails.send({
      from: 'MARcrute <onboarding@resend.dev>', // Change this to your domain later
      to: email,
      subject: 'Vérifiez votre adresse email - MARcrute',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #0066cc; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Bienvenue sur MARcrute!</h1>
              <p>Merci de vous être inscrit. Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous:</p>
              <a href="${verificationUrl}" class="button">Vérifier mon email</a>
              <p>Ou copiez ce lien dans votre navigateur:</p>
              <p style="word-break: break-all;">${verificationUrl}</p>
              <p>Ce lien expirera dans 24 heures.</p>
              <div class="footer">
                <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
                <p>&copy; ${new Date().getFullYear()} MARcrute - Tous droits réservés</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
}

/**
 * Send password reset link
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

  try {
    await resend.emails.send({
      from: 'MARcrute <onboarding@resend.dev>', // Change this to your domain later
      to: email,
      subject: 'Réinitialisation de votre mot de passe - MARcrute',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #0066cc; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Réinitialisation de mot de passe</h1>
              <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous:</p>
              <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
              <p>Ou copiez ce lien dans votre navigateur:</p>
              <p style="word-break: break-all;">${resetUrl}</p>
              <p>Ce lien expirera dans 1 heure.</p>
              <div class="footer">
                <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
                <p>&copy; ${new Date().getFullYear()} MARcrute - Tous droits réservés</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}

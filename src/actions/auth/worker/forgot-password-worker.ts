"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function forgotPasswordAction(email: string) {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Aucun compte trouvé avec cet email" };
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    await transporter.sendMail({
      from: `"MARcrute" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: "Réinitialisation de votre mot de passe - MARcrute",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #F3F4F4; font-family: Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <tr>
                      <td style="background: linear-gradient(135deg, #061E29 0%, #1D546D 100%); padding: 30px; text-align: center;">
                        <h1 style="margin: 0; color: #F3F4F4; font-size: 26px;">MARcrute</h1>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #061E29; font-size: 22px;">Bonjour ${user.nomComplet || ""},</h2>
                        
                        <p style="margin: 0 0 15px 0; color: #1D546D; font-size: 16px; line-height: 1.6;">
                          Vous avez demandé à réinitialiser votre mot de passe sur <strong>MARcrute</strong>.
                        </p>
                        
                        <p style="margin: 0 0 25px 0; color: #1D546D; font-size: 16px; line-height: 1.6;">
                          Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :
                        </p>

                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="center" style="padding: 20px 0;">
                              <a href="${process.env.NEXTAUTH_URL}/worker/reset-password?token=${token}" 
                                style="display: inline-block; padding: 15px 35px; background-color: #5F9598; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                                Réinitialiser mon mot de passe
                              </a>
                            </td>
                          </tr>
                        </table>

                        <div style="background-color: #F3F4F4; border-left: 4px solid #5F9598; padding: 15px; margin-top: 25px; border-radius: 4px;">
                          <p style="margin: 0; color: #1D546D; font-size: 14px;">
                            <strong>Important :</strong> Ce lien expirera dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                          </p>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style="background-color: #F3F4F4; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0; color: #1D546D; font-size: 14px;">
                          © ${new Date().getFullYear()} MARcrute - Tous droits réservés
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    return { success: true, message: "Email de réinitialisation envoyé !" };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "Impossible d'envoyer l'email de réinitialisation" };
  }
}
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

export async function forgotPasswordEntrepriseAction(email: string) {
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
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #F3F4F4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F3F4F4; padding: 50px 20px;">
                <tr>
                    <td align="center">
                        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(6, 30, 41, 0.15);">
                            <!-- Header -->
                            <tr>
                                <td style="background-color: #5F9598; padding: 50px 40px; text-align: center;">
                                    <h1 style="margin: 0; color: #F3F4F4; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">MARcrute</h1>
                                    <p style="margin: 12px 0 0 0; color: #F3F4F4; font-size: 15px; font-weight: 500; opacity: 0.9;">Plateforme de Recrutement Professionnel</p>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 50px 40px;">
                                    <h2 style="margin: 0 0 24px 0; color: #061E29; font-size: 26px; font-weight: 700; text-align: center;">Réinitialisation de mot de passe</h2>
                                    
                                    <p style="margin: 0 0 18px 0; color: #1D546D; font-size: 16px; line-height: 1.7; text-align: center;">
                                        Bonjour <strong style="color: #061E29;">${user.nomComplet || ""}</strong>,
                                    </p>
                                    
                                    <p style="margin: 0 0 18px 0; color: #1D546D; font-size: 16px; line-height: 1.7; text-align: center;">
                                        Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte entreprise sur MARcrute.
                                    </p>
                                    
                                    <p style="margin: 0 0 32px 0; color: #1D546D; font-size: 16px; line-height: 1.7; text-align: center;">
                                        Pour définir un nouveau mot de passe, veuillez cliquer sur le bouton ci-dessous :
                                    </p>
                                    
                                    <!-- Button -->
                                    <table role="presentation" style="margin: 0 auto 32px auto; border-collapse: collapse;">
                                        <tr>
                                            <td style="border-radius: 8px; background-color: #5F9598; text-align: center; box-shadow: 0 4px 8px rgba(95, 149, 152, 0.3);">
                                                <a href="${process.env.NEXTAUTH_URL}/enterprise/reset-password?token=${token}" 
                                                   style="display: inline-block; padding: 16px 48px; color: #F3F4F4; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                                                    Réinitialiser mon mot de passe
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="margin: 0 0 32px 0; color: #5F9598; font-size: 14px; line-height: 1.6; text-align: center;">
                                        Ce lien est valable pendant <strong style="color: #1D546D;">1 heure</strong> pour des raisons de sécurité.
                                    </p>
                                    
                                    <!-- Divider -->
                                    <div style="margin: 32px 0; border-top: 2px solid #F3F4F4;"></div>
                                    
                                    <p style="margin: 0 0 14px 0; color: #5F9598; font-size: 14px; line-height: 1.6; text-align: center;">
                                        Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
                                    </p>
                                    
                                    <p style="margin: 0; padding: 14px; background-color: #F3F4F4; border-radius: 6px; word-break: break-all; text-align: center;">
                                        <a href="${process.env.NEXTAUTH_URL}/enterprise/reset-password?token=${token}" 
                                           style="color: #5F9598; text-decoration: none; font-size: 13px;">
                                            ${process.env.NEXTAUTH_URL}/enterprise/reset-password?token=${token}
                                        </a>
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Security Notice -->
                            <tr>
                                <td style="padding: 0 40px 40px 40px;">
                                    <div style="background-color: #FFF8E1; border-left: 4px solid #5F9598; padding: 18px; border-radius: 6px;">
                                        <p style="margin: 0; color: #061E29; font-size: 14px; line-height: 1.7;">
                                            <strong>⚠️ Vous n'avez pas demandé cette réinitialisation ?</strong><br>
                                            Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email et contactez-nous immédiatement. Votre mot de passe actuel reste inchangé.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #5F9598; padding: 35px 40px; text-align: center;">
                                    <p style="margin: 0 0 10px 0; color: #F3F4F4; font-size: 14px; font-weight: 500;">
                                        Cet email a été envoyé par <strong style="color: #F3F4F4;">MARcrute</strong>
                                    </p>
                                    <p style="margin: 0; color: #F3F4F4; font-size: 12px; opacity: 0.9;">
                                        © ${new Date().getFullYear()} MARcrute. Tous droits réservés.
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
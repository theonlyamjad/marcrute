"use server"

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
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

export async function signUpWorkerAction(
  firstname: string,
  lastname: string,
  email: string,
  password: string
) {
  try {
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Impossible de créer un compte avec ces informations" };
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.utilisateur.create({
        data: {
          email,
          hashMotDePasse: hashedPassword,
          nomComplet: `${firstname} ${lastname}`,
          role: "Travailleur",
          emailVerified: null,
        },
      });

      await tx.travailleur.create({
        data: {
          idUtilisateur: user.idUtilisateur,
          dateCreation: new Date(),
        },
      });

      return user;
    });

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
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
      subject: "Bienvenue sur MARcrute - Vérifiez votre email",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #F3F4F4; font-family: 'Segoe UI', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding: 50px 20px;">
                  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(6, 30, 41, 0.08);">
                    
                    <!-- Header avec icône -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #061E29 0%, #1D546D 100%); padding: 50px 30px; text-align: center; position: relative;">
                        <div style="width: 80px; height: 80px; background-color: #5F9598; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(95, 149, 152, 0.3);">
                          <span style="font-size: 40px; color: #ffffff;">✓</span>
                        </div>
                        <h1 style="margin: 0; color: #F3F4F4; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">MARcrute</h1>
                        <p style="margin: 10px 0 0 0; color: #5F9598; font-size: 14px; font-weight: 500;">Plateforme de Recrutement</p>
                      </td>
                    </tr>

                    <!-- Contenu principal -->
                    <tr>
                      <td style="padding: 50px 40px;">
                        <h2 style="margin: 0 0 15px 0; color: #061E29; font-size: 24px; font-weight: 700;">
                          Bienvenue ${firstname} ! 🎉
                        </h2>
                        
                        <p style="margin: 0 0 25px 0; color: #1D546D; font-size: 16px; line-height: 1.7;">
                          Nous sommes ravis de vous accueillir sur <strong style="color: #5F9598;">MARcrute</strong>. Vous êtes à un clic de commencer votre aventure professionnelle !
                        </p>

                        <!-- Étapes -->
                        <div style="background: linear-gradient(135deg, #F3F4F4 0%, #ffffff 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #5F9598;">
                          <p style="margin: 0 0 15px 0; color: #061E29; font-size: 15px; font-weight: 600;">
                            📋 Prochaines étapes :
                          </p>
                          <ul style="margin: 0; padding-left: 20px; color: #1D546D; font-size: 14px; line-height: 1.8;">
                            <li>Vérifiez votre adresse email</li>
                            <li>Complétez votre profil</li>
                            <li>Explorez les offres disponibles</li>
                          </ul>
                        </div>

                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="center" style="padding: 10px 0 30px 0;">
                              <a href="${process.env.NEXTAUTH_URL}/api/auth/worker/verify-email?token=${token}" 
                                 style="display: inline-block; padding: 18px 45px; background: linear-gradient(135deg, #5F9598 0%, #1D546D 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 15px rgba(95, 149, 152, 0.3); transition: all 0.3s ease;">
                                ✉️ Vérifier mon email
                              </a>
                            </td>
                          </tr>
                        </table>

                        <!-- Lien alternatif -->
                        <p style="margin: 0 0 10px 0; color: #1D546D; font-size: 13px; text-align: center;">
                          Le bouton ne fonctionne pas ?
                        </p>
                        <p style="margin: 0; text-align: center; word-break: break-all; font-size: 12px;">
                          <a href="${process.env.NEXTAUTH_URL}/api/auth/worker/verify-email?token=${token}" 
                             style="color: #5F9598; text-decoration: underline;">
                            ${process.env.NEXTAUTH_URL}/api/auth/worker/verify-email?token=${token}
                          </a>
                        </p>
                      </td>
                    </tr>

                    <!-- Zone d'information -->
                    <tr>
                      <td style="padding: 0 40px 40px 40px;">
                        <div style="background-color: #FFF9E6; border: 2px solid #FFD700; border-radius: 10px; padding: 20px; text-align: center;">
                          <p style="margin: 0 0 5px 0; color: #061E29; font-size: 14px; font-weight: 600;">
                            ⏰ Attention
                          </p>
                          <p style="margin: 0; color: #1D546D; font-size: 13px; line-height: 1.5;">
                            Ce lien expire dans <strong>24 heures</strong>. Si vous n'avez pas créé ce compte, ignorez cet email.
                          </p>
                        </div>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #F3F4F4 0%, #E8E9EA 100%); padding: 30px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0 0 8px 0; color: #1D546D; font-size: 14px; font-weight: 600;">
                          MARcrute
                        </p>
                        <p style="margin: 0 0 15px 0; color: #5F9598; font-size: 12px;">
                          Votre partenaire pour l'emploi au Maroc
                        </p>
                        <div style="margin-bottom: 15px;">
                          <a href="#" style="display: inline-block; margin: 0 8px; color: #5F9598; text-decoration: none; font-size: 20px;">📱</a>
                          <a href="#" style="display: inline-block; margin: 0 8px; color: #5F9598; text-decoration: none; font-size: 20px;">💼</a>
                          <a href="#" style="display: inline-block; margin: 0 8px; color: #5F9598; text-decoration: none; font-size: 20px;">🌐</a>
                        </div>
                        <p style="margin: 0; color: #999; font-size: 11px;">
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

    return { success: true, redirectTo: "/worker/dashboard" };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "Une erreur est survenue lors de l'inscription" };
  }
}
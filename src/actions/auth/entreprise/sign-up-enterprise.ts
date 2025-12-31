"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Config Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function signUpEnterpriseAction(
  companyName: string,
  email: string,
  password: string
) {
  try {
    // Vérifie si l'utilisateur existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Un compte avec cet email existe déjà" };
    }

    // Hash le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crée l'utilisateur avec email non vérifié
    await prisma.utilisateur.create({
      data: {
        email,
        hashMotDePasse: hashedPassword,
        nomComplet: companyName,
        role: "Institution",
        emailVerified: null,
      },
    });

    // Génère un token de vérification
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

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
  subject: "Confirmation de votre adresse email – MARcrute",
  html: `
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05); font-family:Arial, Helvetica, sans-serif;">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#1D546D; padding:24px 32px;">
              <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:600;">
                MARcrute
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin-top:0; color:#1D546D; font-size:20px;">
                Bienvenue ${companyName},
              </h2>

              <p style="font-size:15px; color:#333333; line-height:1.6;">
                Merci de vous être inscrit sur <strong>MARcrute</strong> en tant qu’entreprise.
                Afin d’activer votre compte et sécuriser votre accès, veuillez confirmer votre adresse email.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXTAUTH_URL}/api/auth/entreprise/verify-email?token=${token}"
                      style="
                        background-color:#5F9598;
                        color:#ffffff;
                        text-decoration:none;
                        padding:14px 28px;
                        font-size:15px;
                        font-weight:600;
                        border-radius:6px;
                        display:inline-block;
                      ">
                      Vérifier mon adresse email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px; color:#555555; line-height:1.6;">
                Ce lien est valable pendant <strong>24 heures</strong>.
                Si vous n’êtes pas à l’origine de cette inscription, vous pouvez ignorer cet email.
              </p>

              <p style="font-size:14px; color:#555555; margin-top:32px;">
                Cordialement,<br />
                <strong>L’équipe MARcrute</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f0f3f5; padding:20px 32px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#777777;">
                © ${new Date().getFullYear()} MARcrute. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  `,
});


    // Redirection vers la page de login entreprise
    return { success: true, redirectTo: "/enterprise/sign-in" };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "Une erreur est survenue lors de l'inscription" };
  }
}

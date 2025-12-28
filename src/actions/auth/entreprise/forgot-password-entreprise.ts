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
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #4CAF50;">Bonjour ${user.nomComplet || ""},</h2>
            <p>Vous avez demandé à réinitialiser votre mot de passe sur <strong>MARcrute</strong>.</p>
            <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
            <a href="${process.env.NEXTAUTH_URL}/enterprise/reset-password?token=${token}" 
                style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            Réinitialiser mon mot de passe
            </a>
            <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
        </div>
      `,
    });

    return { success: true, message: "Email de réinitialisation envoyé !" };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "Impossible d'envoyer l'email de réinitialisation" };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { signIn } from "@/app/api/auth/[...nextauth]/route";

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

    // Envoie l'email via Nodemailer
    await transporter.sendMail({
      from: `"MARcrute" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: "Confirmez votre email - MARcrute",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4CAF50;">Bienvenue sur MARcrute, ${companyName} !</h2>
          <p>Merci de vous être inscrit en tant qu'entreprise.</p>
          <p>Pour commencer, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
          <a href="${process.env.NEXTAUTH_URL}/api/auth/entreprise/verify-email?token=${token}" 
            style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            Vérifier mon email
          </a>
          <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
            Si vous n'avez pas créé de compte, ignorez cet email.
          </p>
        </div>
      `,
    });

    // Redirection vers la page de login entreprise
    return { success: true, redirectTo: "/enterprise/sign-in" };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "Une erreur est survenue lors de l'inscription" };
  }
}

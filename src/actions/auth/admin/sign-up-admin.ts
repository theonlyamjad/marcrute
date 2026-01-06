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

export async function signUpAdminAction(
  fullName: string,
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
    const newUser = await prisma.utilisateur.create({
      data: {
        email,
        hashMotDePasse: hashedPassword,
        nomComplet: fullName,
        role: "Admin",
        emailVerified: null,
      },
    });

    // Crée le profil administrateur
    await prisma.administrateur.create({
      data: {
        idUtilisateur: newUser.idUtilisateur,
        permissions: "all", // Permissions complètes par défaut
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

    // Envoie l'email de vérification
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/admin/verify-email?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Vérification de votre compte administrateur - MARcrute",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1D546D;">Bienvenue sur MARcrute</h1>
          <p>Bonjour ${fullName},</p>
          <p>Votre compte administrateur a été créé avec succès. Veuillez cliquer sur le lien ci-dessous pour vérifier votre email :</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1D546D; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Vérifier mon email
          </a>
          <p>Ce lien expirera dans 24 heures.</p>
          <p>Si vous n'avez pas créé ce compte, veuillez ignorer cet email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">© MARcrute - Plateforme de recrutement</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'inscription admin:", error);
    return {
      error: "Une erreur est survenue lors de la création du compte",
    };
  }
}


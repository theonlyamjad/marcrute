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

    await prisma.utilisateur.create({
      data: {
        email,
        hashMotDePasse: hashedPassword,
        nomComplet: `${firstname} ${lastname}`,
        role: "Travailleur",
        emailVerified: null,
      },
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
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Confirmez votre email - Marcrute",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Bienvenue sur Marcrute, ${firstname} !</h2>
        <p>Merci de vous être inscrit sur <strong>Marcrute</strong>.</p>
        <p>Pour commencer, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
        <a href="${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}" 
          style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Vérifier mon email
        </a>
        <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
          Si vous n'avez pas créé de compte sur Marcrute, ignorez cet email.
        </p>
      </div>
    `,
    });
    return { success: true, redirectTo: "/worker/dashboard" };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "Une erreur est survenue lors de l'inscription" };
  }
}
"use server"

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/app/api/auth/[...nextauth]/route";

export async function signUpEnterpriseAction(
  companyName: string,
  email: string,
  password: string
) {
  try {
    // Check if user already exists
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Un compte avec cet email existe déjà" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.utilisateur.create({
      data: {
        email,
        hashMotDePasse: hashedPassword,
        nomComplet: companyName,
        role: "Institution",
        emailVerified: null, // Will be verified via email
      },
    });

    // Auto sign-in after registration
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true, redirectTo: "/enterprise/dashboard" };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "Une erreur est survenue lors de l'inscription" };
  }
}
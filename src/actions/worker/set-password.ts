// src/actions/auth/worker/set-password.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import { z } from "zod";

const passwordSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export async function setPasswordForGoogleUser(password: string) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return { success: false, error: "Non authentifié" };
    }

    // Validate password
    const validation = passwordSchema.safeParse({ password });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    // Get user
    const user = await prisma.utilisateur.findUnique({
      where: { idUtilisateur: session.user.id },
    });

    if (!user) {
      return { success: false, error: "Utilisateur introuvable" };
    }

    // Check if user already has a password
    if (user.hashMotDePasse) {
      return {
        success: false,
        error: "Vous avez déjà un mot de passe défini",
      };
    }

    // Hash and save password
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.utilisateur.update({
      where: { idUtilisateur: session.user.id },
      data: { hashMotDePasse: hashedPassword },
    });

    return {
      success: true,
      message: "Mot de passe défini avec succès",
    };
  } catch (error) {
    console.error("Error setting password:", error);
    return {
      success: false,
      error: "Erreur lors de la définition du mot de passe",
    };
  }
}
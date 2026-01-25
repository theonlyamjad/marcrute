"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function createSuperAdmin(
  email: string,
  password: string,
  prenom: string,
  nom: string
) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Un compte avec cet email existe déjà" };
    }

    // Hash le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur et le superadmin en transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur
      const newUser = await tx.utilisateur.create({
        data: {
          email,
          prenom,
          nom,
          nomComplet: `${prenom} ${nom}`,
          role: "SuperAdmin",
          hashMotDePasse: hashedPassword,
          emailVerified: new Date(), // Auto-vérifier l'email pour les superadmin
        },
      });

      // Créer le superadmin
      const newSuperAdmin = await tx.superAdmin.create({
        data: {
          idUtilisateur: newUser.idUtilisateur,
        },
      });

      return { user: newUser, superAdmin: newSuperAdmin };
    });

    return {
      success: true,
      message: "SuperAdmin créé avec succès",
      data: {
        id: result.superAdmin.idSuperAdmin,
        email: result.user.email,
        name: result.user.nomComplet,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la création du superadmin:", error);
    return { error: "Erreur serveur lors de la création" };
  }
}
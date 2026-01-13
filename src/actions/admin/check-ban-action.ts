"use server";

import { checkUserBanStatus } from "@/actions/admin/bans";
import { prisma } from "@/lib/prisma";

// ========================================
// CHECK USER LOGIN WITH BAN STATUS
// ========================================

export async function checkUserLoginStatus(email: string) {
  try {
    // Find user by email
    const user = await prisma.utilisateur.findUnique({
      where: { email },
      select: {
        idUtilisateur: true,
        role: true,
        nomComplet: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Utilisateur introuvable",
      };
    }

    // Check ban status
    const banStatus = await checkUserBanStatus(user.idUtilisateur);

    if (banStatus.isBanned && banStatus.data) {
      return {
        success: false,
        isBanned: true,
        banInfo: {
          titre: banStatus.data.titre,
          description: banStatus.data.description,
          dateBan: banStatus.data.dateBan,
          dateExpiration: banStatus.data.dateExpiration,
          isPermanent: banStatus.data.isPermanent,
          administrateur: banStatus.data.administrateur,
        },
        error: "Votre compte a été suspendu",
      };
    }

    return {
      success: true,
      isBanned: false,
      user: {
        id: user.idUtilisateur,
        role: user.role,
        nomComplet: user.nomComplet,
      },
    };
  } catch (error) {
    console.error("Error checking login status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la vérification du compte",
    };
  }
}
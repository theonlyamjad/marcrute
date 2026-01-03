"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function checkOnboardingCompletion() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return { success: false, error: "Non authentifié" };
    }

    const user = await prisma.utilisateur.findUnique({
      where: { idUtilisateur: session.user.id },
    });

    if (!user) {
      return { success: false, error: "Utilisateur introuvable" };
    }

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.idUtilisateur },
      include: {
        utilisateur: true,
        ville: true,
        experiences: true,
        diplomes: true,
        specialites: true,
      },
    });

    if (!worker) {
      return { success: false, error: "Profil travailleur introuvable" };
    }

    // Check completion criteria
    const hasPassword = !!user.hashMotDePasse;
    const hasPhone = !!worker.utilisateur.telephone;
    const hasCity = !!worker.idVille;
    const hasExperience = worker.experiences.length > 0;
    const hasDiploma = worker.diplomes.length > 0;
    const hasSpecialty = worker.specialites.length > 0;

    const isGoogleUser = !hasPassword;

    // ✅ ONLY INCOMPLETE IF MISSING REQUIRED FIELDS
    const isComplete =
      hasPhone &&
      hasCity &&
      hasExperience &&
      hasDiploma &&
      hasSpecialty &&
      (hasPassword || !isGoogleUser); // Password only required for Google users

    console.log("🔍 Onboarding Check:", {
      hasPhone,
      hasCity,
      hasExperience,
      hasDiploma,
      hasSpecialty,
      hasPassword,
      isGoogleUser,
      isComplete,
    });

    return {
      success: true,
      data: {
        isComplete,
        isGoogleUser,
        needsPasswordSetup: isGoogleUser && !hasPassword,
        completion: {
          hasPassword,
          hasPhone,
          hasCity,
          hasExperience,
          hasDiploma,
          hasSpecialty,
        },
      },
    };
  } catch (error) {
    console.error("Error checking onboarding:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur",
    };
  }
}
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

    // ✅ UPDATED: Check if user has EVER completed initial onboarding
    // Once they complete onboarding once, they can manage CV freely
    const hasCompletedInitialOnboarding = 
      hasPassword &&
      hasPhone &&
      hasCity &&
      (hasExperience || hasDiploma || hasSpecialty); // At least started filling profile

    // For initial onboarding (strict check)
    const isFullyComplete =
      hasPassword &&
      hasPhone &&
      hasCity &&
      hasExperience &&
      hasDiploma &&
      hasSpecialty;

    console.log("🔍 Onboarding Check:", {
      hasPhone,
      hasCity,
      hasExperience,
      hasDiploma,
      hasSpecialty,
      hasPassword,
      isGoogleUser,
      hasCompletedInitialOnboarding,
      isFullyComplete,
    });

    return {
      success: true,
      data: {
        isComplete: hasCompletedInitialOnboarding, // ✅ Changed: Less strict after first completion
        isFullyComplete, // ✅ New: For dashboard warnings
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

/**
 * Strict check for features that require complete profile
 * Use this for mission applications, etc.
 */
export async function checkProfileComplete() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Non authentifié" };
    }

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: session.user.id },
      include: {
        experiences: true,
        diplomes: true,
        specialites: true,
      },
    });

    if (!worker) {
      return { success: false, error: "Profil introuvable" };
    }

    const isComplete =
      worker.experiences.length > 0 &&
      worker.diplomes.length > 0 &&
      worker.specialites.length > 0;

    return {
      success: true,
      data: {
        isComplete,
        missing: {
          experiences: worker.experiences.length === 0,
          diplomas: worker.diplomes.length === 0,
          specialties: worker.specialites.length === 0,
        },
      },
    };
  } catch (error) {
    console.error("Error checking profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur",
    };
  }
}
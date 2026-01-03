// src/actions/worker/profile.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/worker";
import { revalidatePath } from "next/cache";

/**
 * Get the current worker's profile with all related data
 */
export async function getWorkerProfile() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      include: {
        utilisateur: {
          select: {
            email: true,
            nomComplet: true,
            telephone: true,
            role: true,
            dateCreation: true,
          },
        },
        ville: {
          include: {
            region: true,
          },
        },
        specialites: {
          include: {
            categorie: true,
          },
          orderBy: {
            anneesExperience: "desc",
          },
        },
        experiences: {
          orderBy: {
            dateDebut: "desc",
          },
        },
        diplomes: {
          orderBy: {
            dateCreation: "desc",
          },
        },
        disponibilites: {
          where: {
            dateDisponible: {
              gte: new Date(),
            },
          },
          orderBy: {
            dateDisponible: "asc",
          },
        },
      },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    return { success: true, data: worker };
  } catch (error) {
    console.error("Error fetching worker profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération du profil",
    };
  }
}

/**
 * Update worker profile information
 */
export async function updateWorkerProfile(input: UpdateProfileInput) {
  try {
    const user = await requireRole("Travailleur");

    // Validate input
    const validatedData = updateProfileSchema.parse(input);

    // Get worker ID
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Update user data if provided
    if (validatedData.nomComplet || validatedData.telephone) {
      await prisma.utilisateur.update({
        where: { idUtilisateur: user.id },
        data: {
          ...(validatedData.nomComplet && { nomComplet: validatedData.nomComplet }),
          ...(validatedData.telephone && { telephone: validatedData.telephone }),
        },
      });
    }

    // Update worker data
    const updatedWorker = await prisma.travailleur.update({
      where: { idTravailleur: worker.idTravailleur },
      data: {
        ...(validatedData.idVille !== undefined && { idVille: validatedData.idVille }),
        ...(validatedData.biographie !== undefined && { biographie: validatedData.biographie }),
        ...(validatedData.anneesExperience !== undefined && {
          anneesExperience: validatedData.anneesExperience,
        }),
      },
      include: {
        utilisateur: true,
        ville: {
          include: {
            region: true,
          },
        },
      },
    });

    revalidatePath("/worker/profile");
    revalidatePath("/worker/dashboard");

    return { success: true, data: updatedWorker };
  } catch (error) {
    console.error("Error updating worker profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la mise à jour du profil",
    };
  }
}

/**
 * Calculate profile completeness percentage
 */
export async function getProfileCompleteness() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      include: {
        utilisateur: true,
        specialites: true,
        experiences: true,
        diplomes: true,
        disponibilites: true,
      },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    let completeness = 0;
    const totalFields = 10;

    // Basic info (40%)
    if (worker.utilisateur.nomComplet) completeness += 1;
    if (worker.utilisateur.telephone) completeness += 1;
    if (worker.idVille) completeness += 1;
    if (worker.biographie) completeness += 1;

    // Professional info (40%)
    if (worker.specialites.length > 0) completeness += 2;
    if (worker.experiences.length > 0) completeness += 2;

    // Additional info (20%)
    if (worker.diplomes.length > 0) completeness += 1;
    if (worker.disponibilites.length > 0) completeness += 1;

    const percentage = Math.round((completeness / totalFields) * 100);

    return { success: true, data: { completeness: percentage } };
  } catch (error) {
    console.error("Error calculating profile completeness:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors du calcul de complétude",
    };
  }
}

/**
 * Get all regions and cities for location selection
 */
export async function getRegionsWithCities() {
  try {
    const regions = await prisma.region.findMany({
      include: {
        villes: {
          orderBy: {
            nomVille: "asc",
          },
        },
      },
      orderBy: {
        nomRegion: "asc",
      },
    });

    return { success: true, data: regions };
  } catch (error) {
    console.error("Error fetching regions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des régions",
    };
  }
}

/**
 * Get worker statistics for dashboard
 */
export async function getWorkerStats() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Get application stats
    const applications = await prisma.candidature.groupBy({
      by: ["statut"],
      where: { idTravailleur: worker.idTravailleur },
      _count: true,
    });

    const totalApplications = applications.reduce((acc, curr) => acc + curr._count, 0);
    const pendingApplications = applications.find((a) => a.statut === "En attente")?._count || 0;
    const acceptedApplications = applications.find((a) => a.statut === "Acceptée")?._count || 0;
    const rejectedApplications = applications.find((a) => a.statut === "Refusée")?._count || 0;

    // Get evaluation stats
    const evaluations = await prisma.evaluation.aggregate({
      where: { idTravailleur: worker.idTravailleur },
      _avg: { note: true },
      _count: true,
    });

    // Get profile completeness
    const completenessResult = await getProfileCompleteness();
    const profileCompleteness = completenessResult.success ? completenessResult.data?.completeness || 0 : 0;

    const stats = {
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      averageRating: evaluations._avg.note || 0,
      totalEvaluations: evaluations._count,
      profileCompleteness,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching worker stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des statistiques",
    };
  }
}
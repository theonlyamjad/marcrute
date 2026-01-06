"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import {createApplicationSchema,cancelApplicationSchema,type CreateApplicationInput,type CancelApplicationInput,} from "@/lib/validations/worker";
import { revalidatePath } from "next/cache";

/**
 * Get all worker's applications
 */
export async function getWorkerApplications() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const applications = await prisma.candidature.findMany({
      where: { idTravailleur: worker.idTravailleur },
      include: {
        mission: {
          include: {
            institution: {
              include: {
                ville: {
                  include: {
                    region: true,
                  },
                },
              },
            },
            specialitesRequises: {
              include: {
                categorie: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateCandidature: "desc",
      },
    });

    return { success: true, data: applications };
  } catch (error) {
    console.error("Error fetching worker applications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des candidatures",
    };
  }
}

/**
 * Get applications by status
 */
export async function getApplicationsByStatus(statut: string) {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const applications = await prisma.candidature.findMany({
      where: {
        idTravailleur: worker.idTravailleur,
        statut,
      },
      include: {
        mission: {
          include: {
            institution: {
              include: {
                ville: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateCandidature: "desc",
      },
    });

    return { success: true, data: applications };
  } catch (error) {
    console.error("Error fetching applications by status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des candidatures",
    };
  }
}

/**
 * Create a new application for a mission
 */
export async function createApplication(input: CreateApplicationInput) {
  try {
    const user = await requireRole("Travailleur");

    // Validate input
    const validatedData = createApplicationSchema.parse(input);

    // Get worker ID
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Check if mission exists and is open
    const mission = await prisma.mission.findUnique({
      where: { idMission: validatedData.idMission },
    });

    if (!mission) {
      throw new Error("Mission introuvable");
    }

    if (mission.statut !== "Active") {
      throw new Error("Cette mission n'est plus ouverte aux candidatures");
    }

    // Check if worker already applied
    const existingApplication = await prisma.candidature.findFirst({
      where: {
        idTravailleur: worker.idTravailleur,
        idMission: validatedData.idMission,
      },
    });

    if (existingApplication) {
      throw new Error("Vous avez déjà postulé à cette mission");
    }

    // Create application
    const application = await prisma.candidature.create({
      data: {
        idTravailleur: worker.idTravailleur,
        idMission: validatedData.idMission,
        statut: "En attente",
      },
      include: {
        mission: {
          include: {
            institution: {
              include: {
                ville: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/worker/candidatures");
    revalidatePath("/worker/missions");
    revalidatePath(`/worker/missions/${validatedData.idMission}`);

    return { success: true, data: application };
  } catch (error) {
    console.error("Error creating application:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la création de la candidature",
    };
  }
}

/**
 * Cancel an application (only if pending)
 */
export async function cancelApplication(input: CancelApplicationInput) {
  try {
    const user = await requireRole("Travailleur");

    // Validate input
    const validatedData = cancelApplicationSchema.parse(input);

    // Get worker ID
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Check if application belongs to this worker
    const application = await prisma.candidature.findUnique({
      where: { idCandidature: validatedData.idCandidature },
    });

    if (!application) {
      throw new Error("Candidature introuvable");
    }

    if (application.idTravailleur !== worker.idTravailleur) {
      throw new Error("Vous n'êtes pas autorisé à annuler cette candidature");
    }

    if (application.statut !== "En attente") {
      throw new Error("Vous ne pouvez annuler que les candidatures en attente");
    }

    // Update application status to cancelled
    const updatedApplication = await prisma.candidature.update({
      where: { idCandidature: validatedData.idCandidature },
      data: {
        statut: "Annulée",
      },
      include: {
        mission: true,
      },
    });

    revalidatePath("/worker/candidatures");
    revalidatePath("/worker/missions");

    return { success: true, data: updatedApplication };
  } catch (error) {
    console.error("Error cancelling application:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'annulation de la candidature",
    };
  }
}

/**
 * Get application details by ID
 */
export async function getApplicationDetails(idCandidature: string) {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const application = await prisma.candidature.findUnique({
      where: { idCandidature },
      include: {
        mission: {
          include: {
            institution: {
              include: {
                utilisateur: {
                  select: {
                    nomComplet: true,
                    email: true,
                    telephone: true,
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
                },
              },
            },
            specialitesRequises: {
              include: {
                categorie: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new Error("Candidature introuvable");
    }

    if (application.idTravailleur !== worker.idTravailleur) {
      throw new Error("Vous n'êtes pas autorisé à consulter cette candidature");
    }

    return { success: true, data: application };
  } catch (error) {
    console.error("Error fetching application details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération de la candidature",
    };
  }
}

/**
 * Get application statistics
 */
export async function getApplicationStats() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const stats = await prisma.candidature.groupBy({
      by: ["statut"],
      where: { idTravailleur: worker.idTravailleur },
      _count: true,
    });

    const total = stats.reduce((acc, curr) => acc + curr._count, 0);
    const pending = stats.find((s) => s.statut === "En attente")?._count || 0;
    const accepted = stats.find((s) => s.statut === "Acceptée")?._count || 0;
    const rejected = stats.find((s) => s.statut === "Refusée")?._count || 0;
    const cancelled = stats.find((s) => s.statut === "Annulée")?._count || 0;

    const successRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    return {
      success: true,
      data: {
        total,
        pending,
        accepted,
        rejected,
        cancelled,
        successRate,
      },
    };
  } catch (error) {
    console.error("Error fetching application stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des statistiques",
    };
  }
}

/**
 * Get recent applications (last 7 days)
 */
export async function getRecentApplications() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const applications = await prisma.candidature.findMany({
      where: {
        idTravailleur: worker.idTravailleur,
        dateCandidature: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        mission: {
          include: {
            institution: {
              include: {
                ville: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateCandidature: "desc",
      },
    });

    return { success: true, data: applications };
  } catch (error) {
    console.error("Error fetching recent applications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des candidatures récentes",
    };
  }
}
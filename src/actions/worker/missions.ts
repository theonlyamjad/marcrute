// src/actions/worker/missions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { missionFiltersSchema, type MissionFilters } from "@/lib/validations/worker";

/**
 * Get all available missions (open status)
 */
export async function getAvailableMissions(filters?: MissionFilters) {
  try {
    const user = await requireRole("Travailleur");

    // Validate filters if provided
    const validatedFilters = filters ? missionFiltersSchema.parse(filters) : {};

    // Build where clause
    const where: any = {
      statut: "Ouverte",
      ...(validatedFilters.idVille && { institution: { idVille: validatedFilters.idVille } }),
      ...(validatedFilters.urgence && { urgence: validatedFilters.urgence }),
      ...(validatedFilters.dateDebut && {
        dateDebut: { gte: validatedFilters.dateDebut },
      }),
      ...(validatedFilters.dateFin && {
        dateFin: { lte: validatedFilters.dateFin },
      }),
    };

    // Add specialty filter if provided
    if (validatedFilters.idCategorie) {
      where.specialitesRequises = {
        some: {
          idCategorie: validatedFilters.idCategorie,
        },
      };
    }

    const missions = await prisma.mission.findMany({
      where,
      include: {
        institution: {
          include: {
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
        _count: {
          select: {
            candidatures: true,
          },
        },
      },
      orderBy: [
        { urgence: "desc" },
        { dateCreation: "desc" },
      ],
    });

    return { success: true, data: missions };
  } catch (error) {
    console.error("Error fetching available missions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des missions",
    };
  }
}

/**
 * Get mission details by ID
 */
export async function getMissionDetails(idMission: string) {
  try {
    await requireRole("Travailleur");

    const mission = await prisma.mission.findUnique({
      where: { idMission },
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
        _count: {
          select: {
            candidatures: true,
          },
        },
      },
    });

    if (!mission) {
      throw new Error("Mission introuvable");
    }

    return { success: true, data: mission };
  } catch (error) {
    console.error("Error fetching mission details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération de la mission",
    };
  }
}

/**
 * Get recommended missions based on worker's specialties
 */
export async function getRecommendedMissions() {
  try {
    const user = await requireRole("Travailleur");

    // Get worker with specialties
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      include: {
        specialites: true,
        ville: true,
      },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Get worker's specialty category IDs
    const workerSpecialtyIds = worker.specialites
      .map((s) => s.idCategorie)
      .filter((id): id is number => id !== null);

    if (workerSpecialtyIds.length === 0) {
      return { success: true, data: [] };
    }

    // Find missions matching worker's specialties
    const missions = await prisma.mission.findMany({
      where: {
        statut: "Ouverte",
        specialitesRequises: {
          some: {
            idCategorie: {
              in: workerSpecialtyIds,
            },
          },
        },
      },
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
        _count: {
          select: {
            candidatures: true,
          },
        },
      },
      orderBy: [
        { urgence: "desc" },
        { dateCreation: "desc" },
      ],
      take: 10, // Limit to 10 recommendations
    });

    return { success: true, data: missions };
  } catch (error) {
    console.error("Error fetching recommended missions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des missions recommandées",
    };
  }
}

/**
 * Get missions near worker's location
 */
export async function getNearbyMissions() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      include: {
        ville: {
          include: {
            region: true,
          },
        },
      },
    });

    if (!worker || !worker.ville) {
      return { success: true, data: [] };
    }

    // Find missions in the same region
    const missions = await prisma.mission.findMany({
      where: {
        statut: "Ouverte",
        institution: {
          ville: {
            idRegion: worker.ville.idRegion,
          },
        },
      },
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
        _count: {
          select: {
            candidatures: true,
          },
        },
      },
      orderBy: [
        { urgence: "desc" },
        { dateCreation: "desc" },
      ],
    });

    return { success: true, data: missions };
  } catch (error) {
    console.error("Error fetching nearby missions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des missions à proximité",
    };
  }
}

/**
 * Search missions by keyword
 */
export async function searchMissions(keyword: string) {
  try {
    await requireRole("Travailleur");

    if (!keyword || keyword.trim().length < 2) {
      throw new Error("Le mot-clé doit contenir au moins 2 caractères");
    }

    const missions = await prisma.mission.findMany({
      where: {
        statut: "Ouverte",
        OR: [
          { titre: { contains: keyword, mode: "insensitive" } },
          { description: { contains: keyword, mode: "insensitive" } },
          { institution: { nomInstitution: { contains: keyword, mode: "insensitive" } } },
        ],
      },
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
        _count: {
          select: {
            candidatures: true,
          },
        },
      },
      orderBy: [
        { urgence: "desc" },
        { dateCreation: "desc" },
      ],
    });

    return { success: true, data: missions };
  } catch (error) {
    console.error("Error searching missions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la recherche de missions",
    };
  }
}

/**
 * Check if worker has already applied to a mission
 */
export async function hasAppliedToMission(idMission: string) {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const application = await prisma.candidature.findFirst({
      where: {
        idTravailleur: worker.idTravailleur,
        idMission,
      },
    });

    return { success: true, data: { hasApplied: !!application } };
  } catch (error) {
    console.error("Error checking application status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la vérification de la candidature",
    };
  }
}
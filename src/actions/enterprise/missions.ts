"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get or create institution for the current user
 */
async function getOrCreateInstitution(userId: string) {
  let institution = await prisma.institution.findUnique({
    where: { idUtilisateur: userId },
    select: { idInstitution: true },
  });

  if (!institution) {
    // Créer l'institution si elle n'existe pas
    const user = await prisma.utilisateur.findUnique({
      where: { idUtilisateur: userId },
      select: { nomComplet: true },
    });

    institution = await prisma.institution.create({
      data: {
        idUtilisateur: userId,
        nomInstitution: user?.nomComplet || "Institution",
      },
      select: { idInstitution: true },
    });
  }

  return institution;
}
  
// ========================================
// VALIDATION SCHEMAS
// ========================================

const specialiteRequiseSchema = z.object({
  specialiteRequise: z.string().min(1, "La spécialité est requise"),
  anneesExperienceMin: z.number().int().min(0).optional().nullable(),
  idCategorie: z.number().int().optional().nullable(),
  niveauRequis: z.string().optional().nullable(),
  estObligatoire: z.boolean().optional().default(true),
});

const createMissionSchema = z
  .object({
    titre: z.string().min(1, "Le titre est requis").max(200),
    description: z.string().max(2000).optional().nullable(),
    typePublic: z.string().optional().nullable(),
    dateDebut: z.date().optional().nullable(),
    dateFin: z.date().optional().nullable(),
    urgence: z
      .enum(["Normale", "Haute", "Urgente"])
      .optional()
      .default("Normale"),
    statut: z
      .enum(["Brouillon", "Active", "Terminée", "Annulée"])
      .default("Brouillon"),
    specialitesRequises: z
      .array(specialiteRequiseSchema)
      .optional()
      .default([]),
  })
  .refine(
    (data) => {
      if (data.dateDebut && data.dateFin) {
        return data.dateFin >= data.dateDebut;
      }
      return true;
    },
    {
      message: "La date de fin doit être après la date de début",
      path: ["dateFin"],
    }
  );

const updateMissionSchema = createMissionSchema.partial().extend({
  idMission: z.string().cuid(),
});

export type CreateMissionInput = z.infer<typeof createMissionSchema>;
export type UpdateMissionInput = z.infer<typeof updateMissionSchema>;
export type SpecialiteRequiseInput = z.infer<typeof specialiteRequiseSchema>;

// ========================================
// GET SPECIALTY CATEGORIES
// ========================================

export async function getSpecialtyCategories() {
  try {
    const categories = await prisma.categorieSpecialite.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching specialty categories:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des catégories",
    };
  }
}

// ========================================
// GET MISSIONS
// ========================================

export async function getMissions(filters?: {
  statut?: string;
  urgence?: string;
  typePublic?: string;
  search?: string;
}) {
  try {
    const user = await requireRole("Institution");

    // Récupérer ou créer l'institution
    const institution = await getOrCreateInstitution(user.id);

    // Construire les filtres
    const where: {
      idInstitution: string;
      statut?: string;
      urgence?: string;
      typePublic?: string;
      OR?: Array<
        | { titre: { contains: string; mode: "insensitive" } }
        | { description: { contains: string; mode: "insensitive" } }
      >;
    } = {
      idInstitution: institution.idInstitution,
    };

    if (filters?.statut && filters.statut !== "all") {
      where.statut = filters.statut;
    }

    if (filters?.urgence && filters.urgence !== "all") {
      where.urgence = filters.urgence;
    }

    if (filters?.typePublic && filters.typePublic !== "all") {
      where.typePublic = filters.typePublic;
    }

    if (filters?.search) {
      where.OR = [
        { titre: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const missions = await prisma.mission.findMany({
      where,
      include: {
        specialitesRequises: {
          include: {
            categorie: true,
          },
        },
        candidatures: {
          select: {
            idCandidature: true,
          },
        },
      },
      orderBy: {
        dateCreation: "desc",
      },
    });

    // Transformer les données pour correspondre au format attendu par le frontend
    const formattedMissions = missions.map((mission) => ({
      id: mission.idMission,
      titre: mission.titre,
      description: mission.description || "",
      typePublic: mission.typePublic || "",
      dateDebut: mission.dateDebut
        ? mission.dateDebut.toISOString().split("T")[0]
        : "",
      dateFin: mission.dateFin
        ? mission.dateFin.toISOString().split("T")[0]
        : "",
      urgence: (mission.urgence || "Normale") as
        | "Normale"
        | "Haute"
        | "Urgente",
      statut: mission.statut as "Brouillon" | "Active" | "Terminée" | "Annulée",
      specialitesRequises: mission.specialitesRequises.map((spec) => ({
        specialiteRequise: spec.specialiteRequise,
        anneesExperienceMin: spec.anneesExperienceMin || 0,
      })),
      nombreCandidatures: mission.candidatures.length,
      dateCreation: mission.dateCreation.toISOString().split("T")[0],
    }));

    return { success: true, data: formattedMissions };
  } catch (error) {
    console.error("Error fetching missions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des missions",
    };
  }
}

// ========================================
// GET SINGLE MISSION
// ========================================

export async function getMission(idMission: string) {
  try {
    const user = await requireRole("Institution");

    const institution = await getOrCreateInstitution(user.id);

    const mission = await prisma.mission.findFirst({
      where: {
        idMission,
        idInstitution: institution.idInstitution,
      },
      include: {
        specialitesRequises: {
          include: {
            categorie: true,
          },
        },
        candidatures: {
          select: {
            idCandidature: true,
          },
        },
      },
    });

    if (!mission) {
      throw new Error("Mission introuvable");
    }

    const formattedMission = {
      id: mission.idMission,
      titre: mission.titre,
      description: mission.description || "",
      typePublic: mission.typePublic || "",
      dateDebut: mission.dateDebut
        ? mission.dateDebut.toISOString().split("T")[0]
        : "",
      dateFin: mission.dateFin
        ? mission.dateFin.toISOString().split("T")[0]
        : "",
      urgence: (mission.urgence || "Normale") as
        | "Normale"
        | "Haute"
        | "Urgente",
      statut: mission.statut as "Brouillon" | "Active" | "Terminée" | "Annulée",
      specialitesRequises: mission.specialitesRequises.map((spec) => ({
        specialiteRequise: spec.specialiteRequise,
        anneesExperienceMin: spec.anneesExperienceMin || 0,
      })),
      nombreCandidatures: mission.candidatures.length,
      dateCreation: mission.dateCreation.toISOString().split("T")[0],
    };

    return { success: true, data: formattedMission };
  } catch (error) {
    console.error("Error fetching mission:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération de la mission",
    };
  }
}

// ========================================
// CREATE MISSION
// ========================================

export async function createMission(input: CreateMissionInput) {
  try {
    const user = await requireRole("Institution");

    // Valider les données
    const validatedData = createMissionSchema.parse(input);

    // Récupérer ou créer l'institution
    const institution = await getOrCreateInstitution(user.id);

    // Vérifier que le profil de l'institution est complet
    const { isInstitutionProfileComplete } = await import("./settings");
    const profileCheck = await isInstitutionProfileComplete();
    
    if (!profileCheck.success || !profileCheck.data?.isComplete) {
      return {
        success: false,
        error: "Veuillez compléter votre profil avant de créer une mission. Rendez-vous dans les paramètres pour compléter les informations manquantes.",
      };
    }

    // Créer la mission avec les spécialités requises
    const mission = await prisma.mission.create({
      data: {
        idInstitution: institution.idInstitution,
        titre: validatedData.titre,
        description: validatedData.description,
        typePublic: validatedData.typePublic,
        dateDebut: validatedData.dateDebut || null,
        dateFin: validatedData.dateFin || null,
        urgence: validatedData.urgence,
        statut: validatedData.statut,
        specialitesRequises: {
          create:
            validatedData.specialitesRequises?.map((spec) => ({
              specialiteRequise: spec.specialiteRequise,
              anneesExperienceMin: spec.anneesExperienceMin,
              idCategorie: spec.idCategorie,
              niveauRequis: spec.niveauRequis,
              estObligatoire: spec.estObligatoire ?? true,
            })) || [],
        },
      },
      include: {
        specialitesRequises: true,
      },
    });

    revalidatePath("/enterprise/missions");
    revalidatePath("/enterprise/dashboard");

    return { success: true, data: { id: mission.idMission } };
  } catch (error) {
    console.error("Error creating mission:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de la mission",
    };
  }
}

// ========================================
// UPDATE MISSION
// ========================================

export async function updateMission(input: UpdateMissionInput) {
  try {
    const user = await requireRole("Institution");

    // Valider les données
    const validatedData = updateMissionSchema.parse(input);

    // Récupérer ou créer l'institution
    const institution = await getOrCreateInstitution(user.id);

    // Vérifier que la mission appartient à l'institution
    const existingMission = await prisma.mission.findFirst({
      where: {
        idMission: validatedData.idMission,
        idInstitution: institution.idInstitution,
      },
    });

    if (!existingMission) {
      throw new Error("Mission introuvable ou accès non autorisé");
    }

    // Préparer les données de mise à jour
    const updateData: {
      titre?: string;
      description?: string | null;
      typePublic?: string | null;
      dateDebut?: Date | null;
      dateFin?: Date | null;
      urgence?: string;
      statut?: string;
      specialitesRequises?: {
        create: Array<{
          specialiteRequise: string;
          anneesExperienceMin: number | null;
          idCategorie: number | null;
          niveauRequis: string | null;
          estObligatoire: boolean;
        }>;
      };
    } = {};
    if (validatedData.titre !== undefined)
      updateData.titre = validatedData.titre;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.typePublic !== undefined)
      updateData.typePublic = validatedData.typePublic;
    if (validatedData.dateDebut !== undefined)
      updateData.dateDebut = validatedData.dateDebut;
    if (validatedData.dateFin !== undefined)
      updateData.dateFin = validatedData.dateFin;
    if (validatedData.urgence !== undefined)
      updateData.urgence = validatedData.urgence;
    if (validatedData.statut !== undefined)
      updateData.statut = validatedData.statut;

    // Mettre à jour les spécialités requises si fournies
    if (validatedData.specialitesRequises !== undefined) {
      // Supprimer les anciennes spécialités
      await prisma.specialiteRequise.deleteMany({
        where: { idMission: validatedData.idMission },
      });

      // Créer les nouvelles spécialités
      if (validatedData.specialitesRequises.length > 0) {
        updateData.specialitesRequises = {
          create: validatedData.specialitesRequises.map((spec) => ({
            specialiteRequise: spec.specialiteRequise,
            anneesExperienceMin: spec.anneesExperienceMin ?? null,
            idCategorie: spec.idCategorie ?? null,
            niveauRequis: spec.niveauRequis ?? null,
            estObligatoire: spec.estObligatoire ?? true,
          })),
        };
      }
    }

    // Mettre à jour la mission
    const mission = await prisma.mission.update({
      where: { idMission: validatedData.idMission },
      data: updateData,
      include: {
        specialitesRequises: true,
      },
    });

    revalidatePath("/enterprise/missions");
    revalidatePath("/enterprise/dashboard");

    return { success: true, data: { id: mission.idMission } };
  } catch (error) {
    console.error("Error updating mission:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de la mission",
    };
  }
}

// ========================================
// DELETE MISSION
// ========================================

export async function deleteMission(idMission: string) {
  try {
    const user = await requireRole("Institution");

    // Récupérer ou créer l'institution
    const institution = await getOrCreateInstitution(user.id);

    // Vérifier que la mission appartient à l'institution
    const mission = await prisma.mission.findFirst({
      where: {
        idMission,
        idInstitution: institution.idInstitution,
      },
    });

    if (!mission) {
      throw new Error("Mission introuvable ou accès non autorisé");
    }

    // Supprimer la mission (les spécialités requises et candidatures seront supprimées en cascade)
    await prisma.mission.delete({
      where: { idMission },
    });

    revalidatePath("/enterprise/missions");
    revalidatePath("/enterprise/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting mission:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de la mission",
    };
  }
}

// ========================================
// GET MISSION CANDIDATURES
// ========================================

export async function getMissionCandidatures(idMission: string) {
  try {
    const user = await requireRole("Institution");

    // Récupérer ou créer l'institution
    const institution = await getOrCreateInstitution(user.id);

    // Vérifier que la mission appartient à l'institution
    const mission = await prisma.mission.findFirst({
      where: {
        idMission,
        idInstitution: institution.idInstitution,
      },
    });

    if (!mission) {
      throw new Error("Mission introuvable ou accès non autorisé");
    }

    // Récupérer les candidatures
    const candidatures = await prisma.candidature.findMany({
      where: { idMission },
      include: {
        travailleur: {
          include: {
            utilisateur: {
              select: {
                nomComplet: true,
                email: true,
                telephone: true,
              },
            },
            specialites: {
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

    return { success: true, data: candidatures };
  } catch (error) {
    console.error("Error fetching mission candidatures:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des candidatures",
    };
  }
}

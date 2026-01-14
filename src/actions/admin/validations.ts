"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ========================================
// VALIDATION SCHEMAS
// ========================================

const verifyDiplomaSchema = z.object({
  idDiplome: z.string(),
  statut: z.enum(["Vérifié", "Rejeté"]),
  notes: z.string().optional(),
});

// ========================================
// GET ALL DIPLOMAS FOR VALIDATION
// ========================================

export async function getAllDiplomesForValidation(filters?: {
  statut?: string;
  regionId?: string;
  villeId?: string;
  specialiteId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await requireRole("Admin");

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by diploma status - FIXED to handle both null and "En attente" string
    if (filters?.statut === "En attente") {
      where.OR = [
        { statut: null },
        { statut: "En attente" }
      ];
    } else if (filters?.statut === "Vérifié") {
      where.statut = "Vérifié";
    } else if (filters?.statut === "Rejeté") {
      where.statut = "Rejeté";
    }

    // Filter by worker's ville or specialite
    const travailleurWhere: any = {};

    if (filters?.villeId) {
      travailleurWhere.idVille = filters.villeId;
    }

    // For region filter, we need to check ville's region
    if (filters?.regionId && !filters?.villeId) {
      travailleurWhere.ville = {
        idRegion: filters.regionId,
      };
    }

    if (filters?.specialiteId) {
      travailleurWhere.specialites = {
        some: {
          idSpecialite: filters.specialiteId,
        },
      };
    }

    // Search by worker name
    if (filters?.search) {
      travailleurWhere.utilisateur = {
        nomComplet: {
          contains: filters.search,
          mode: "insensitive" as const,
        },
      };
    }

    if (Object.keys(travailleurWhere).length > 0) {
      where.travailleur = travailleurWhere;
    }

    const [diplomes, total] = await Promise.all([
      prisma.diplome.findMany({
        where,
        include: {
          travailleur: {
            include: {
              utilisateur: {
                select: {
                  nomComplet: true,
                  email: true,
                },
              },
              ville: {
                include: {
                  region: {
                    select: {
                      nomRegion: true,
                    },
                  },
                },
              },
              specialites: {
                include: {
                  categorie: {
                    select: {
                      name: true,
                    },
                  },
                },
                take: 3,
              },
            },
          },
        },
        orderBy: {
          dateCreation: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.diplome.count({ where }),
    ]);

    const formatted = diplomes.map((d) => ({
      idDiplome: d.idDiplome,
      nomDiplome: d.nomDiplome,
      nomInstitution: d.nomInstitution,
      cheminFichier: d.cheminFichier,
      statut: d.statut || "En attente",
      dateCreation: d.dateCreation,
      dateVerification: d.dateVerification,
      travailleur: {
        nom: d.travailleur.utilisateur.nomComplet || "Inconnu",
        email: d.travailleur.utilisateur.email,
        region: d.travailleur.ville?.region?.nomRegion || "Non spécifiée",
        ville: d.travailleur.ville?.nomVille || "Non spécifiée",
        specialites: d.travailleur.specialites.map((s) => ({
          nom: s.nomSpecialite,
          categorie: s.categorie?.name || "Autre",
        })),
      },
    }));

    return {
      success: true,
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching diplomas:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des diplômes",
    };
  }
}

// ========================================
// GET FILTER OPTIONS (Regions, Cities, Specialties)
// ========================================

export async function getFilterOptions() {
  try {
    await requireRole("Admin");

    const [regions, categories] = await Promise.all([
      prisma.region.findMany({
        select: {
          idRegion: true,
          nomRegion: true,
        },
        orderBy: {
          nomRegion: "asc",
        },
      }),
      prisma.categorieSpecialite.findMany({
        include: {
          specialitesTravailleur: {
            select: {
              idSpecialite: true,
              nomSpecialite: true,
            },
            distinct: ['nomSpecialite'],
            orderBy: {
              nomSpecialite: "asc",
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

    // Format categories with their specialties
    const formattedCategories = categories.map((cat) => ({
      idCategorieSpecialite: cat.id,
      nomCategorie: cat.name,
      specialites: cat.specialitesTravailleur,
    }));

    return {
      success: true,
      data: {
        regions,
        specialites: formattedCategories,
      },
    };
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des options de filtrage",
    };
  }
}

// ========================================
// GET CITIES BY REGION
// ========================================

export async function getCitiesByRegion(regionId: string) {
  try {
    await requireRole("Admin");

    const villes = await prisma.ville.findMany({
      where: {
        idRegion: regionId,
      },
      select: {
        idVille: true,
        nomVille: true,
      },
      orderBy: {
        nomVille: "asc",
      },
    });

    return {
      success: true,
      data: villes,
    };
  } catch (error) {
    console.error("Error fetching cities:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des villes",
    };
  }
}

// ========================================
// VERIFY DIPLOMA (WITH RE-VERIFICATION PREVENTION)
// ========================================

export async function verifyDiploma(
  input: z.infer<typeof verifyDiplomaSchema>
) {
  try {
    const user = await requireRole("Admin");

    const validated = verifyDiplomaSchema.parse(input);

    // Get the diploma
    const diplome = await prisma.diplome.findUnique({
      where: { idDiplome: validated.idDiplome },
      include: {
        travailleur: {
          include: {
            utilisateur: true,
          },
        },
      },
    });

    if (!diplome) {
      return {
        success: false,
        error: "Diplôme introuvable",
      };
    }

    // ✅ PREVENT RE-VERIFICATION - Check for both null and "En attente"
    if (diplome.statut && diplome.statut !== "En attente" && diplome.statut !== null) {
      return {
        success: false,
        error: `Ce diplôme a déjà été ${diplome.statut.toLowerCase()}`,
      };
    }

    // Update diploma status
    await prisma.diplome.update({
      where: { idDiplome: validated.idDiplome },
      data: {
        statut: validated.statut,
        dateVerification: new Date(),
      },
    });

    // Get admin ID
    const admin = await prisma.administrateur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idAdministrateur: true },
    });

    if (admin) {
      // Create or update validation record
      const existingValidation = await prisma.validation.findFirst({
        where: {
          idDiplome: validated.idDiplome,
          typeValidation: "Diplôme",
        },
      });

      if (existingValidation) {
        await prisma.validation.update({
          where: { idValidation: existingValidation.idValidation },
          data: {
            statut: validated.statut === "Vérifié" ? "Approuvée" : "Rejetée",
            notes: validated.notes,
          },
        });
      } else {
        await prisma.validation.create({
          data: {
            idAdministrateur: admin.idAdministrateur,
            idTravailleur: diplome.idTravailleur,
            idDiplome: validated.idDiplome,
            typeValidation: "Diplôme",
            statut: validated.statut === "Vérifié" ? "Approuvée" : "Rejetée",
            notes: validated.notes,
          },
        });
      }
    }

    revalidatePath("/admin/validations");
    return { success: true };
  } catch (error) {
    console.error("Error verifying diploma:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la vérification du diplôme",
    };
  }
}
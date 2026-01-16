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

export async function getAllDiplomesForValidation({
  page = 1,
  limit = 10,
  search = "",
  status = "all",
  regionId = "all",
  specialtyId = "all",
  villeId = "all", // 1. Added villeId to parameters
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  regionId?: string;
  specialtyId?: string;
  villeId?: string; // 2. Added type definition
}) {
  try {
    await requireRole("Admin");

    const skip = (page - 1) * limit;

    // Build the Where Clause
    const where: any = {};

    // Filter by Status
    if (status !== "all") {
      where.statut = status;
    }

    // Initialize travailleur filter object if it doesn't exist
    if (!where.travailleur) where.travailleur = {};

    // Filter by Search (Worker Name)
    if (search) {
      where.travailleur.utilisateur = {
        nomComplet: { contains: search, mode: "insensitive" },
      };
    }

    // Filter by Region (Worker -> Ville -> Region)
    if (regionId !== "all") {
      where.travailleur.ville = {
        ...where.travailleur.ville,
        idRegion: regionId,
      };
    }

    // 3. THE FIX: Filter by City (idVille)
    if (villeId !== "all") {
      where.travailleur.ville = {
        ...where.travailleur.ville,
        idVille: villeId, // Directly filter by city ID
      };
    }

    // Filter by Specialty Category
    if (specialtyId !== "all") {
      where.travailleur.specialites = {
        some: {
          idCategorie: parseInt(specialtyId),
        },
      };
    }

    // Execute Query
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
              specialites: {
                include: {
                  categorie: true,
                },
              },
              ville: {
                include: {
                  region: true,
                },
              },
            },
          },
        },
        orderBy: { dateCreation: "desc" },
        skip,
        take: limit,
      }),
      prisma.diplome.count({ where }),
    ]);

    return {
      success: true,
      data: diplomes,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { success: false, error: "Erreur lors du chargement des données" };
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
        select: { idRegion: true, nomRegion: true },
        orderBy: { nomRegion: "asc" },
      }),
      // Querying the CategorieSpecialite table directly
      prisma.categorieSpecialite.findMany({
        select: {
          id: true,    // This is the primary key in your schema
          name: true,  // This is the VarChar(100) name in your schema
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      success: true,
      data: {
        regions,
        // We map 'id' to 'idSpecialite' so the frontend filter logic 
        // doesn't need to change how it sends the ID to the search
        specialites: categories.map(cat => ({
          idSpecialite: cat.id.toString(), 
          nomSpecialite: cat.name,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Erreur" };
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
"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ========================================
// VALIDATION SCHEMAS
// ========================================

const createValidationSchema = z.object({
  idTravailleur: z.string().optional(),
  idInstitution: z.string().optional(),
  idMission: z.string().optional(),
  typeValidation: z.string(),
  statut: z.enum(["En attente", "Approuvée", "Rejetée"]),
  notes: z.string().optional(),
});

const updateValidationSchema = z.object({
  idValidation: z.string(),
  statut: z.enum(["En attente", "Approuvée", "Rejetée"]),
  notes: z.string().optional(),
});

// ========================================
// GET ALL VALIDATIONS
// ========================================

export async function getAllValidations(filters?: {
  type?: string;
  statut?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await requireRole("Admin");

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters?.type) {
      where.typeValidation = filters.type;
    }

    if (filters?.statut) {
      where.statut = filters.statut;
    }

    const [validations, total] = await Promise.all([
      prisma.validation.findMany({
        where,
        include: {
          administrateur: {
            include: {
              utilisateur: {
                select: {
                  nomComplet: true,
                  email: true,
                },
              },
            },
          },
          travailleur: {
            include: {
              utilisateur: {
                select: {
                  nomComplet: true,
                  email: true,
                },
              },
            },
          },
          institution: {
            select: {
              nomInstitution: true,
            },
          },
          mission: {
            select: {
              titre: true,
            },
          },
        },
        orderBy: {
          dateCreation: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.validation.count({ where }),
    ]);

    const formatted = validations.map((v) => ({
      id: v.idValidation,
      type: v.typeValidation,
      statut: v.statut,
      concerne: v.travailleur?.utilisateur.nomComplet || 
                v.institution?.nomInstitution || 
                v.mission?.titre || "Inconnu",
      administrateur: v.administrateur.utilisateur.nomComplet || "Admin",
      date: v.dateCreation.toISOString().split("T")[0],
      notes: v.notes,
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
    console.error("Error fetching validations:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des validations",
    };
  }
}

// ========================================
// GET VALIDATION BY ID
// ========================================

export async function getValidationById(idValidation: string) {
  try {
    await requireRole("Admin");

    const validation = await prisma.validation.findUnique({
      where: { idValidation },
      include: {
        administrateur: {
          include: {
            utilisateur: true,
          },
        },
        travailleur: {
          include: {
            utilisateur: true,
            specialites: {
              include: {
                categorie: true,
              },
            },
          },
        },
        institution: true,
        mission: true,
      },
    });

    if (!validation) {
      return {
        success: false,
        error: "Validation introuvable",
      };
    }

    return {
      success: true,
      data: validation,
    };
  } catch (error) {
    console.error("Error fetching validation:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération de la validation",
    };
  }
}

// ========================================
// CREATE VALIDATION
// ========================================

export async function createValidation(
  input: z.infer<typeof createValidationSchema>
) {
  try {
    const user = await requireRole("Admin");

    // Get admin ID
    const admin = await prisma.administrateur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idAdministrateur: true },
    });

    if (!admin) {
      return {
        success: false,
        error: "Administrateur introuvable",
      };
    }

    const validated = createValidationSchema.parse(input);

    await prisma.validation.create({
      data: {
        idAdministrateur: admin.idAdministrateur,
        idTravailleur: validated.idTravailleur,
        idInstitution: validated.idInstitution,
        idMission: validated.idMission,
        typeValidation: validated.typeValidation,
        statut: validated.statut,
        notes: validated.notes,
      },
    });

    revalidatePath("/admin/validations");
    return { success: true };
  } catch (error) {
    console.error("Error creating validation:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de la validation",
    };
  }
}

// ========================================
// UPDATE VALIDATION
// ========================================

export async function updateValidation(
  input: z.infer<typeof updateValidationSchema>
) {
  try {
    await requireRole("Admin");

    const validated = updateValidationSchema.parse(input);

    await prisma.validation.update({
      where: { idValidation: validated.idValidation },
      data: {
        statut: validated.statut,
        notes: validated.notes,
      },
    });

    revalidatePath("/admin/validations");
    return { success: true };
  } catch (error) {
    console.error("Error updating validation:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de la validation",
    };
  }
}

// ========================================
// DELETE VALIDATION
// ========================================

export async function deleteValidation(idValidation: string) {
  try {
    await requireRole("Admin");

    await prisma.validation.delete({
      where: { idValidation },
    });

    revalidatePath("/admin/validations");
    return { success: true };
  } catch (error) {
    console.error("Error deleting validation:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de la validation",
    };
  }
}


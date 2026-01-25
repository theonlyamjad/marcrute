"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ========================================
// VALIDATION SCHEMAS
// ========================================

const updateSignalementSchema = z.object({
  idSignalement: z.string(),
  statut: z.enum(["En attente", "En cours", "Résolu"]),
  reponseAdmin: z.string().optional(),
});

// ========================================
// GET ALL SIGNALEMENTS
// ========================================

export async function getAllSignalements(filters?: {
  statut?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await requireRole("Administrateur");

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters?.statut) {
      where.statut = filters.statut;
    }

    const [signalements, total] = await Promise.all([
      prisma.signalement.findMany({
        where,
        include: {
          administrateur: {
            include: {
              utilisateur: {
                select: {
                  nomComplet: true,
                },
              },
            },
          },
          travailleurConcerne: {
            include: {
              utilisateur: {
                select: {
                  nomComplet: true,
                  email: true,
                },
              },
            },
          },
          institutionConcerne: {
            select: {
              nomInstitution: true,
            },
          },
          travailleurEmetteur: {
            include: {
              utilisateur: {
                select: {
                  nomComplet: true,
                  email: true,
                },
              },
            },
          },
          institutionEmetteur: {
            select: {
              nomInstitution: true,
            },
          },
        },
        orderBy: {
          dateSignalement: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.signalement.count({ where }),
    ]);

    const formatted = signalements.map((s) => ({
      id: s.idSignalement,
      motif: s.motif,
      description: s.description,
      emetteur: s.travailleurEmetteur?.utilisateur.nomComplet || 
                s.institutionEmetteur?.nomInstitution || "Inconnu",
      emailEmetteur: s.travailleurEmetteur?.utilisateur.email || "",
      concerne: s.travailleurConcerne?.utilisateur.nomComplet || 
                s.institutionConcerne?.nomInstitution || "Inconnu",
      emailConcerne: s.travailleurConcerne?.utilisateur.email || "",
      date: s.dateSignalement.toISOString().split("T")[0],
      statut: s.statut,
      reponseAdmin: s.reponseAdmin,
      dateTraitement: s.dateTraitement
        ? s.dateTraitement.toISOString().split("T")[0]
        : null,
      administrateur: s.administrateur?.utilisateur.nomComplet,
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
    console.error("Error fetching signalements:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des signalements",
    };
  }
}

// ========================================
// GET SIGNALEMENT BY ID
// ========================================

export async function getSignalementById(idSignalement: string) {
  try {
    await requireRole("Administrateur");

    const signalement = await prisma.signalement.findUnique({
      where: { idSignalement },
      include: {
        administrateur: {
          include: {
            utilisateur: true,
          },
        },
        travailleurConcerne: {
          include: {
            utilisateur: true,
          },
        },
        institutionConcerne: true,
        travailleurEmetteur: {
          include: {
            utilisateur: true,
          },
        },
        institutionEmetteur: true,
      },
    });

    if (!signalement) {
      return {
        success: false,
        error: "Signalement introuvable",
      };
    }

    return {
      success: true,
      data: signalement,
    };
  } catch (error) {
    console.error("Error fetching signalement:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération du signalement",
    };
  }
}

// ========================================
// UPDATE SIGNALEMENT
// ========================================

export async function updateSignalement(
  input: z.infer<typeof updateSignalementSchema>
) {
  try {
    const user = await requireRole("Administrateur");

    const validated = updateSignalementSchema.parse(input);

    // Get admin ID if not already set
    let idAdministrateur: string | undefined;
    if (!validated.reponseAdmin) {
      const admin = await prisma.administrateur.findUnique({
        where: { idUtilisateur: user.id },
        select: { idAdministrateur: true },
      });
      idAdministrateur = admin?.idAdministrateur;
    }

    await prisma.signalement.update({
      where: { idSignalement: validated.idSignalement },
      data: {
        statut: validated.statut,
        reponseAdmin: validated.reponseAdmin,
        dateTraitement:
          validated.statut === "Résolu" ? new Date() : undefined,
        idAdministrateur: idAdministrateur,
      },
    });

    revalidatePath("/admin/signalements");
    return { success: true };
  } catch (error) {
    console.error("Error updating signalement:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du signalement",
    };
  }
}

// ========================================
// DELETE SIGNALEMENT
// ========================================

export async function deleteSignalement(idSignalement: string) {
  try {
    await requireRole("Administrateur");

    await prisma.signalement.delete({
      where: { idSignalement },
    });

    revalidatePath("/admin/signalements");
    return { success: true };
  } catch (error) {
    console.error("Error deleting signalement:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression du signalement",
    };
  }
}


"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Helper function
async function getInstitution(userId: string) {
  let institution = await prisma.institution.findUnique({
    where: { idUtilisateur: userId },
    select: { idInstitution: true },
  });

  if (!institution) {
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

const createEvaluationSchema = z.object({
  idTravailleur: z.string().cuid(),
  note: z.number().int().min(1).max(5),
  commentaire: z.string().max(1000).optional().nullable(),
});

// ========================================
// GET PENDING MISSIONS (missions terminées sans évaluation)
// ========================================

export async function getPendingEvaluations() {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    // Récupérer les missions terminées avec des candidatures acceptées
    const missionsTerminees = await prisma.mission.findMany({
      where: {
        idInstitution: institution.idInstitution,
        statut: "Terminée",
        candidatures: {
          some: {
            statut: "Acceptée",
          },
        },
      },
      include: {
        candidatures: {
          where: {
            statut: "Acceptée",
          },
          include: {
            travailleur: {
              include: {
                utilisateur: {
                  select: {
                    nomComplet: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Filtrer pour ne garder que ceux sans évaluation pour cette mission spécifique
    // On vérifie s'il existe une évaluation créée après la fin de la mission
    const pending = [];
    for (const mission of missionsTerminees) {
      for (const candidature of mission.candidatures) {
        // Vérifier s'il existe déjà une évaluation pour ce travailleur après la fin de cette mission
        // Cela permet d'évaluer un travailleur pour chaque mission terminée
        const missionEndDate = mission.dateFin || new Date();
        const existingEvaluation = await prisma.evaluation.findFirst({
          where: {
            idTravailleur: candidature.idTravailleur,
            idInstitution: institution.idInstitution,
            dateCreation: {
              gte: missionEndDate, // Évaluation créée après la fin de la mission
            },
          },
        });

        // Si pas d'évaluation récente, on peut évaluer ce travailleur pour cette mission
        if (!existingEvaluation) {
          pending.push({
            id: `${mission.idMission}-${candidature.idTravailleur}`, // ID unique par mission-travailleur
            workerName: candidature.travailleur.utilisateur.nomComplet || "",
            workerPhoto: "", // Pas de photo dans le schéma
            missionTitle: mission.titre,
            endDate: mission.dateFin
              ? mission.dateFin.toISOString().split("T")[0]
              : "",
            idTravailleur: candidature.idTravailleur,
            idMission: mission.idMission,
          });
        }
      }
    }

    return { success: true, data: pending };
  } catch (error) {
    console.error("Error fetching pending evaluations:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des évaluations en attente",
    };
  }
}

// ========================================
// CREATE EVALUATION
// ========================================

export async function createEvaluation(input: z.infer<typeof createEvaluationSchema>) {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    // Valider les données
    const validatedData = createEvaluationSchema.parse(input);

    // Vérifier que le travailleur existe
    const travailleur = await prisma.travailleur.findUnique({
      where: { idTravailleur: validatedData.idTravailleur },
    });

    if (!travailleur) {
      throw new Error("Travailleur introuvable");
    }

    // Créer l'évaluation
    await prisma.evaluation.create({
      data: {
        idTravailleur: validatedData.idTravailleur,
        idInstitution: institution.idInstitution,
        note: validatedData.note,
        commentaire: validatedData.commentaire,
      },
    });

    revalidatePath("/enterprise/evaluations");
    revalidatePath("/enterprise/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error creating evaluation:", error);
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
          : "Erreur lors de la création de l'évaluation",
    };
  }
}

// ========================================
// GET EVALUATIONS HISTORY
// ========================================

export async function getEvaluationsHistory(filters?: {
  rating?: number;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    const where: any = {
      idInstitution: institution.idInstitution,
    };

    if (filters?.rating) {
      where.note = filters.rating;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.dateCreation = {};
      if (filters.dateFrom) {
        where.dateCreation.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.dateCreation.lte = filters.dateTo;
      }
    }

    const evaluations = await prisma.evaluation.findMany({
      where,
      include: {
        travailleur: {
          include: {
            utilisateur: {
              select: {
                nomComplet: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateCreation: "desc",
      },
    });

    // Pour chaque évaluation, récupérer la mission associée si possible
    const formatted = await Promise.all(
      evaluations.map(async (e) => {
        // Trouver la mission la plus récente acceptée pour ce travailleur
        const candidature = await prisma.candidature.findFirst({
          where: {
            idTravailleur: e.idTravailleur,
            statut: "Acceptée",
            mission: {
              idInstitution: institution.idInstitution,
            },
          },
          include: {
            mission: {
              select: {
                titre: true,
              },
            },
          },
          orderBy: {
            dateCandidature: "desc",
          },
        });

        return {
          id: e.idEvaluation,
          workerName: e.travailleur.utilisateur.nomComplet || "",
          workerPhoto: "",
          missionTitle: candidature?.mission.titre || "Mission terminée",
          rating: e.note,
          comment: e.commentaire || "",
          date: e.dateCreation.toISOString().split("T")[0],
        };
      })
    );

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error fetching evaluations history:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération de l'historique",
    };
  }
}

// ========================================
// GET EVALUATION STATS
// ========================================

export async function getEvaluationStats() {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    const totalEvaluations = await prisma.evaluation.count({
      where: {
        idInstitution: institution.idInstitution,
      },
    });

    const avgRating = await prisma.evaluation.aggregate({
      where: {
        idInstitution: institution.idInstitution,
      },
      _avg: {
        note: true,
      },
    });

    const positiveRatings = await prisma.evaluation.count({
      where: {
        idInstitution: institution.idInstitution,
        note: {
          gte: 4,
        },
      },
    });

    const positivePercentage =
      totalEvaluations > 0
        ? Math.round((positiveRatings / totalEvaluations) * 100)
        : 0;

    return {
      success: true,
      data: {
        averageRating: avgRating._avg.note
          ? Number(avgRating._avg.note).toFixed(1)
          : "0",
        totalEvaluations,
        positivePercentage: `${positivePercentage}%`,
      },
    };
  } catch (error) {
    console.error("Error fetching evaluation stats:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des statistiques",
    };
  }
}



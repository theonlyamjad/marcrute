// src/actions/worker/evaluations.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

/**
 * Get all evaluations for the current worker
 */
export async function getWorkerEvaluations() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const evaluations = await prisma.evaluation.findMany({
      where: { idTravailleur: worker.idTravailleur },
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
      },
      orderBy: {
        dateCreation: "desc",
      },
    });

    return { success: true, data: evaluations };
  } catch (error) {
    console.error("Error fetching worker evaluations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des évaluations",
    };
  }
}

/**
 * Get evaluation statistics for the worker
 */
export async function getEvaluationStats() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true, noteMoyenne: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Get all evaluations
    const evaluations = await prisma.evaluation.findMany({
      where: { idTravailleur: worker.idTravailleur },
      select: { note: true },
    });

    const total = evaluations.length;

    if (total === 0) {
      return {
        success: true,
        data: {
          total: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      };
    }

    // Calculate average
    const sum = evaluations.reduce((acc, curr) => acc + curr.note, 0);
    const averageRating = Number((sum / total).toFixed(2));

    // Calculate rating distribution
    const ratingDistribution = evaluations.reduce((acc, curr) => {
      acc[curr.note] = (acc[curr.note] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Ensure all ratings 1-5 are present
    for (let i = 1; i <= 5; i++) {
      if (!ratingDistribution[i]) {
        ratingDistribution[i] = 0;
      }
    }

    // Update worker's average rating in database if different
    if (worker.noteMoyenne?.toString() !== averageRating.toString()) {
      await prisma.travailleur.update({
        where: { idTravailleur: worker.idTravailleur },
        data: { noteMoyenne: averageRating },
      });
    }

    return {
      success: true,
      data: {
        total,
        averageRating,
        ratingDistribution,
      },
    };
  } catch (error) {
    console.error("Error fetching evaluation stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des statistiques",
    };
  }
}

/**
 * Get recent evaluations (last 30 days)
 */
export async function getRecentEvaluations() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const evaluations = await prisma.evaluation.findMany({
      where: {
        idTravailleur: worker.idTravailleur,
        dateCreation: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        institution: {
          include: {
            ville: true,
          },
        },
      },
      orderBy: {
        dateCreation: "desc",
      },
    });

    return { success: true, data: evaluations };
  } catch (error) {
    console.error("Error fetching recent evaluations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des évaluations récentes",
    };
  }
}

/**
 * Get evaluations by rating
 */
export async function getEvaluationsByRating(rating: number) {
  try {
    const user = await requireRole("Travailleur");

    if (rating < 1 || rating > 5) {
      throw new Error("La note doit être entre 1 et 5");
    }

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const evaluations = await prisma.evaluation.findMany({
      where: {
        idTravailleur: worker.idTravailleur,
        note: rating,
      },
      include: {
        institution: {
          include: {
            ville: true,
          },
        },
      },
      orderBy: {
        dateCreation: "desc",
      },
    });

    return { success: true, data: evaluations };
  } catch (error) {
    console.error("Error fetching evaluations by rating:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des évaluations",
    };
  }
}

/**
 * Get evaluation details by ID
 */
export async function getEvaluationDetails(idEvaluation: string) {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const evaluation = await prisma.evaluation.findUnique({
      where: { idEvaluation },
      include: {
        institution: {
          include: {
            utilisateur: {
              select: {
                nomComplet: true,
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
    });

    if (!evaluation) {
      throw new Error("Évaluation introuvable");
    }

    if (evaluation.idTravailleur !== worker.idTravailleur) {
      throw new Error("Vous n'êtes pas autorisé à consulter cette évaluation");
    }

    return { success: true, data: evaluation };
  } catch (error) {
    console.error("Error fetching evaluation details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération de l'évaluation",
    };
  }
}

/**
 * Get evaluations with comments only
 */
export async function getEvaluationsWithComments() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const evaluations = await prisma.evaluation.findMany({
      where: {
        idTravailleur: worker.idTravailleur,
        commentaire: {
          not: null,
        },
      },
      include: {
        institution: {
          include: {
            ville: true,
          },
        },
      },
      orderBy: {
        dateCreation: "desc",
      },
    });

    return { success: true, data: evaluations };
  } catch (error) {
    console.error("Error fetching evaluations with comments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des évaluations",
    };
  }
}

/**
 * Get top evaluating institutions
 */
export async function getTopEvaluators() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Get evaluations grouped by institution
    const evaluationsByInstitution = await prisma.evaluation.groupBy({
      by: ["idInstitution"],
      where: { idTravailleur: worker.idTravailleur },
      _count: true,
      _avg: { note: true },
      orderBy: {
        _count: {
          idInstitution: "desc",
        },
      },
      take: 5,
    });

    // Get institution details
    const institutionIds = evaluationsByInstitution.map((e) => e.idInstitution);
    const institutions = await prisma.institution.findMany({
      where: { idInstitution: { in: institutionIds } },
      include: {
        ville: {
          include: {
            region: true,
          },
        },
      },
    });

    // Combine data
    const topEvaluators = evaluationsByInstitution.map((e) => ({
      institution: institutions.find((i) => i.idInstitution === e.idInstitution),
      evaluationCount: e._count,
      averageRating: e._avg.note || 0,
    }));

    return { success: true, data: topEvaluators };
  } catch (error) {
    console.error("Error fetching top evaluators:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des évaluateurs",
    };
  }
}
"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// ========================================
// GET ADMIN DASHBOARD STATS
// ========================================

export async function getAdminDashboardStats() {
  try {
    await requireRole("Admin");

    // Statistiques globales
    const totalUsers = await prisma.utilisateur.count();
    const totalWorkers = await prisma.travailleur.count();
    const totalInstitutions = await prisma.institution.count();
    const totalMissions = await prisma.mission.count();
    const totalCandidatures = await prisma.candidature.count();

    // Utilisateurs actifs ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyUsers = await prisma.utilisateur.count({
      where: {
        dateCreation: {
          gte: startOfMonth,
        },
      },
    });

    // Signalements en attente
    const pendingSignalements = await prisma.signalement.count({
      where: {
        statut: "En attente",
      },
    });

    // Validations en attente
    const pendingValidations = await prisma.validation.count({
      where: {
        statut: "En attente",
      },
    });

    // Missions actives
    const activeMissions = await prisma.mission.count({
      where: {
        statut: "Active",
      },
    });

    return {
      success: true,
      data: {
        totalUsers,
        totalWorkers,
        totalInstitutions,
        totalMissions,
        totalCandidatures,
        monthlyUsers,
        pendingSignalements,
        pendingValidations,
        activeMissions,
      },
    };
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des statistiques",
    };
  }
}

// ========================================
// GET USERS GROWTH TREND
// ========================================

export async function getUsersGrowthTrend() {
  try {
    await requireRole("Admin");

    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date);
    }

    const trends = await Promise.all(
      months.map(async (monthStart) => {
        const monthEnd = new Date(
          monthStart.getFullYear(),
          monthStart.getMonth() + 1,
          0
        );

        const workers = await prisma.travailleur.count({
          where: {
            dateCreation: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        const institutions = await prisma.institution.count({
          where: {
            dateCreation: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        return {
          mois: monthStart.toLocaleDateString("fr-FR", { month: "short" }),
          travailleurs: workers,
          institutions: institutions,
        };
      })
    );

    return { success: true, data: trends };
  } catch (error) {
    console.error("Error fetching users growth trend:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des tendances",
    };
  }
}

// ========================================
// GET SIGNALEMENTS STATUS
// ========================================

export async function getSignalementsStatus() {
  try {
    await requireRole("Admin");

    const enAttente = await prisma.signalement.count({
      where: {
        statut: "En attente",
      },
    });

    const enCours = await prisma.signalement.count({
      where: {
        statut: "En cours",
      },
    });

    const resolus = await prisma.signalement.count({
      where: {
        statut: "Résolu",
      },
    });

    return {
      success: true,
      data: [
        { name: "En attente", value: enAttente, color: "#F3A712" },
        { name: "En cours", value: enCours, color: "#1D546D" },
        { name: "Résolus", value: resolus, color: "#5F9598" },
      ],
    };
  } catch (error) {
    console.error("Error fetching signalements status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération du statut des signalements",
    };
  }
}

// ========================================
// GET RECENT SIGNALEMENTS
// ========================================

export async function getRecentSignalements(limit: number = 10) {
  try {
    await requireRole("Admin");

    const signalements = await prisma.signalement.findMany({
      include: {
        travailleurConcerne: {
          include: {
            utilisateur: {
              select: {
                nomComplet: true,
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
      take: limit,
    });

    const formatted = signalements.map((s) => ({
      id: s.idSignalement,
      motif: s.motif,
      description: s.description,
      emetteur:
        s.travailleurEmetteur?.utilisateur.nomComplet ||
        s.institutionEmetteur?.nomInstitution ||
        "Inconnu",
      concerne:
        s.travailleurConcerne?.utilisateur.nomComplet ||
        s.institutionConcerne?.nomInstitution ||
        "Inconnu",
      date: s.dateSignalement.toISOString().split("T")[0],
      statut: s.statut,
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error fetching recent signalements:", error);
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
// GET RECENT VALIDATIONS
// ========================================

export async function getRecentValidations(limit: number = 10) {
  try {
    await requireRole("Admin");

    const validations = await prisma.validation.findMany({
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
        travailleur: {
          include: {
            utilisateur: {
              select: {
                nomComplet: true,
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
      take: limit,
    });

    const formatted = validations.map((v) => ({
      id: v.idValidation,
      type: v.typeValidation,
      statut: v.statut,
      concerne:
        v.travailleur?.utilisateur.nomComplet ||
        v.institution?.nomInstitution ||
        v.mission?.titre ||
        "Inconnu",
      administrateur: v.administrateur.utilisateur.nomComplet || "Admin",
      date: v.dateCreation.toISOString().split("T")[0],
      notes: v.notes,
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error fetching recent validations:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des validations",
    };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// Helper function pour obtenir l'institution
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
// GET DASHBOARD STATS
// ========================================

export async function getDashboardStats() {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    // Statistiques des missions
    const totalMissions = await prisma.mission.count({
      where: { idInstitution: institution.idInstitution },
    });

    const activeMissions = await prisma.mission.count({
      where: {
        idInstitution: institution.idInstitution,
        statut: "Active",
      },
    });

    const pendingMissions = await prisma.mission.count({
      where: {
        idInstitution: institution.idInstitution,
        statut: "Brouillon",
      },
    });

    const completedMissions = await prisma.mission.count({
      where: {
        idInstitution: institution.idInstitution,
        statut: "Terminée",
      },
    });

    // Missions créées ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyMissions = await prisma.mission.count({
      where: {
        idInstitution: institution.idInstitution,
        dateCreation: {
          gte: startOfMonth,
        },
      },
    });

    // Candidatures en attente
    const pendingCandidatures = await prisma.candidature.count({
      where: {
        mission: {
          idInstitution: institution.idInstitution,
        },
        statut: "En attente",
      },
    });

    // Note moyenne des évaluations données
    const avgRating = await prisma.evaluation.aggregate({
      where: {
        idInstitution: institution.idInstitution,
      },
      _avg: {
        note: true,
      },
    });

    return {
      success: true,
      data: {
        totalMissions,
        activeMissions,
        pendingMissions,
        completedMissions,
        monthlyMissions,
        pendingCandidatures,
        averageRating: avgRating._avg.note ? Number(avgRating._avg.note) : 0,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
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
// GET MISSIONS TREND
// ========================================

export async function getMissionsTrend() {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    // Obtenir les 6 derniers mois
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

        const missions = await prisma.mission.count({
          where: {
            idInstitution: institution.idInstitution,
            dateCreation: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        const acceptees = await prisma.candidature.count({
          where: {
            mission: {
              idInstitution: institution.idInstitution,
            },
            statut: "Acceptée",
            dateCandidature: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        return {
          mois: monthStart.toLocaleDateString("fr-FR", { month: "short" }),
          missions,
          acceptees,
        };
      })
    );

    return { success: true, data: trends };
  } catch (error) {
    console.error("Error fetching missions trend:", error);
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
// GET CANDIDATURES STATUS
// ========================================

export async function getCandidaturesStatus() {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    const enAttente = await prisma.candidature.count({
      where: {
        mission: {
          idInstitution: institution.idInstitution,
        },
        statut: "En attente",
      },
    });

    const acceptees = await prisma.candidature.count({
      where: {
        mission: {
          idInstitution: institution.idInstitution,
        },
        statut: "Acceptée",
      },
    });

    const refusees = await prisma.candidature.count({
      where: {
        mission: {
          idInstitution: institution.idInstitution,
        },
        statut: "Refusée",
      },
    });

    return {
      success: true,
      data: [
        { name: "En attente", value: enAttente, color: "#F3A712" },
        { name: "Acceptées", value: acceptees, color: "#5F9598" },
        { name: "Refusées", value: refusees, color: "#D64545" },
      ],
    };
  } catch (error) {
    console.error("Error fetching candidatures status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération du statut des candidatures",
    };
  }
}

// ========================================
// GET RECENT CANDIDATURES
// ========================================

export async function getRecentCandidatures(limit: number = 5) {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    const candidatures = await prisma.candidature.findMany({
      where: {
        mission: {
          idInstitution: institution.idInstitution,
        },
      },
      include: {
        travailleur: {
          include: {
            utilisateur: {
              select: {
                nomComplet: true,
              },
            },
            specialites: {
              take: 3,
              include: {
                categorie: true,
              },
            },
          },
        },
        mission: {
          select: {
            titre: true,
          },
        },
      },
      orderBy: {
        dateCandidature: "desc",
      },
      take: limit,
    });

    const formatted = candidatures.map((c) => ({
      id: c.idCandidature,
      travailleur: c.travailleur.utilisateur.nomComplet || "",
      mission: c.mission.titre,
      date: c.dateCandidature.toISOString().split("T")[0],
      statut: c.statut,
      specialites: c.travailleur.specialites.map(
        (s) => s.categorie?.name || s.nomSpecialite
      ),
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error fetching recent candidatures:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des candidatures récentes",
    };
  }
}

// ========================================
// GET ACTIVE MISSIONS
// ========================================

export async function getActiveMissions(limit: number = 5) {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    const missions = await prisma.mission.findMany({
      where: {
        idInstitution: institution.idInstitution,
        statut: "Active",
      },
      include: {
        candidatures: {
          select: {
            idCandidature: true,
          },
        },
      },
      orderBy: {
        dateCreation: "desc",
      },
      take: limit,
    });

    const formatted = missions.map((m) => {
      const dateDebut = m.dateDebut ? new Date(m.dateDebut) : new Date();
      const dateFin = m.dateFin ? new Date(m.dateFin) : new Date();
      const now = new Date();
      const total = dateFin.getTime() - dateDebut.getTime();
      const elapsed = now.getTime() - dateDebut.getTime();
      const progression = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0;

      return {
        id: m.idMission,
        titre: m.titre,
        dateDebut: m.dateDebut
          ? m.dateDebut.toISOString().split("T")[0]
          : "",
        dateFin: m.dateFin ? m.dateFin.toISOString().split("T")[0] : "",
        candidatures: m.candidatures.length,
        urgence: m.urgence || "Normale",
        progression: Math.round(progression),
      };
    });

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error fetching active missions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des missions actives",
    };
  }
}

// ========================================
// GET RECENT SIGNALEMENTS
// ========================================

export async function getRecentSignalements(limit: number = 5) {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    const signalements = await prisma.signalement.findMany({
      where: {
        OR: [
          { idInstitutionEmetteur: institution.idInstitution },
          { idInstitutionConcerne: institution.idInstitution },
        ],
      },
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
      },
      orderBy: {
        dateSignalement: "desc",
      },
      take: limit,
    });

    const formatted = signalements.map((s) => ({
      id: s.idSignalement,
      motif: s.motif,
      concerne: s.travailleurConcerne?.utilisateur.nomComplet || "Institution",
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


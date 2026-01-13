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

const respondCandidatureSchema = z.object({
  idCandidature: z.string().cuid(),
  statut: z.enum(["Acceptée", "Refusée"]),
  messageReponse: z.string().optional().nullable(),
});

// ========================================
// GET CANDIDATURES
// ========================================

export async function getCandidatures(filters?: {
  idMission?: string;
  statut?: string;
}) {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    const where: any = {
      mission: {
        idInstitution: institution.idInstitution,
      },
    };

    if (filters?.idMission && filters.idMission !== "all") {
      where.idMission = filters.idMission;
    }

    if (filters?.statut && filters.statut !== "all") {
      where.statut = filters.statut;
    }

    const candidatures = await prisma.candidature.findMany({
      where,
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
            diplomes: {
              take: 5,
              orderBy: {
                dateCreation: "desc",
              },
            },
            experiences: {
              take: 5,
              orderBy: {
                dateDebut: "desc",
              },
            },
          },
        },
        mission: {
          select: {
            idMission: true,
            titre: true,
          },
        },
      },
      orderBy: {
        dateCandidature: "desc",
      },
    });

    const formatted = candidatures.map((c) => ({
      id: c.idCandidature,
      travailleur: {
        id: c.travailleur.idTravailleur,
        nomComplet: c.travailleur.utilisateur.nomComplet || "",
        email: c.travailleur.utilisateur.email,
        telephone: c.travailleur.utilisateur.telephone || "",
        noteMoyenne: c.travailleur.noteMoyenne
          ? Number(c.travailleur.noteMoyenne)
          : 0,
        specialites: c.travailleur.specialites.map((s) =>
          s.categorie?.name || s.nomSpecialite
        ),
        anneesExperience: c.travailleur.anneesExperience || 0,
        diplomes: c.travailleur.diplomes.map((d) => ({
          nomDiplome: d.nomDiplome,
          nomInstitution: d.nomInstitution || "",
          annee: d.dateCreation.getFullYear().toString(),
        })),
        experiences: c.travailleur.experiences.map((e) => ({
          titrePoste: e.titrePoste || "",
          organisation: e.organisation || "",
          duree: e.dureeMois
            ? `${Math.floor(e.dureeMois / 12)} ans ${e.dureeMois % 12} mois`
            : "Non spécifié",
        })),
      },
      mission: {
        id: c.mission.idMission,
        titre: c.mission.titre,
      },
      dateCandidature: c.dateCandidature.toISOString().split("T")[0],
      messageTravailleur: c.messageTravailleur || "",
      statut: c.statut as "En attente" | "Acceptée" | "Refusée",
      dateReponse: c.dateReponse
        ? c.dateReponse.toISOString().split("T")[0]
        : undefined,
      messageReponse: undefined, // Pas stocké dans la DB actuellement
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error fetching candidatures:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des candidatures",
    };
  }
}

// ========================================
// GET MISSIONS FOR FILTER
// ========================================

export async function getMissionsForFilter() {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    const missions = await prisma.mission.findMany({
      where: {
        idInstitution: institution.idInstitution,
      },
      select: {
        idMission: true,
        titre: true,
      },
      orderBy: {
        dateCreation: "desc",
      },
    });

    return { success: true, data: missions };
  } catch (error) {
    console.error("Error fetching missions for filter:", error);
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
// ACCEPT CANDIDATURE
// ========================================

export async function acceptCandidature(
  idCandidature: string,
  messageReponse?: string
) {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    // Vérifier que la candidature appartient à une mission de l'institution
    const candidature = await prisma.candidature.findFirst({
      where: {
        idCandidature,
        mission: {
          idInstitution: institution.idInstitution,
        },
      },
    });

    if (!candidature) {
      throw new Error("Candidature introuvable ou accès non autorisé");
    }

    await prisma.candidature.update({
      where: { idCandidature },
      data: {
        statut: "Acceptée",
        dateReponse: new Date(),
      },
    });

    revalidatePath("/enterprise/candidature");
    revalidatePath("/enterprise/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error accepting candidature:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de l'acceptation de la candidature",
    };
  }
}

// ========================================
// REJECT CANDIDATURE
// ========================================

export async function rejectCandidature(
  idCandidature: string,
  messageReponse?: string
) {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    // Vérifier que la candidature appartient à une mission de l'institution
    const candidature = await prisma.candidature.findFirst({
      where: {
        idCandidature,
        mission: {
          idInstitution: institution.idInstitution,
        },
      },
    });

    if (!candidature) {
      throw new Error("Candidature introuvable ou accès non autorisé");
    }

    await prisma.candidature.update({
      where: { idCandidature },
      data: {
        statut: "Refusée",
        dateReponse: new Date(),
      },
    });

    revalidatePath("/enterprise/candidature");
    revalidatePath("/enterprise/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error rejecting candidature:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors du refus de la candidature",
    };
  }
}









"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

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
// SEARCH WORKERS
// ========================================

export async function searchWorkers(filters?: {
  search?: string;
  idSpecialite?: number;
  idVille?: string;
  anneesExperienceMin?: number;
  isLabelled?: boolean;
  isAvailable?: boolean;
}) {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    // Récupérer d'abord les IDs des travailleurs qui ont postulé à au moins une mission de cette institution
    const candidatures = await prisma.candidature.findMany({
      where: {
        mission: {
          idInstitution: institution.idInstitution,
        },
      },
      select: {
        idTravailleur: true,
      },
      distinct: ["idTravailleur"],
    });

    const travailleurIds = candidatures.map((c) => c.idTravailleur);

    // Si aucun travailleur n'a postulé, retourner un tableau vide
    if (travailleurIds.length === 0) {
      return { success: true, data: [] };
    }

    // Filtrer uniquement les travailleurs qui ont postulé à au moins une mission
    const where: Record<string, unknown> = {
      idTravailleur: {
        in: travailleurIds,
      },
    };

    // Recherche par nom
    if (filters?.search) {
      where.utilisateur = {
        OR: [
          { nomComplet: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
        ],
      };
    }

    // Filtre par spécialité
    if (filters?.idSpecialite) {
      where.specialites = {
        some: {
          idCategorie: filters.idSpecialite,
        },
      };
    }

    // Filtre par ville
    if (filters?.idVille) {
      where.idVille = filters.idVille;
    }

    // Filtre par années d'expérience
    if (filters?.anneesExperienceMin !== undefined) {
      where.anneesExperience = {
        gte: filters.anneesExperienceMin,
      };
    }

    // Filtre par label
    if (filters?.isLabelled !== undefined) {
      where.statutLabel = filters.isLabelled ? { not: null } : null;
    }

    const travailleurs = await prisma.travailleur.findMany({
      where,
      include: {
        utilisateur: {
          select: {
            nomComplet: true,
            email: true,
            telephone: true,
          },
        },
        ville: {
          include: {
            region: true,
          },
        },
        specialites: {
          include: {
            categorie: true,
          },
          take: 5,
        },
        diplomes: {
          take: 3,
          orderBy: {
            dateCreation: "desc",
          },
        },
        candidatures: {
          where: {
            statut: "Acceptée",
          },
          select: {
            idMission: true,
          },
        },
      },
      take: 50,
    });

    const formatted = travailleurs.map((t) => {
      // Déterminer la disponibilité
      const hasActiveMission = t.candidatures.length > 0;
      let availability: "Disponible" | "En mission" | "Bientôt libre" =
        "Disponible";
      if (hasActiveMission) {
        availability = "En mission";
      }

      return {
        id: t.idTravailleur,
        name: t.utilisateur.nomComplet || "",
        photo: "", // Pas de photo dans le schéma actuel
        city: t.ville?.nomVille || "",
        region: t.ville?.region.nomRegion || "",
        specialties: t.specialites.map((s) => ({
          name: s.categorie?.name || s.nomSpecialite,
          level: (s.niveau || "Intermédiaire") as
            | "Débutant"
            | "Intermédiaire"
            | "Avancé"
            | "Expert",
        })),
        experience: t.anneesExperience || 0,
        rating: t.noteMoyenne ? Number(t.noteMoyenne) : 0,
        isLabelled: !!t.statutLabel,
        availability,
        bio: t.biographie || "",
        diplomas: t.diplomes.map((d) => ({
          title: d.nomDiplome,
          school: d.nomInstitution || "",
          year: d.dateCreation.getFullYear().toString(),
          verified: !!d.dateVerification,
        })),
      };
    });

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error searching workers:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la recherche des travailleurs",
    };
  }
}

// ========================================
// GET WORKER PROFILE
// ========================================

export async function getWorkerProfile(idTravailleur: string) {
  try {
    await requireRole("Institution");

    const travailleur = await prisma.travailleur.findUnique({
      where: { idTravailleur },
      include: {
        utilisateur: {
          select: {
            nomComplet: true,
            email: true,
            telephone: true,
          },
        },
        ville: {
          include: {
            region: true,
          },
        },
        specialites: {
          include: {
            categorie: true,
          },
        },
        diplomes: {
          orderBy: {
            dateCreation: "desc",
          },
        },
        experiences: {
          orderBy: {
            dateDebut: "desc",
          },
        },
        candidatures: {
          where: {
            statut: "Acceptée",
          },
          include: {
            mission: {
              select: {
                titre: true,
                dateDebut: true,
                dateFin: true,
              },
            },
          },
        },
      },
    });

    if (!travailleur) {
      throw new Error("Travailleur introuvable");
    }

    const hasActiveMission = travailleur.candidatures.some((c) => {
      const now = new Date();
      const dateFin = c.mission.dateFin;
      return dateFin && new Date(dateFin) > now;
    });

    return {
      success: true,
      data: {
        id: travailleur.idTravailleur,
        name: travailleur.utilisateur.nomComplet || "",
        photo: "",
        city: travailleur.ville?.nomVille || "",
        region: travailleur.ville?.region.nomRegion || "",
        specialties: travailleur.specialites.map((s) => ({
          name: s.categorie?.name || s.nomSpecialite,
          level: (s.niveau || "Intermédiaire") as
            | "Débutant"
            | "Intermédiaire"
            | "Avancé"
            | "Expert",
        })),
        experience: travailleur.anneesExperience || 0,
        rating: travailleur.noteMoyenne ? Number(travailleur.noteMoyenne) : 0,
        isLabelled: !!travailleur.statutLabel,
        availability: hasActiveMission
          ? ("En mission" as const)
          : ("Disponible" as const),
        bio: travailleur.biographie || "",
        diplomas: travailleur.diplomes.map((d) => ({
          title: d.nomDiplome,
          school: d.nomInstitution || "",
          year: d.dateCreation.getFullYear().toString(),
          verified: !!d.dateVerification,
        })),
        experiences: travailleur.experiences.map((e) => ({
          titrePoste: e.titrePoste || "",
          organisation: e.organisation || "",
          duree: e.dureeMois
            ? `${Math.floor(e.dureeMois / 12)} ans ${e.dureeMois % 12} mois`
            : "Non spécifié",
          description: e.description || "",
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching worker profile:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération du profil",
    };
  }
}

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
// GET REGIONS AND CITIES
// ========================================

export async function getRegionsWithCities() {
  try {
    const regions = await prisma.region.findMany({
      include: {
        villes: {
          orderBy: {
            nomVille: "asc",
          },
        },
      },
      orderBy: {
        nomRegion: "asc",
      },
    });

    return { success: true, data: regions };
  } catch (error) {
    console.error("Error fetching regions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des régions",
    };
  }
}

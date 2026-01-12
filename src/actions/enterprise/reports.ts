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

const createSignalementSchema = z.object({
  idTravailleurConcerne: z.string().cuid().optional().nullable(),
  motif: z.string().min(1, "Le motif est requis"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
});

// ========================================
// GET SIGNALEMENTS EMIS
// ========================================

export async function getIssuedSignalements() {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    const signalements = await prisma.signalement.findMany({
      where: {
        idInstitutionEmetteur: institution.idInstitution,
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
    });

    const formatted = signalements.map((s) => ({
      id: s.idSignalement,
      workerName: s.travailleurConcerne?.utilisateur.nomComplet || "Travailleur",
      motive: s.motif,
      description: s.description,
      status: s.statut as "En attente" | "Traité" | "Rejeté",
      dateCreated: s.dateSignalement.toISOString().split("T")[0],
      dateProcessed: s.dateTraitement
        ? s.dateTraitement.toISOString().split("T")[0]
        : undefined,
      adminResponse: s.reponseAdmin || undefined,
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error fetching issued signalements:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des signalements émis",
    };
  }
}

// ========================================
// GET SIGNALEMENTS RECUS
// ========================================

export async function getReceivedSignalements() {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    const signalements = await prisma.signalement.findMany({
      where: {
        idInstitutionConcerne: institution.idInstitution,
      },
      include: {
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
    });

    const formatted = signalements.map((s) => ({
      id: s.idSignalement,
      workerName: "Vous (Entreprise)",
      emitterName:
        s.travailleurEmetteur?.utilisateur.nomComplet ||
        s.institutionEmetteur?.utilisateur.nomComplet ||
        "Utilisateur",
      motive: s.motif,
      description: s.description,
      status: s.statut as "En attente" | "Traité" | "Rejeté",
      dateCreated: s.dateSignalement.toISOString().split("T")[0],
      dateProcessed: s.dateTraitement
        ? s.dateTraitement.toISOString().split("T")[0]
        : undefined,
      adminResponse: s.reponseAdmin || undefined,
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error fetching received signalements:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des signalements reçus",
    };
  }
}

// ========================================
// CREATE SIGNALEMENT
// ========================================

export async function createSignalement(
  input: z.infer<typeof createSignalementSchema>
) {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    // Valider les données
    const validatedData = createSignalementSchema.parse(input);

    // Créer le signalement
    await prisma.signalement.create({
      data: {
        idInstitutionEmetteur: institution.idInstitution,
        idTravailleurConcerne: validatedData.idTravailleurConcerne || null,
        motif: validatedData.motif,
        description: validatedData.description,
        statut: "En attente",
      },
    });

    revalidatePath("/enterprise/reports");
    revalidatePath("/enterprise/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error creating signalement:", error);
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
          : "Erreur lors de la création du signalement",
    };
  }
}

// ========================================
// GET WORKERS FOR SIGNALEMENT
// ========================================

export async function getWorkersForSignalement() {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    // Récupérer les travailleurs qui ont eu des missions avec cette institution
    const candidatures = await prisma.candidature.findMany({
      where: {
        mission: {
          idInstitution: institution.idInstitution,
        },
        statut: {
          in: ["Acceptée", "En attente"],
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
          },
        },
      },
      distinct: ["idTravailleur"],
    });

    const workers = candidatures.map((c) => ({
      id: c.travailleur.idTravailleur,
      name: c.travailleur.utilisateur.nomComplet || "",
    }));

    return { success: true, data: workers };
  } catch (error) {
    console.error("Error fetching workers for signalement:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des travailleurs",
    };
  }
}








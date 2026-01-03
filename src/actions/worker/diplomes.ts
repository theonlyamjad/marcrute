// src/actions/worker/diplomes.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import {
  addDiplomaSchema,
  deleteDiplomaSchema,
  type AddDiplomaInput,
  type DeleteDiplomaInput,
} from "@/lib/validations/worker";
import { revalidatePath } from "next/cache";

/**
 * Get worker's diplomas
 */
export async function getWorkerDiplomas() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const diplomas = await prisma.diplome.findMany({
      where: { idTravailleur: worker.idTravailleur },
      orderBy: {
        dateCreation: "desc",
      },
    });

    return { success: true, data: diplomas };
  } catch (error) {
    console.error("Error fetching worker diplomas:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des diplômes",
    };
  }
}

/**
 * Add a new diploma
 */
export async function addWorkerDiploma(input: AddDiplomaInput) {
  try {
    const user = await requireRole("Travailleur");

    // Validate input
    const validatedData = addDiplomaSchema.parse(input);

    // Get worker ID
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Create diploma
    const diploma = await prisma.diplome.create({
      data: {
        idTravailleur: worker.idTravailleur,
        nomDiplome: validatedData.nomDiplome,
        nomInstitution: validatedData.nomInstitution,
        cheminFichier: validatedData.cheminFichier,
        statut: "En attente", // Default status
      },
    });

    revalidatePath("/worker/profile");
    revalidatePath("/worker/cv");

    return { success: true, data: diploma };
  } catch (error) {
    console.error("Error adding worker diploma:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'ajout du diplôme",
    };
  }
}

/**
 * Delete a diploma
 */
export async function deleteWorkerDiploma(input: DeleteDiplomaInput) {
  try {
    const user = await requireRole("Travailleur");

    // Validate input
    const validatedData = deleteDiplomaSchema.parse(input);

    // Get worker ID
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Check if diploma belongs to this worker
    const diploma = await prisma.diplome.findUnique({
      where: { idDiplome: validatedData.idDiplome },
    });

    if (!diploma) {
      throw new Error("Diplôme introuvable");
    }

    if (diploma.idTravailleur !== worker.idTravailleur) {
      throw new Error("Vous n'êtes pas autorisé à supprimer ce diplôme");
    }

    // Delete diploma
    await prisma.diplome.delete({
      where: { idDiplome: validatedData.idDiplome },
    });

    revalidatePath("/worker/profile");
    revalidatePath("/worker/cv");

    return { success: true, message: "Diplôme supprimé avec succès" };
  } catch (error) {
    console.error("Error deleting worker diploma:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression du diplôme",
    };
  }
}

/**
 * Get diplomas pending verification
 */
export async function getPendingDiplomas() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const pendingDiplomas = await prisma.diplome.findMany({
      where: {
        idTravailleur: worker.idTravailleur,
        statut: "En attente",
      },
      orderBy: {
        dateCreation: "desc",
      },
    });

    return { success: true, data: pendingDiplomas };
  } catch (error) {
    console.error("Error fetching pending diplomas:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des diplômes en attente",
    };
  }
}

/**
 * Get verified diplomas
 */
export async function getVerifiedDiplomas() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const verifiedDiplomas = await prisma.diplome.findMany({
      where: {
        idTravailleur: worker.idTravailleur,
        statut: "Vérifié",
      },
      orderBy: {
        dateVerification: "desc",
      },
    });

    return { success: true, data: verifiedDiplomas };
  } catch (error) {
    console.error("Error fetching verified diplomas:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des diplômes vérifiés",
    };
  }
}
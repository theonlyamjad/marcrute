// src/actions/worker/experience.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import {addExperienceSchema,updateExperienceSchema,deleteExperienceSchema,type AddExperienceInput,type UpdateExperienceInput,type DeleteExperienceInput,} from "@/lib/validations/worker";
import { revalidatePath } from "next/cache";

/**
 * Get worker's experiences
 */
export async function getWorkerExperiences() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const experiences = await prisma.experience.findMany({
      where: { idTravailleur: worker.idTravailleur },
      orderBy: {
        dateDebut: "desc",
      },
    });

    return { success: true, data: experiences };
  } catch (error) {
    console.error("Error fetching worker experiences:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des expériences",
    };
  }
}

/**
 * Add a new experience
 */
export async function addWorkerExperience(input: AddExperienceInput) {
  try {
    const user = await requireRole("Travailleur");

    // Validate input
    const validatedData = addExperienceSchema.parse(input);

    // Get worker ID
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Calculate duration in months if not provided
    let dureeMois = validatedData.dureeMois;
    if (!dureeMois && validatedData.dateDebut) {
      const endDate = validatedData.dateFin || new Date();
      const startDate = validatedData.dateDebut;
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      dureeMois = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    }

    // Create experience
    const experience = await prisma.experience.create({
      data: {
        idTravailleur: worker.idTravailleur,
        titrePoste: validatedData.titrePoste,
        organisation: validatedData.organisation,
        description: validatedData.description,
        dateDebut: validatedData.dateDebut,
        dateFin: validatedData.dateFin,
        dureeMois,
      },
    });

    revalidatePath("/worker/profile");
    revalidatePath("/worker/cv");

    return { success: true, data: experience };
  } catch (error) {
    console.error("Error adding worker experience:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'ajout de l'expérience",
    };
  }
}

/**
 * Update an existing experience
 */
export async function updateWorkerExperience(input: UpdateExperienceInput) {
  try {
    const user = await requireRole("Travailleur");

    // Validate input
    const validatedData = updateExperienceSchema.parse(input);

    // Get worker ID
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Check if experience belongs to this worker
    const existingExperience = await prisma.experience.findUnique({
      where: { idExperience: validatedData.idExperience },
    });

    if (!existingExperience) {
      throw new Error("Expérience introuvable");
    }

    if (existingExperience.idTravailleur !== worker.idTravailleur) {
      throw new Error("Vous n'êtes pas autorisé à modifier cette expérience");
    }

    // Calculate duration if dates are updated
    let dureeMois = validatedData.dureeMois;
    if (!dureeMois && (validatedData.dateDebut || validatedData.dateFin)) {
      const startDate = validatedData.dateDebut || existingExperience.dateDebut || new Date();
      const endDate = validatedData.dateFin || existingExperience.dateFin || new Date();
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      dureeMois = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    }

    // Update experience
    const experience = await prisma.experience.update({
      where: { idExperience: validatedData.idExperience },
      data: {
        ...(validatedData.titrePoste && { titrePoste: validatedData.titrePoste }),
        ...(validatedData.organisation && { organisation: validatedData.organisation }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.dateDebut && { dateDebut: validatedData.dateDebut }),
        ...(validatedData.dateFin !== undefined && { dateFin: validatedData.dateFin }),
        ...(dureeMois && { dureeMois }),
      },
    });

    revalidatePath("/worker/profile");
    revalidatePath("/worker/cv");

    return { success: true, data: experience };
  } catch (error) {
    console.error("Error updating worker experience:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la modification de l'expérience",
    };
  }
}

/**
 * Delete an experience
 */
export async function deleteWorkerExperience(input: DeleteExperienceInput) {
  try {
    const user = await requireRole("Travailleur");

    // Validate input
    const validatedData = deleteExperienceSchema.parse(input);

    // Get worker ID
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Check if experience belongs to this worker
    const experience = await prisma.experience.findUnique({
      where: { idExperience: validatedData.idExperience },
    });

    if (!experience) {
      throw new Error("Expérience introuvable");
    }

    if (experience.idTravailleur !== worker.idTravailleur) {
      throw new Error("Vous n'êtes pas autorisé à supprimer cette expérience");
    }

    // Delete experience
    await prisma.experience.delete({
      where: { idExperience: validatedData.idExperience },
    });

    revalidatePath("/worker/profile");
    revalidatePath("/worker/cv");

    return { success: true, message: "Expérience supprimée avec succès" };
  } catch (error) {
    console.error("Error deleting worker experience:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression de l'expérience",
    };
  }
}

/**
 * Get total years of experience across all positions
 */
export async function getTotalExperienceYears() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      include: {
        experiences: true,
      },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const totalMonths = worker.experiences.reduce((acc, exp) => {
      return acc + (exp.dureeMois || 0);
    }, 0);

    const totalYears = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;

    return {
      success: true,
      data: {
        totalMonths,
        totalYears,
        remainingMonths,
        formattedDuration: `${totalYears} an${totalYears > 1 ? "s" : ""} ${
          remainingMonths > 0 ? `et ${remainingMonths} mois` : ""
        }`.trim(),
      },
    };
  } catch (error) {
    console.error("Error calculating total experience:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors du calcul de l'expérience totale",
    };
  }
}
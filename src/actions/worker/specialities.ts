// src/actions/worker/specialities.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import {
  addSpecialitySchema,
  deleteSpecialitySchema,
  type AddSpecialityInput,
  type DeleteSpecialityInput,
} from "@/lib/validations/worker";
import { revalidatePath } from "next/cache";

/**
 * Get all available specialty categories
 */
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
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des catégories",
    };
  }
}

/**
 * Get worker's specialties
 */
export async function getWorkerSpecialties() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const specialties = await prisma.specialite.findMany({
      where: { idTravailleur: worker.idTravailleur },
      include: {
        categorie: true,
      },
      orderBy: {
        anneesExperience: "desc",
      },
    });

    return { success: true, data: specialties };
  } catch (error) {
    console.error("Error fetching worker specialties:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des spécialités",
    };
  }
}

/**
 * Add a new specialty to worker's profile
 */
export async function addWorkerSpecialty(input: AddSpecialityInput) {
  try {
    const user = await requireRole("Travailleur");

    // Validate input
    const validatedData = addSpecialitySchema.parse(input);

    // Get worker ID
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Check if specialty category exists
    const category = await prisma.categorieSpecialite.findUnique({
      where: { id: validatedData.idCategorie },
    });

    if (!category) {
      throw new Error("Catégorie de spécialité invalide");
    }

    // Check if worker already has this specialty
    const existingSpecialty = await prisma.specialite.findFirst({
      where: {
        idTravailleur: worker.idTravailleur,
        idCategorie: validatedData.idCategorie,
      },
    });

    if (existingSpecialty) {
      throw new Error("Cette spécialité est déjà ajoutée à votre profil");
    }

    // Create specialty
    const specialty = await prisma.specialite.create({
      data: {
        idTravailleur: worker.idTravailleur,
        idCategorie: validatedData.idCategorie,
        nomSpecialite: category.name, // Keep for legacy compatibility
        niveau: validatedData.niveau,
        anneesExperience: validatedData.anneesExperience,
      },
      include: {
        categorie: true,
      },
    });

    revalidatePath("/worker/profile");
    revalidatePath("/worker/dashboard");

    return { success: true, data: specialty };
  } catch (error) {
    console.error("Error adding worker specialty:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'ajout de la spécialité",
    };
  }
}

/**
 * Delete a specialty from worker's profile
 */
export async function deleteWorkerSpecialty(input: DeleteSpecialityInput) {
  try {
    const user = await requireRole("Travailleur");

    // Validate input
    const validatedData = deleteSpecialitySchema.parse(input);

    // Get worker ID
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Check if specialty belongs to this worker
    const specialty = await prisma.specialite.findUnique({
      where: { idSpecialite: validatedData.idSpecialite },
    });

    if (!specialty) {
      throw new Error("Spécialité introuvable");
    }

    if (specialty.idTravailleur !== worker.idTravailleur) {
      throw new Error("Vous n'êtes pas autorisé à supprimer cette spécialité");
    }

    // Delete specialty
    await prisma.specialite.delete({
      where: { idSpecialite: validatedData.idSpecialite },
    });

    revalidatePath("/worker/profile");
    revalidatePath("/worker/dashboard");

    return { success: true, message: "Spécialité supprimée avec succès" };
  } catch (error) {
    console.error("Error deleting worker specialty:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression de la spécialité",
    };
  }
}

/**
 * Get recommended specialties based on worker's existing specialties
 */
export async function getRecommendedSpecialties() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      include: {
        specialites: true,
      },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Get IDs of specialties worker already has
    const existingCategoryIds = worker.specialites
      .map((s) => s.idCategorie)
      .filter((id): id is number => id !== null);

    // Get all categories except the ones worker already has
    const recommendedCategories = await prisma.categorieSpecialite.findMany({
      where: {
        id: {
          notIn: existingCategoryIds,
        },
      },
      orderBy: {
        id: "asc",
      },
      take: 5, // Limit to 5 recommendations
    });

    return { success: true, data: recommendedCategories };
  } catch (error) {
    console.error("Error fetching recommended specialties:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des recommandations",
    };
  }
}
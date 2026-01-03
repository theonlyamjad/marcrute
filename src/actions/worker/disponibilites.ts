// src/actions/worker/disponibilites.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import {
  addAvailabilitySchema,
  updateAvailabilitySchema,
  deleteAvailabilitySchema,
  type AddAvailabilityInput,
  type UpdateAvailabilityInput,
  type DeleteAvailabilityInput,
} from "@/lib/validations/worker";
import { revalidatePath } from "next/cache";

/**
 * Get worker's availabilities
 */
export async function getWorkerAvailabilities() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const availabilities = await prisma.disponibilite.findMany({
      where: { idTravailleur: worker.idTravailleur },
      orderBy: {
        dateDisponible: "asc",
      },
    });

    return { success: true, data: availabilities };
  } catch (error) {
    console.error("Error fetching worker availabilities:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des disponibilités",
    };
  }
}

/**
 * Get upcoming availabilities (future dates only)
 */
export async function getUpcomingAvailabilities() {
  try {
    const user = await requireRole("Travailleur");

    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availabilities = await prisma.disponibilite.findMany({
      where: {
        idTravailleur: worker.idTravailleur,
        dateDisponible: {
          gte: today,
        },
      },
      orderBy: {
        dateDisponible: "asc",
      },
    });

    return { success: true, data: availabilities };
  } catch (error) {
    console.error("Error fetching upcoming availabilities:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération des disponibilités à venir",
    };
  }
}

/**
 * Add a new availability
 */
export async function addWorkerAvailability(input: AddAvailabilityInput) {
  try {
    const user = await requireRole("Travailleur");

    // Validate input
    const validatedData = addAvailabilitySchema.parse(input);

    // Get worker ID
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Check if availability already exists for this date and time slot
    const existingAvailability = await prisma.disponibilite.findFirst({
      where: {
        idTravailleur: worker.idTravailleur,
        dateDisponible: validatedData.dateDisponible,
        creneau: validatedData.creneau,
      },
    });

    if (existingAvailability) {
      throw new Error("Une disponibilité existe déjà pour cette date et ce créneau");
    }

    // Create availability
    const availability = await prisma.disponibilite.create({
      data: {
        idTravailleur: worker.idTravailleur,
        dateDisponible: validatedData.dateDisponible,
        creneau: validatedData.creneau,
        estDisponible: validatedData.estDisponible,
      },
    });

    revalidatePath("/worker/disponibilites");
    revalidatePath("/worker/profile");

    return { success: true, data: availability };
  } catch (error) {
    console.error("Error adding worker availability:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'ajout de la disponibilité",
    };
  }
}

/**
 * Update an existing availability
 */
export async function updateWorkerAvailability(input: UpdateAvailabilityInput) {
  try {
    const user = await requireRole("Travailleur");

    // Validate input
    const validatedData = updateAvailabilitySchema.parse(input);

    // Get worker ID
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Check if availability belongs to this worker
    const existingAvailability = await prisma.disponibilite.findUnique({
      where: { idDisponibilite: validatedData.idDisponibilite },
    });

    if (!existingAvailability) {
      throw new Error("Disponibilité introuvable");
    }

    if (existingAvailability.idTravailleur !== worker.idTravailleur) {
      throw new Error("Vous n'êtes pas autorisé à modifier cette disponibilité");
    }

    // Update availability
    const availability = await prisma.disponibilite.update({
      where: { idDisponibilite: validatedData.idDisponibilite },
      data: {
        ...(validatedData.dateDisponible && { dateDisponible: validatedData.dateDisponible }),
        ...(validatedData.creneau && { creneau: validatedData.creneau }),
        ...(validatedData.estDisponible !== undefined && { estDisponible: validatedData.estDisponible }),
      },
    });

    revalidatePath("/worker/disponibilites");
    revalidatePath("/worker/profile");

    return { success: true, data: availability };
  } catch (error) {
    console.error("Error updating worker availability:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la modification de la disponibilité",
    };
  }
}

/**
 * Delete an availability
 */
export async function deleteWorkerAvailability(input: DeleteAvailabilityInput) {
  try {
    const user = await requireRole("Travailleur");

    // Validate input
    const validatedData = deleteAvailabilitySchema.parse(input);

    // Get worker ID
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    // Check if availability belongs to this worker
    const availability = await prisma.disponibilite.findUnique({
      where: { idDisponibilite: validatedData.idDisponibilite },
    });

    if (!availability) {
      throw new Error("Disponibilité introuvable");
    }

    if (availability.idTravailleur !== worker.idTravailleur) {
      throw new Error("Vous n'êtes pas autorisé à supprimer cette disponibilité");
    }

    // Delete availability
    await prisma.disponibilite.delete({
      where: { idDisponibilite: validatedData.idDisponibilite },
    });

    revalidatePath("/worker/disponibilites");
    revalidatePath("/worker/profile");

    return { success: true, message: "Disponibilité supprimée avec succès" };
  } catch (error) {
    console.error("Error deleting worker availability:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression de la disponibilité",
    };
  }
}

/**
 * Bulk add availabilities for a date range
 */
export async function addBulkAvailabilities(
  startDate: Date,
  endDate: Date,
  creneaux: string[],
  excludeWeekends: boolean = false
) {
  try {
    const user = await requireRole("Travailleur");

    // Get worker ID
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      throw new Error("Profil travailleur introuvable");
    }

    const availabilities: Array<{
      idTravailleur: string;
      dateDisponible: Date;
      creneau: string;
      estDisponible: boolean;
    }> = [];

    // Generate all dates between start and end
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Skip weekends if requested
      if (excludeWeekends && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Add availability for each time slot
      for (const creneau of creneaux) {
        availabilities.push({
          idTravailleur: worker.idTravailleur,
          dateDisponible: new Date(currentDate),
          creneau,
          estDisponible: true,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create all availabilities
    await prisma.disponibilite.createMany({
      data: availabilities,
      skipDuplicates: true, // Skip if already exists
    });

    revalidatePath("/worker/disponibilites");
    revalidatePath("/worker/profile");

    return {
      success: true,
      message: `${availabilities.length} disponibilités ajoutées avec succès`,
    };
  } catch (error) {
    console.error("Error adding bulk availabilities:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'ajout des disponibilités en masse",
    };
  }
}
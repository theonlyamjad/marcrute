"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ========================================
// VALIDATION SCHEMAS
// ========================================

const createRegionSchema = z.object({
  nomRegion: z.string().min(1),
});

const updateRegionSchema = z.object({
  idRegion: z.string(),
  nomRegion: z.string().min(1),
});

const createVilleSchema = z.object({
  idRegion: z.string(),
  nomVille: z.string().min(1),
  codePostal: z.string().optional(),
});

const updateVilleSchema = z.object({
  idVille: z.string(),
  nomVille: z.string().min(1).optional(),
  codePostal: z.string().optional(),
});

// ========================================
// GET ALL REGIONS
// ========================================

export async function getAllRegions() {
  try {
    await requireRole("Admin");

    const regions = await prisma.region.findMany({
      include: {
        villes: {
          include: {
            _count: {
              select: {
                travailleurs: true,
                institutions: true,
              },
            },
          },
          orderBy: {
            nomVille: "asc",
          },
        },
      },
      orderBy: {
        nomRegion: "asc",
      },
    });

    const formatted = regions.map((r) => ({
      id: r.idRegion,
      nomRegion: r.nomRegion,
      dateCreation: r.dateCreation.toISOString().split("T")[0],
      villes: r.villes.map((v) => ({
        id: v.idVille,
        nomVille: v.nomVille,
        codePostal: v.codePostal,
        count: {
          travailleurs: v._count.travailleurs,
          institutions: v._count.institutions,
        },
      })),
    }));

    return {
      success: true,
      data: formatted,
    };
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

// ========================================
// CREATE REGION
// ========================================

export async function createRegion(
  input: z.infer<typeof createRegionSchema>
) {
  try {
    await requireRole("Admin");

    const validated = createRegionSchema.parse(input);

    await prisma.region.create({
      data: {
        nomRegion: validated.nomRegion,
      },
    });

    revalidatePath("/admin/regions");
    return { success: true };
  } catch (error) {
    console.error("Error creating region:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de la région",
    };
  }
}

// ========================================
// UPDATE REGION
// ========================================

export async function updateRegion(
  input: z.infer<typeof updateRegionSchema>
) {
  try {
    await requireRole("Admin");

    const validated = updateRegionSchema.parse(input);

    await prisma.region.update({
      where: { idRegion: validated.idRegion },
      data: {
        nomRegion: validated.nomRegion,
      },
    });

    revalidatePath("/admin/regions");
    return { success: true };
  } catch (error) {
    console.error("Error updating region:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de la région",
    };
  }
}

// ========================================
// DELETE REGION
// ========================================

export async function deleteRegion(idRegion: string) {
  try {
    await requireRole("Admin");

    // Check if region has cities
    const region = await prisma.region.findUnique({
      where: { idRegion },
      include: {
        _count: {
          select: {
            villes: true,
          },
        },
      },
    });

    if (!region) {
      return {
        success: false,
        error: "Région introuvable",
      };
    }

    if (region._count.villes > 0) {
      return {
        success: false,
        error: "Impossible de supprimer cette région car elle contient des villes",
      };
    }

    await prisma.region.delete({
      where: { idRegion },
    });

    revalidatePath("/admin/regions");
    return { success: true };
  } catch (error) {
    console.error("Error deleting region:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de la région",
    };
  }
}

// ========================================
// CREATE VILLE
// ========================================

export async function createVille(
  input: z.infer<typeof createVilleSchema>
) {
  try {
    await requireRole("Admin");

    const validated = createVilleSchema.parse(input);

    await prisma.ville.create({
      data: {
        idRegion: validated.idRegion,
        nomVille: validated.nomVille,
        codePostal: validated.codePostal,
      },
    });

    revalidatePath("/admin/regions");
    return { success: true };
  } catch (error) {
    console.error("Error creating ville:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de la ville",
    };
  }
}

// ========================================
// UPDATE VILLE
// ========================================

export async function updateVille(
  input: z.infer<typeof updateVilleSchema>
) {
  try {
    await requireRole("Admin");

    const validated = updateVilleSchema.parse(input);

    const updateData: Record<string, unknown> = {};
    if (validated.nomVille !== undefined) {
      updateData.nomVille = validated.nomVille;
    }
    if (validated.codePostal !== undefined) {
      updateData.codePostal = validated.codePostal;
    }

    await prisma.ville.update({
      where: { idVille: validated.idVille },
      data: updateData,
    });

    revalidatePath("/admin/regions");
    return { success: true };
  } catch (error) {
    console.error("Error updating ville:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de la ville",
    };
  }
}

// ========================================
// DELETE VILLE
// ========================================

export async function deleteVille(idVille: string) {
  try {
    await requireRole("Admin");

    // Check if ville is used
    const ville = await prisma.ville.findUnique({
      where: { idVille },
      include: {
        _count: {
          select: {
            travailleurs: true,
            institutions: true,
          },
        },
      },
    });

    if (!ville) {
      return {
        success: false,
        error: "Ville introuvable",
      };
    }

    const totalUsage = ville._count.travailleurs + ville._count.institutions;

    if (totalUsage > 0) {
      return {
        success: false,
        error: `Impossible de supprimer cette ville car elle est utilisée par ${totalUsage} utilisateur(s)`,
      };
    }

    await prisma.ville.delete({
      where: { idVille },
    });

    revalidatePath("/admin/regions");
    return { success: true };
  } catch (error) {
    console.error("Error deleting ville:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de la ville",
    };
  }
}


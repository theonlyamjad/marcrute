"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ========================================
// VALIDATION SCHEMAS
// ========================================

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

const updateCategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
});

// ========================================
// GET ALL CATEGORIES
// ========================================

export async function getAllCategories() {
  try {
    await requireRole("Administrateur");

    const categories = await prisma.categorieSpecialite.findMany({
      include: {
        _count: {
          select: {
            specialitesTravailleur: true,
            specialitesInstitution: true,
            specialitesRequises: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    const formatted = categories.map((c) => ({
      id: c.id,
      name: c.name,
      dateCreation: c.dateCreation.toISOString().split("T")[0],
      count: {
        travailleurs: c._count.specialitesTravailleur,
        institutions: c._count.specialitesInstitution,
        missions: c._count.specialitesRequises,
      },
    }));

    return {
      success: true,
      data: formatted,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
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
// GET CATEGORY BY ID
// ========================================

export async function getCategoryById(id: number) {
  try {
    await requireRole("Administrateur");

    const category = await prisma.categorieSpecialite.findUnique({
      where: { id },
      include: {
        specialitesTravailleur: {
          take: 10,
        },
        specialitesInstitution: {
          take: 10,
        },
        specialitesRequises: {
          take: 10,
        },
      },
    });

    if (!category) {
      return {
        success: false,
        error: "Catégorie introuvable",
      };
    }

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération de la catégorie",
    };
  }
}

// ========================================
// CREATE CATEGORY
// ========================================

export async function createCategory(
  input: z.infer<typeof createCategorySchema>
) {
  try {
    await requireRole("Administrateur");

    const validated = createCategorySchema.parse(input);

    // Get the highest ID and increment
    const lastCategory = await prisma.categorieSpecialite.findFirst({
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
      },
    });

    const newId = lastCategory ? lastCategory.id + 1 : 1;

    await prisma.categorieSpecialite.create({
      data: {
        id: newId,
        name: validated.name,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de la catégorie",
    };
  }
}

// ========================================
// UPDATE CATEGORY
// ========================================

export async function updateCategory(
  input: z.infer<typeof updateCategorySchema>
) {
  try {
    await requireRole("Administrateur");

    const validated = updateCategorySchema.parse(input);

    await prisma.categorieSpecialite.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de la catégorie",
    };
  }
}

// ========================================
// DELETE CATEGORY
// ========================================

export async function deleteCategory(id: number) {
  try {
    await requireRole("Administrateur");

    // Check if category is used
    const category = await prisma.categorieSpecialite.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            specialitesTravailleur: true,
            specialitesInstitution: true,
            specialitesRequises: true,
          },
        },
      },
    });

    if (!category) {
      return {
        success: false,
        error: "Catégorie introuvable",
      };
    }

    const totalUsage =
      category._count.specialitesTravailleur +
      category._count.specialitesInstitution +
      category._count.specialitesRequises;

    if (totalUsage > 0) {
      return {
        success: false,
        error: `Impossible de supprimer cette catégorie car elle est utilisée par ${totalUsage} spécialité(s)`,
      };
    }

    await prisma.categorieSpecialite.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de la catégorie",
    };
  }
}


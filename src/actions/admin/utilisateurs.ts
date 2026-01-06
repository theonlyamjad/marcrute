"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ========================================
// VALIDATION SCHEMAS
// ========================================

const updateUserSchema = z.object({
  idUtilisateur: z.string(),
  nomComplet: z.string().optional(),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  role: z.enum(["Travailleur", "Institution", "Admin"]).optional(),
});

// ========================================
// GET ALL USERS
// ========================================

export async function getAllUsers(filters?: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await requireRole("Admin");

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters?.search) {
      where.OR = [
        { nomComplet: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.role) {
      where.role = filters.role;
    }

    const [users, total] = await Promise.all([
      prisma.utilisateur.findMany({
        where,
        include: {
          travailleur: {
            include: {
              ville: {
                include: {
                  region: true,
                },
              },
            },
          },
          institution: true,
          administrateur: true,
        },
        orderBy: {
          dateCreation: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.utilisateur.count({ where }),
    ]);

    const formatted = users.map((u) => ({
      id: u.idUtilisateur,
      email: u.email,
      nomComplet: u.nomComplet,
      telephone: u.telephone,
      role: u.role,
      dateCreation: u.dateCreation.toISOString().split("T")[0],
      emailVerified: u.emailVerified ? u.emailVerified.toISOString().split("T")[0] : null,
      travailleur: u.travailleur
        ? {
            id: u.travailleur.idTravailleur,
            ville: u.travailleur.ville?.nomVille,
            region: u.travailleur.ville?.region.nomRegion,
            noteMoyenne: u.travailleur.noteMoyenne
              ? Number(u.travailleur.noteMoyenne)
              : 0,
            statutLabel: u.travailleur.statutLabel,
          }
        : null,
      institution: u.institution
        ? {
            id: u.institution.idInstitution,
            nomInstitution: u.institution.nomInstitution,
            ville: u.institution.ville?.nomVille,
          }
        : null,
    }));

    return {
      success: true,
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des utilisateurs",
    };
  }
}

// ========================================
// GET USER BY ID
// ========================================

export async function getUserById(idUtilisateur: string) {
  try {
    await requireRole("Admin");

    const user = await prisma.utilisateur.findUnique({
      where: { idUtilisateur },
      include: {
        travailleur: {
          include: {
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
            diplomes: true,
            experiences: true,
          },
        },
        institution: {
          include: {
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
          },
        },
        administrateur: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Utilisateur introuvable",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération de l'utilisateur",
    };
  }
}

// ========================================
// UPDATE USER
// ========================================

export async function updateUser(
  input: z.infer<typeof updateUserSchema>
) {
  try {
    await requireRole("Admin");

    const validated = updateUserSchema.parse(input);

    const updateData: Record<string, unknown> = {};
    if (validated.nomComplet !== undefined) {
      updateData.nomComplet = validated.nomComplet;
    }
    if (validated.email !== undefined) {
      updateData.email = validated.email;
    }
    if (validated.telephone !== undefined) {
      updateData.telephone = validated.telephone;
    }
    if (validated.role !== undefined) {
      updateData.role = validated.role;
    }

    await prisma.utilisateur.update({
      where: { idUtilisateur: validated.idUtilisateur },
      data: updateData,
    });

    revalidatePath("/admin/utilisateurs");
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de l'utilisateur",
    };
  }
}

// ========================================
// UPDATE USER ROLE
// ========================================

export async function updateUserRole(
  idUtilisateur: string,
  newRole: "Travailleur" | "Institution" | "Admin"
) {
  try {
    await requireRole("Admin");

    await prisma.utilisateur.update({
      where: { idUtilisateur },
      data: { role: newRole },
    });

    revalidatePath("/admin/utilisateurs");
    revalidatePath("/admin/roles");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du rôle",
    };
  }
}

// ========================================
// DELETE USER
// ========================================

export async function deleteUser(idUtilisateur: string) {
  try {
    await requireRole("Admin");

    await prisma.utilisateur.delete({
      where: { idUtilisateur },
    });

    revalidatePath("/admin/utilisateurs");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de l'utilisateur",
    };
  }
}


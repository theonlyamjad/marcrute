"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ========================================
// VALIDATION SCHEMAS
// ========================================

const createBanSchema = z.object({
  idUtilisateur: z.string(),
  titre: z.string().min(1).max(200),
  description: z.string().min(1),
  dureeType: z.enum(["hours", "days", "months", "years", "permanent"]),
  dureeValeur: z.number().int().positive().optional(),
});

// ========================================
// CALCULATE EXPIRATION DATE
// ========================================

function calculateExpirationDate(
  dureeType: string,
  dureeValeur?: number
): Date | null {
  if (dureeType === "permanent") {
    return null;
  }

  if (!dureeValeur) {
    throw new Error("dureeValeur est requis pour les bans temporaires");
  }

  const now = new Date();
  let expiration = new Date(now);

  switch (dureeType) {
    case "hours":
      expiration.setHours(now.getHours() + dureeValeur);
      break;
    case "days":
      expiration.setDate(now.getDate() + dureeValeur);
      break;
    case "months":
      expiration.setMonth(now.getMonth() + dureeValeur);
      break;
    case "years":
      expiration.setFullYear(now.getFullYear() + dureeValeur);
      break;
    default:
      throw new Error("Type de durée invalide");
  }

  return expiration;
}

// ========================================
// CHECK IF USER IS BANNED
// ========================================

export async function checkUserBanStatus(idUtilisateur: string) {
  try {
    const activeBan = await prisma.ban.findFirst({
      where: {
        idUtilisateur,
        estActif: true,
        OR: [
          { dateExpiration: null }, // Permanent ban
          { dateExpiration: { gte: new Date() } }, // Not expired yet
        ],
      },
      include: {
        administrateur: {
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
        dateBan: "desc",
      },
    });

    if (!activeBan) {
      return {
        success: true,
        isBanned: false,
        data: null,
      };
    }

    // Check if ban has expired
    if (activeBan.dateExpiration && activeBan.dateExpiration < new Date()) {
      // Auto-deactivate expired ban
      await prisma.ban.update({
        where: { idBan: activeBan.idBan },
        data: {
          estActif: false,
          dateDesactivation: new Date(),
        },
      });

      return {
        success: true,
        isBanned: false,
        data: null,
      };
    }

    return {
      success: true,
      isBanned: true,
      data: {
        titre: activeBan.titre,
        description: activeBan.description,
        dateBan: activeBan.dateBan.toISOString(),
        dateExpiration: activeBan.dateExpiration?.toISOString() || null,
        isPermanent: activeBan.dureeType === "permanent",
        administrateur:
          activeBan.administrateur?.utilisateur?.nomComplet || "Admin",
      },
    };
  } catch (error) {
    console.error("Error checking ban status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la vérification du ban",
    };
  }
}

// ========================================
// CREATE BAN
// ========================================

export async function createBan(input: z.infer<typeof createBanSchema>) {
  try {
    const user = await requireRole("Administrateur");

    // Get admin ID
    const admin = await prisma.administrateur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idAdministrateur: true },
    });

    if (!admin) {
      return {
        success: false,
        error: "Administrateur introuvable",
      };
    }

    const validated = createBanSchema.parse(input);

    // Check if user exists
    const targetUser = await prisma.utilisateur.findUnique({
      where: { idUtilisateur: validated.idUtilisateur },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "Utilisateur introuvable",
      };
    }

    // Check if user is already banned
    const existingBan = await prisma.ban.findFirst({
      where: {
        idUtilisateur: validated.idUtilisateur,
        estActif: true,
      },
    });

    if (existingBan) {
      return {
        success: false,
        error: "Cet utilisateur est déjà banni",
      };
    }

    // Calculate expiration date
    const dateExpiration = calculateExpirationDate(
      validated.dureeType,
      validated.dureeValeur
    );

    // Create ban
    await prisma.ban.create({
      data: {
        idUtilisateur: validated.idUtilisateur,
        idAdministrateur: admin.idAdministrateur,
        titre: validated.titre,
        description: validated.description,
        dureeType: validated.dureeType,
        dureeValeur: validated.dureeValeur || null,
        dateExpiration,
      },
    });

    revalidatePath("/admin/utilisateurs");
    return { success: true };
  } catch (error) {
    console.error("Error creating ban:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création du ban",
    };
  }
}

// ========================================
// GET ALL BANS
// ========================================

export async function getAllBans(filters?: {
  estActif?: boolean;
  page?: number;
  limit?: number;
}) {
  try {
    await requireRole("Admin");

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters?.estActif !== undefined) {
      where.estActif = filters.estActif;
    }

    const [bans, total] = await Promise.all([
      prisma.ban.findMany({
        where,
        include: {
          utilisateur: {
            select: {
              nomComplet: true,
              email: true,
              role: true,
            },
          },
          administrateur: {
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
          dateBan: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.ban.count({ where }),
    ]);

    const formatted = bans.map((ban) => ({
      id: ban.idBan,
      utilisateur: ban.utilisateur.nomComplet || ban.utilisateur.email,
      email: ban.utilisateur.email,
      role: ban.utilisateur.role,
      titre: ban.titre,
      description: ban.description,
      dureeType: ban.dureeType,
      dureeValeur: ban.dureeValeur,
      dateBan: ban.dateBan.toISOString().split("T")[0],
      dateExpiration: ban.dateExpiration
        ? ban.dateExpiration.toISOString().split("T")[0]
        : null,
      estActif: ban.estActif,
      administrateur:
        ban.administrateur?.utilisateur?.nomComplet || "Inconnu",
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
    console.error("Error fetching bans:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des bans",
    };
  }
}

// ========================================
// DEACTIVATE BAN
// ========================================

export async function deactivateBan(idBan: string) {
  try {
    await requireRole("Admin");

    await prisma.ban.update({
      where: { idBan },
      data: {
        estActif: false,
        dateDesactivation: new Date(),
      },
    });

    revalidatePath("/admin/utilisateurs");
    revalidatePath("/admin/bans");
    return { success: true };
  } catch (error) {
    console.error("Error deactivating ban:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la désactivation du ban",
    };
  }
}

// ========================================
// GET USER BANS
// ========================================

export async function getUserBans(idUtilisateur: string) {
  try {
    await requireRole("Admin");

    const bans = await prisma.ban.findMany({
      where: { idUtilisateur },
      include: {
        administrateur: {
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
        dateBan: "desc",
      },
    });

    return {
      success: true,
      data: bans,
    };
  } catch (error) {
    console.error("Error fetching user bans:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des bans",
    };
  }
}
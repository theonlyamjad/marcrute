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

const updateInstitutionSchema = z.object({
  nomInstitution: z.string().min(1, "Le nom est requis").max(200).optional(),
  adresse: z.string().max(500).optional().nullable(),
  localisation: z.string().max(200).optional().nullable(),
  url: z.string().url("URL invalide").optional().nullable(),
  telephoneInstitution: z
    .string()
    .regex(/^(\+212|0)[5-7]\d{8}$/, "Numéro invalide")
    .optional()
    .nullable(),
  siteWeb: z.string().url("URL invalide").optional().nullable(),
  idVille: z.string().optional().nullable(),
});

const updateUserSchema = z.object({
  nomComplet: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100).optional(),
  telephone: z
    .string()
    .regex(/^(\+212|0)[5-7]\d{8}$/, "Numéro invalide")
    .optional()
    .nullable(),
});

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// ========================================
// GET INSTITUTION PROFILE
// ========================================

export async function getInstitutionProfile() {
  try {
    const user = await requireRole("Institution");
    const institution = await prisma.institution.findUnique({
      where: { idUtilisateur: user.id },
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
      },
    });

    if (!institution) {
      // Créer l'institution si elle n'existe pas
      const newInstitution = await prisma.institution.create({
        data: {
          idUtilisateur: user.id,
          nomInstitution: user.nomComplet || "Institution",
        },
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
        },
      });

      return {
        success: true,
        data: {
          institution: {
            nomInstitution: newInstitution.nomInstitution,
            adresse: newInstitution.adresse || "",
            localisation: newInstitution.localisation || "",
            url: newInstitution.url || "",
            telephoneInstitution: newInstitution.telephoneInstitution || "",
            siteWeb: newInstitution.siteWeb || "",
            idVille: newInstitution.idVille || null,
            ville: newInstitution.ville
              ? {
                  idVille: newInstitution.ville.idVille,
                  nomVille: newInstitution.ville.nomVille,
                  region: {
                    idRegion: newInstitution.ville.region.idRegion,
                    nomRegion: newInstitution.ville.region.nomRegion,
                  },
                }
              : null,
          },
          user: {
            nomComplet: newInstitution.utilisateur.nomComplet || "",
            email: newInstitution.utilisateur.email,
            telephone: newInstitution.utilisateur.telephone || "",
          },
        },
      };
    }

    return {
      success: true,
      data: {
        institution: {
          nomInstitution: institution.nomInstitution,
          adresse: institution.adresse || "",
          localisation: institution.localisation || "",
          url: institution.url || "",
          telephoneInstitution: institution.telephoneInstitution || "",
          siteWeb: institution.siteWeb || "",
          idVille: institution.idVille || null,
          ville: institution.ville
            ? {
                idVille: institution.ville.idVille,
                nomVille: institution.ville.nomVille,
                region: {
                  idRegion: institution.ville.region.idRegion,
                  nomRegion: institution.ville.region.nomRegion,
                },
              }
            : null,
        },
        user: {
          nomComplet: institution.utilisateur.nomComplet || "",
          email: institution.utilisateur.email,
          telephone: institution.utilisateur.telephone || "",
        },
      },
    };
  } catch (error) {
    console.error("Error fetching institution profile:", error);
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
// UPDATE INSTITUTION
// ========================================

export async function updateInstitution(
  input: z.infer<typeof updateInstitutionSchema>
) {
  try {
    const user = await requireRole("Institution");
    const institution = await getInstitution(user.id);

    // Valider les données
    const validatedData = updateInstitutionSchema.parse(input);

    // Mettre à jour l'institution
    await prisma.institution.update({
      where: { idInstitution: institution.idInstitution },
      data: {
        ...(validatedData.nomInstitution && {
          nomInstitution: validatedData.nomInstitution,
        }),
        ...(validatedData.adresse !== undefined && {
          adresse: validatedData.adresse,
        }),
        ...(validatedData.localisation !== undefined && {
          localisation: validatedData.localisation,
        }),
        ...(validatedData.url !== undefined && { url: validatedData.url }),
        ...(validatedData.telephoneInstitution !== undefined && {
          telephoneInstitution: validatedData.telephoneInstitution,
        }),
        ...(validatedData.siteWeb !== undefined && {
          siteWeb: validatedData.siteWeb,
        }),
        ...(validatedData.idVille !== undefined && {
          idVille: validatedData.idVille,
        }),
      },
    });

    revalidatePath("/enterprise/settings");
    revalidatePath("/enterprise/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error updating institution:", error);
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
          : "Erreur lors de la mise à jour de l'institution",
    };
  }
}

// ========================================
// UPDATE USER PROFILE
// ========================================

export async function updateUserProfile(
  input: z.infer<typeof updateUserSchema>
) {
  try {
    const user = await requireRole("Institution");

    // Valider les données
    const validatedData = updateUserSchema.parse(input);

    // Mettre à jour l'utilisateur
    await prisma.utilisateur.update({
      where: { idUtilisateur: user.id },
      data: {
        ...(validatedData.nomComplet && {
          nomComplet: validatedData.nomComplet,
        }),
        ...(validatedData.telephone !== undefined && {
          telephone: validatedData.telephone,
        }),
      },
    });

    revalidatePath("/enterprise/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
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
          : "Erreur lors de la mise à jour du profil",
    };
  }
}

// ========================================
// UPDATE PASSWORD
// ========================================

export async function updatePassword(
  input: z.infer<typeof updatePasswordSchema>
) {
  try {
    const user = await requireRole("Institution");
    const bcrypt = await import("bcryptjs");

    // Valider les données
    const validatedData = updatePasswordSchema.parse(input);

    // Vérifier le mot de passe actuel
    const currentUser = await prisma.utilisateur.findUnique({
      where: { idUtilisateur: user.id },
      select: { hashMotDePasse: true },
    });

    if (!currentUser?.hashMotDePasse) {
      throw new Error("Aucun mot de passe défini");
    }

    const passwordMatch = await bcrypt.compare(
      validatedData.currentPassword,
      currentUser.hashMotDePasse
    );

    if (!passwordMatch) {
      throw new Error("Mot de passe actuel incorrect");
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.utilisateur.update({
      where: { idUtilisateur: user.id },
      data: { hashMotDePasse: hashedPassword },
    });

    revalidatePath("/enterprise/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
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
          : "Erreur lors de la mise à jour du mot de passe",
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




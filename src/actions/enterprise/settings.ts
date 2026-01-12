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
    institution = await prisma.institution.create({
      data: {
        idUtilisateur: userId,
        nomInstitution: "Institution",
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
  url: z.string().max(500).optional().nullable(), // Changed from URL validation to allow Google Maps links
  telephoneInstitution: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        // Allow null, undefined, or empty string
        if (!val || val.trim() === "") return true;
        // Remove spaces and validate format
        const cleaned = val.replace(/\s/g, '');
        return /^(\+212|0)[5-7]\d{8}$/.test(cleaned);
      },
      {
        message: "Numéro de téléphone invalide (format: +212XXXXXXXXX ou 0XXXXXXXXX)"
      }
    )
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      return val.replace(/\s/g, '').trim();
    }),
  siteWeb: z
    .string()
    .refine(
      (val) => !val || val === "" || /^https?:\/\/.+/.test(val),
      "L'URL du site web doit commencer par http:// ou https://"
    )
    .optional()
    .nullable(),
  idVille: z.string().min(1, "Veuillez sélectionner une ville").optional(),
});

const updateUserSchema = z.object({
  nomComplet: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .optional(),
  telephone: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        // Allow null, undefined, or empty string
        if (!val || val.trim() === "") return true;
        // Remove spaces and validate format
        const cleaned = val.replace(/\s/g, '');
        return /^(\+212|0)[5-7]\d{8}$/.test(cleaned);
      },
      {
        message: "Numéro de téléphone invalide (format: +212XXXXXXXXX ou 0XXXXXXXXX)"
      }
    )
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      return val.replace(/\s/g, '').trim();
    }),
});

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z
      .string()
      .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
      ),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
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
    
    let institution = await prisma.institution.findUnique({
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

    // Create institution if it doesn't exist
    if (!institution) {
      institution = await prisma.institution.create({
        data: {
          idUtilisateur: user.id,
          nomInstitution: "Institution",
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
    }

    return {
      success: true,
      data: {
        institution: {
          nomInstitution: institution.nomInstitution,
          adresse: institution.adresse || "",
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
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return {
        success: false,
        error: "Vous devez être connecté en tant qu'institution",
      };
    }
    
    return {
      success: false,
      error: "Erreur lors de la récupération du profil. Veuillez réessayer.",
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

    // Validate data
    const validatedData = updateInstitutionSchema.parse(input);

    // Check if ville exists if provided
    if (validatedData.idVille) {
      const villeExists = await prisma.ville.findUnique({
        where: { idVille: validatedData.idVille },
      });

      if (!villeExists) {
        return {
          success: false,
          error: "La ville sélectionnée n'existe pas",
        };
      }
    }

    // Update institution
    await prisma.institution.update({
      where: { idInstitution: institution.idInstitution },
      data: {
        ...(validatedData.nomInstitution && {
          nomInstitution: validatedData.nomInstitution,
        }),
        adresse: validatedData.adresse || null,
        url: validatedData.url || null,
        telephoneInstitution: validatedData.telephoneInstitution || null,
        siteWeb: validatedData.siteWeb || null,
        idVille: validatedData.idVille || null,
      },
    });

    revalidatePath("/enterprise/settings");
    revalidatePath("/enterprise/dashboard");

    return { 
      success: true,
      message: "Informations de l'institution mises à jour avec succès"
    };
  } catch (error) {
    console.error("Error updating institution:", error);
    
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError.message,
      };
    }
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return {
        success: false,
        error: "Vous devez être connecté en tant qu'institution",
      };
    }
    
    return {
      success: false,
      error: "Erreur lors de la mise à jour. Veuillez vérifier vos informations et réessayer.",
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

    // Validate data
    const validatedData = updateUserSchema.parse(input);

    // Update user
    await prisma.utilisateur.update({
      where: { idUtilisateur: user.id },
      data: {
        ...(validatedData.nomComplet && {
          nomComplet: validatedData.nomComplet,
        }),
        telephone: validatedData.telephone || null,
      },
    });

    revalidatePath("/enterprise/settings");

    return { 
      success: true,
      message: "Profil utilisateur mis à jour avec succès"
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError.message,
      };
    }
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return {
        success: false,
        error: "Vous devez être connecté",
      };
    }
    
    return {
      success: false,
      error: "Erreur lors de la mise à jour du profil. Veuillez réessayer.",
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

    // Validate data
    const validatedData = updatePasswordSchema.parse(input);

    // Get current user with password
    const currentUser = await prisma.utilisateur.findUnique({
      where: { idUtilisateur: user.id },
      select: { hashMotDePasse: true },
    });

    if (!currentUser?.hashMotDePasse) {
      return {
        success: false,
        error: "Aucun mot de passe n'est défini pour ce compte",
      };
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(
      validatedData.currentPassword,
      currentUser.hashMotDePasse
    );

    if (!passwordMatch) {
      return {
        success: false,
        error: "Le mot de passe actuel est incorrect",
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // Update password
    await prisma.utilisateur.update({
      where: { idUtilisateur: user.id },
      data: { hashMotDePasse: hashedPassword },
    });

    revalidatePath("/enterprise/settings");

    return { 
      success: true,
      message: "Mot de passe mis à jour avec succès"
    };
  } catch (error) {
    console.error("Error updating password:", error);
    
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError.message,
      };
    }
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return {
        success: false,
        error: "Vous devez être connecté",
      };
    }
    
    return {
      success: false,
      error: "Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.",
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

    if (!regions || regions.length === 0) {
      return {
        success: false,
        error: "Aucune région disponible",
      };
    }

    return { 
      success: true, 
      data: regions 
    };
  } catch (error) {
    console.error("Error fetching regions:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des régions. Veuillez réessayer.",
    };
  }
}

// ========================================
// CHECK PROFILE COMPLETENESS
// ========================================

/**
 * Check if institution profile is complete
 * Required fields: nomInstitution, adresse, telephoneInstitution, idVille
 */
export async function isInstitutionProfileComplete() {
  try {
    const user = await requireRole("Institution");
    
    const institution = await prisma.institution.findUnique({
      where: { idUtilisateur: user.id },
      include: {
        utilisateur: {
          select: {
            nomComplet: true,
            telephone: true,
          },
        },
      },
    });

    if (!institution) {
      return { success: true, data: { isComplete: false, missingFields: [] } };
    }

    const missingFields: string[] = [];

    // Check required fields
    if (!institution.nomInstitution || institution.nomInstitution.trim() === "" || institution.nomInstitution === "Institution") {
      missingFields.push("nomInstitution");
    }
    if (!institution.adresse || institution.adresse.trim() === "") {
      missingFields.push("adresse");
    }
    if (!institution.telephoneInstitution || institution.telephoneInstitution.trim() === "") {
      missingFields.push("telephoneInstitution");
    }
    if (!institution.idVille) {
      missingFields.push("idVille");
    }

    const isComplete = missingFields.length === 0;

    return { 
      success: true, 
      data: { 
        isComplete, 
        missingFields 
      } 
    };
  } catch (error) {
    console.error("Error checking institution profile completeness:", error);
    return {
      success: false,
      error: "Erreur lors de la vérification du profil",
    };
  }
}



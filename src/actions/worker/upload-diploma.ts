// src/actions/worker/upload-diploma.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface UploadDiplomaInput {
  nomDiplome: string;
  nomInstitution: string;
  pdfFile: string; // base64 encoded PDF
  fileName: string;
  fileSize: number;
}

/**
 * Upload diploma with PDF file stored as base64 in database
 */
export async function uploadDiploma(input: UploadDiplomaInput) {
  try {
    const user = await requireRole("Travailleur");

    // Validate file size (max 5MB)
    if (input.fileSize > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "Le fichier ne doit pas dépasser 5MB",
      };
    }

    // Validate file is PDF
    if (!input.fileName.toLowerCase().endsWith('.pdf')) {
      return {
        success: false,
        error: "Seuls les fichiers PDF sont acceptés",
      };
    }

    // Get worker ID
    const worker = await prisma.travailleur.findUnique({
      where: { idUtilisateur: user.id },
      select: { idTravailleur: true },
    });

    if (!worker) {
      return {
        success: false,
        error: "Profil travailleur introuvable",
      };
    }

    // Store PDF as base64 with metadata
    const fileData = {
      base64: input.pdfFile,
      fileName: input.fileName,
      fileSize: input.fileSize,
      uploadDate: new Date().toISOString(),
    };

    // Create diploma with file stored as JSON string
    const diploma = await prisma.diplome.create({
      data: {
        idTravailleur: worker.idTravailleur,
        nomDiplome: input.nomDiplome,
        nomInstitution: input.nomInstitution,
        cheminFichier: JSON.stringify(fileData), // Store as JSON string
        statut: "En attente", // Default status for admin verification
      },
    });

    revalidatePath("/worker/profile");
    revalidatePath("/worker/cv");
    revalidatePath("/worker/onboarding");

    return {
      success: true,
      data: diploma,
      message: "Diplôme téléchargé avec succès. En attente de vérification.",
    };
  } catch (error) {
    console.error("Error uploading diploma:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors du téléchargement",
    };
  }
}

/**
 * Get diploma PDF file
 */
export async function getDiplomaPDF(idDiplome: string) {
  try {
    const user = await requireRole("Travailleur");

    const diploma = await prisma.diplome.findUnique({
      where: { idDiplome },
      include: {
        travailleur: {
          select: { idUtilisateur: true },
        },
      },
    });

    if (!diploma) {
      return {
        success: false,
        error: "Diplôme introuvable",
      };
    }

    // Verify ownership
    if (diploma.travailleur.idUtilisateur !== user.id) {
      return {
        success: false,
        error: "Accès non autorisé",
      };
    }

    if (!diploma.cheminFichier) {
      return {
        success: false,
        error: "Aucun fichier disponible",
      };
    }

    try {
      const fileData = JSON.parse(diploma.cheminFichier);
      return {
        success: true,
        data: fileData,
      };
    } catch {
      return {
        success: false,
        error: "Fichier corrompu",
      };
    }
  } catch (error) {
    console.error("Error getting diploma PDF:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération du fichier",
    };
  }
}

/**
 * Delete diploma (admin only or owner if pending)
 */
export async function deleteDiplomaWithFile(idDiplome: string) {
  try {
    const user = await requireRole("Travailleur");

    const diploma = await prisma.diplome.findUnique({
      where: { idDiplome },
      include: {
        travailleur: {
          select: { idUtilisateur: true },
        },
      },
    });

    if (!diploma) {
      return {
        success: false,
        error: "Diplôme introuvable",
      };
    }

    // Only allow deletion of own diplomas
    if (diploma.travailleur.idUtilisateur !== user.id) {
      return {
        success: false,
        error: "Accès non autorisé",
      };
    }

    // Delete diploma
    await prisma.diplome.delete({
      where: { idDiplome },
    });

    revalidatePath("/worker/profile");
    revalidatePath("/worker/cv");

    return {
      success: true,
      message: "Diplôme supprimé avec succès",
    };
  } catch (error) {
    console.error("Error deleting diploma:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression",
    };
  }
}
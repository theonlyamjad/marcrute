import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * API Route pour afficher le PDF du diplôme (admin uniquement)
 * Gère deux formats de stockage : URL publique ou base64 en base de données
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ idDiplome: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "Administrateur") {
      return NextResponse.json(
        { error: "Non autorisé - accès administrateur requis" },
        { status: 403 }
      );
    }

    const { idDiplome } = await params;
    if (!idDiplome) {
      return NextResponse.json(
        { error: "ID du diplôme manquant" },
        { status: 400 }
      );
    }

    const diplome = await prisma.diplome.findUnique({
      where: { idDiplome },
    });

    if (!diplome) {
      return NextResponse.json(
        { error: "Diplôme introuvable" },
        { status: 404 }
      );
    }

    if (!diplome.cheminFichier) {
      return NextResponse.json(
        { error: "Aucun fichier associé à ce diplôme" },
        { status: 404 }
      );
    }

    const getContentType = (filename: string) => {
      const ext = filename.split(".").pop()?.toLowerCase();
      if (ext === "pdf") return "application/pdf";
      if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
      if (ext === "png") return "image/png";
      return "application/octet-stream";
    };

    // Cas 1: cheminFichier est une URL publique (ex: /uploads/diplomas/xxx.pdf)
    if (
      diplome.cheminFichier.startsWith("/") &&
      !diplome.cheminFichier.startsWith("//")
    ) {
      const filePath = join(process.cwd(), "public", diplome.cheminFichier);
      try {
        const fileBuffer = await readFile(filePath);
        const contentType = getContentType(diplome.cheminFichier);
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `inline; filename="diplome-${idDiplome}"`,
          },
        });
      } catch {
        return NextResponse.json(
          { error: "Fichier non trouvé sur le serveur" },
          { status: 404 }
        );
      }
    }

    // Cas 2: cheminFichier est du JSON avec base64 (upload-diploma.ts)
    try {
      const fileData = JSON.parse(diplome.cheminFichier);
      if (fileData.base64) {
        const buffer = Buffer.from(fileData.base64, "base64");
        const contentType = fileData.fileName
          ? getContentType(fileData.fileName)
          : "application/pdf";
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `inline; filename="diplome-${idDiplome}"`,
          },
        });
      }
    } catch {
      // Pas du JSON valide
    }

    return NextResponse.json(
      { error: "Format de fichier non pris en charge" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erreur récupération diplôme:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du diplôme" },
      { status: 500 }
    );
  }
}

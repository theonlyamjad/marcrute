//src/app/api/admin/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

// Liste des tables disponibles avec leurs noms d'affichage
const TABLES = [
  { value: "utilisateurs", label: "Utilisateurs", model: "utilisateur" },
  { value: "travailleurs", label: "Travailleurs", model: "travailleur" },
  { value: "institutions", label: "Institutions", model: "institution" },
  {
    value: "administrateurs",
    label: "Administrateurs",
    model: "administrateur",
  },
  { value: "regions", label: "Régions", model: "region" },
  { value: "villes", label: "Villes", model: "ville" },
  {
    value: "categories_specialites",
    label: "Catégories de Spécialités",
    model: "categorieSpecialite",
  },
  { value: "experiences", label: "Expériences", model: "experience" },
  { value: "diplomes", label: "Diplômes", model: "diplome" },
  { value: "specialites", label: "Spécialités", model: "specialite" },
  {
    value: "specialites_institutions",
    label: "Spécialités Institutions",
    model: "specialiteInstitution",
  },
  { value: "disponibilites", label: "Disponibilités", model: "disponibilite" },
  { value: "missions", label: "Missions", model: "mission" },
  {
    value: "specialites_requises",
    label: "Spécialités Requises",
    model: "specialiteRequise",
  },
  { value: "candidatures", label: "Candidatures", model: "candidature" },
  { value: "evaluations", label: "Évaluations", model: "evaluation" },
  { value: "validations", label: "Validations", model: "validation" },
  { value: "signalements", label: "Signalements", model: "signalement" },
  { value: "accounts", label: "Comptes", model: "account" },
  { value: "sessions", label: "Sessions", model: "session" },
  {
    value: "verification_tokens",
    label: "Tokens de Vérification",
    model: "verificationToken",
  },
];

// GET - Liste les tables disponibles
export async function GET() {
  try {
    return NextResponse.json({ tables: TABLES });
  } catch (error) {
    console.error("Erreur lors de la récupération des tables:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des tables" },
      { status: 500 }
    );
  }
}

// POST - Exporte les données d'une table
export async function POST(request: NextRequest) {
  try {
    const { table, format } = await request.json();

    if (!table || !format) {
      return NextResponse.json(
        { error: "Table et format requis" },
        { status: 400 }
      );
    }

    // Trouver la table correspondante
    const tableInfo = TABLES.find((t) => t.value === table);
    if (!tableInfo) {
      return NextResponse.json({ error: "Table non trouvée" }, { status: 404 });
    }

    // Récupérer les données depuis Prisma
    const modelName = tableInfo.model as keyof typeof prisma;
    const model = prisma[modelName] as {
      findMany: () => Promise<Record<string, unknown>[]>;
    };

    if (!model || typeof model.findMany !== "function") {
      return NextResponse.json({ error: "Modèle non trouvé" }, { status: 404 });
    }

    // Récupérer toutes les données
    const data = await model.findMany();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée trouvée" },
        { status: 404 }
      );
    }

    // Convertir les données en format plat pour l'export
    const flatData = data.map((item: Record<string, unknown>) => {
      const flat: Record<string, string | number | boolean> = {};
      for (const [key, value] of Object.entries(item)) {
        if (value === null || value === undefined) {
          flat[key] = "";
        } else if (value instanceof Date) {
          flat[key] = value.toISOString();
        } else if (typeof value === "object") {
          flat[key] = JSON.stringify(value);
        } else {
          flat[key] = value as string | number | boolean;
        }
      }
      return flat;
    });

    if (format === "csv") {
      // Générer CSV
      const headers = Object.keys(flatData[0]);
      const csvRows = [
        headers.join(","),
        ...flatData.map((row: Record<string, string | number | boolean>) =>
          headers
            .map((header) => {
              const value = row[header] || "";
              const stringValue = String(value);
              // Échapper les guillemets et les virgules
              if (
                stringValue.includes(",") ||
                stringValue.includes('"') ||
                stringValue.includes("\n")
              ) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            })
            .join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      return new NextResponse(blob, {
        headers: {
          "Content-Type": "text/csv;charset=utf-8;",
          "Content-Disposition": `attachment; filename="${tableInfo.label}_${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    } else if (format === "excel" || format === "xlsx") {
      // Générer Excel
      const worksheet = XLSX.utils.json_to_sheet(flatData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, tableInfo.label);

      const excelBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      return new NextResponse(excelBuffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${tableInfo.label}_${
            new Date().toISOString().split("T")[0]
          }.xlsx"`,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Format non supporté" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de l'export:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'export des données" },
      { status: 500 }
    );
  }
}

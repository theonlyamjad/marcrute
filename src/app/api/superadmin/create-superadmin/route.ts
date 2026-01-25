import { NextRequest, NextResponse } from "next/server";
import { createSuperAdmin } from "@/actions/superadmin/create-superadmin";

export async function POST(req: NextRequest) {
  try {
    const { email, password, prenom, nom } = await req.json();

    // Validation
    if (!email || !password || !prenom || !nom) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    const result = await createSuperAdmin(email, password, prenom, nom);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur lors de la création du superadmin:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
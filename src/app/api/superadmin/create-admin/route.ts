import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est un SuperAdmin
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { idUtilisateur: session.user.id },
    });

    if (!superAdmin) {
      return NextResponse.json(
        { error: "Accès refusé. Vous devez être Super Admin." },
        { status: 403 }
      );
    }

    // Récupérer les données du formulaire
    const { email, prenom, nom, telephone, password, confirmPassword } = await req.json();

    // Validation
    if (!email || !prenom || !nom || !password || !confirmPassword) {
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

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Les mots de passe ne correspondent pas" },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Hash le mot de passe fourni
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur et l'administrateur en transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur
      const newUser = await tx.utilisateur.create({
        data: {
          email,
          prenom,
          nom,
          nomComplet: `${prenom} ${nom}`,
          telephone: telephone || null,
          role: "Administrateur",
          hashMotDePasse: hashedPassword,
          emailVerified: new Date(), // Auto-vérifier l'email pour les admins créés par superadmin
        },
      });

      // Créer l'administrateur
      const newAdmin = await tx.administrateur.create({
        data: {
          idUtilisateur: newUser.idUtilisateur,
          idSuperAdmin: superAdmin.idSuperAdmin,
        },
      });

      return { user: newUser, admin: newAdmin };
    });

    return NextResponse.json({
      success: true,
      message: "Administrateur créé avec succès",
      admin: {
        id: result.admin.idAdministrateur,
        email: result.user.email,
        name: result.user.nomComplet,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'admin:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création" },
      { status: 500 }
    );
  }
}
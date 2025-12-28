"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function signInEntrepriseAction(email: string, password: string) {
  const user = await prisma.utilisateur.findUnique({ where: { email } });

  if (!user || !user.hashMotDePasse) {
    return { error: "Identifiants invalides" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.hashMotDePasse);
  if (!isPasswordValid) {
    return { error: "Identifiants invalides" };
  }

  if (!user.emailVerified) {
    return { error: "Veuillez vérifier votre email avant de vous connecter." };
  }

  if (user.role === "Institution") {
    return { success: true, redirectTo: "/enterprise/dashboard" };
  } else if (user.role === "Travailleur") {
    return { success: true, redirectTo: "/worker/dashboard" };
  }

  return { success: true, redirectTo: "/" };
}

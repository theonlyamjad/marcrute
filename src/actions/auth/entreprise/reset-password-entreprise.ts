"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function resetPasswordAction(token: string, password: string) {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return { error: "Token invalide ou expiré" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.utilisateur.update({
      where: { email: verificationToken.identifier },
      data: { hashMotDePasse: hashedPassword },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return { message: "Mot de passe réinitialisé avec succès !" };
  } catch (err) {
    console.error(err);
    return { error: "Erreur serveur, veuillez réessayer." };
  }
}

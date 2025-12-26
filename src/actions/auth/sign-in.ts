"use server"

import { signIn } from "@/app/api/auth/[...nextauth]/route";
import { AuthError } from "next-auth";

export async function signInAction(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Identifiants invalides" };
        default:
          return { error: "Une erreur est survenue" };
      }
    }
    throw error;
  }
}
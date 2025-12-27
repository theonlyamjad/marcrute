"use server"

import { signIn, auth } from "@/app/api/auth/[...nextauth]/route";
import { AuthError } from "next-auth";

export async function signInAction(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // Get session to determine redirect based on role
    const session = await auth();
    
    if (session?.user?.role === "Travailleur") {
      return { success: true, redirectTo: "/worker/dashboard" };
    } else if (session?.user?.role === "Institution") {
      return { success: true, redirectTo: "/enterprise/dashboard" };
    }

    return { success: true, redirectTo: "/" };
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
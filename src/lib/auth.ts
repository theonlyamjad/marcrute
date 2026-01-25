import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    // Rediriger vers la page de connexion appropriée
    // Le middleware devrait normalement gérer cela, mais on fait une double vérification
    redirect("/worker/sign-in");
  }

  return user;
}

export async function requireRole(
  role: "Travailleur" | "Institution" | "Administrateur" | "SuperAdmin",
) {
  const user = await getCurrentUser();

  if (!user) {
    // Pour les routes superadmin, rediriger vers la page d'accueil
    if (role === "SuperAdmin") {
      redirect("/");
    }
    // Pour les autres rôles, rediriger vers la page de connexion appropriée
    redirect("/worker/sign-in");
  }

  if (user.role !== role) {
    if (user.role === "Travailleur") {
      redirect("/worker/dashboard");
    } else if (user.role === "Institution") {
      redirect("/enterprise/dashboard");
    } else {
      redirect("/admin/dashboard");
    }
  }

  return user;
}

export async function isWorker() {
  const user = await getCurrentUser();
  return user?.role === "Travailleur";
}

export async function isEnterprise() {
  const user = await getCurrentUser();
  return user?.role === "Institution";
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "Administrateur";
}

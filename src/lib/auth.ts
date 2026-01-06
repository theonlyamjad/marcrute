import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/worker/sign-in");
  }
  
  return user;
}

export async function requireRole(role: "Travailleur" | "Institution" | "Administrateur") {
  const user = await requireAuth();
  
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
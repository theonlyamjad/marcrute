import { requireRole } from "@/lib/auth";
import { AdminLayoutClient } from "./layout-client";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Vérifier que l'utilisateur est un administrateur
  await requireRole("Administrateur");

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

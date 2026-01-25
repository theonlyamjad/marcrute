import { requireRole } from "@/lib/auth";

export default async function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Vérifier que l'utilisateur est un SuperAdmin
  await requireRole("SuperAdmin");

  return <>{children}</>;
}
import { requireRole } from "@/lib/auth";

export default async function EnterpriseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Vérifier que l'utilisateur est une institution
  await requireRole("Institution");

  return (
    <div>
      {children}
    </div>
  );
}

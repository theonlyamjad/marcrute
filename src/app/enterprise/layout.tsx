import { requireRole } from "@/lib/auth";
import { EnterpriseLayoutClient } from "./layout-client";

export default async function EnterpriseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireRole("Institution");
  
  return (
    <EnterpriseLayoutClient>
      {children}
    </EnterpriseLayoutClient>
  );
}
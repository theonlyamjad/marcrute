import { WorkerNavbar } from "@/components/ui/worker/Workernavbar";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";

function getInitials(name: string | null): string {
  if (!name) return "U";
  
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require worker role - will redirect if not authenticated
  const user = await requireRole("Travailleur");

  if (!user) {
    redirect("/worker/sign-in");
  }

  // Prepare user data for navbar
  const userData = {
    nomComplet: user.name || null,
    email: user.email || "",
    initials: getInitials(user.name || user.email || ""),
  };

  return (
    <div className="min-h-screen bg-[#F3F4F4]">
      <WorkerNavbar user={userData} />
      <main>{children}</main>
    </div>
  );
}
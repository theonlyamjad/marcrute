import { WorkerNavbar } from "@/components/ui/worker/Workernavbar";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <WorkerNavbar />
      <main>{children}</main>
    </div>
  );
}
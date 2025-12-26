import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/worker/sign-in");
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          🎉 Bienvenue, {session.user?.name}!
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <p className="text-gray-600">Email:</p>
            <p className="font-semibold">{session.user?.email}</p>
          </div>
          
          <div>
            <p className="text-gray-600">Rôle:</p>
            <p className="font-semibold">{session.user?.role}</p>
          </div>
          
          <div>
            <p className="text-gray-600">ID:</p>
            <p className="font-mono text-sm">{session.user?.id}</p>
          </div>
        </div>

        <div className="mt-6">
          <a 
            href="/api/auth/signout"
            className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Se déconnecter
          </a>
        </div>
      </div>
    </div>
  );
}
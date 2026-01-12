import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#061E29] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8 relative w-full h-64 md:h-96">
          <Image
            src="/assets/images/404-not-found.png"
            alt="404 Page non trouvée"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-[#5F9598] mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-[#F3F4F4] mb-4">
          Page non trouvée
        </h2>
        <p className="text-[#5F9598] mb-8 text-lg">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-[#1D546D] text-[#F3F4F4] rounded-lg hover:bg-[#5F9598] transition-colors font-medium"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#061E29] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8 relative w-full h-64 md:h-96">
          <Image
            src="/assets/images/error-general.png"
            alt="Erreur"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-[#5F9598] mb-4">
          Oups!
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-[#F3F4F4] mb-4">
          Une erreur s'est produite
        </h2>
        <p className="text-[#5F9598] mb-8 text-lg">
          Quelque chose s'est mal passé. Veuillez réessayer.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/"
            className="px-8 py-3 border-2 border-[#5F9598] text-[#F3F4F4] rounded-lg hover:bg-[#1D546D] transition-colors font-medium"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[#061E29] flex items-center justify-center px-4">
          <div className="text-center max-w-2xl">
            <div className="mb-8 relative w-full h-64 md:h-96 mx-auto">
              <img
                src="/assets/images/error-critical.png"
                alt="Erreur critique"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-[#5F9598] mb-4">
              Erreur
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#F3F4F4] mb-4">
              Erreur système
            </h2>
            <p className="text-[#5F9598] mb-8 text-lg">
              Une erreur critique s'est produite. Veuillez actualiser la page.
            </p>
            <button
              onClick={reset}
              className="px-8 py-3 bg-[#1D546D] text-[#F3F4F4] rounded-lg hover:bg-[#5F9598] transition-colors font-medium"
            >
              Actualiser
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
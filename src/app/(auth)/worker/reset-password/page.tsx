"use client";

import { useState } from "react";
import InputForm from "@/components/Form/inputForm";
import { Button } from "@/components/ui/button";
import { resetPasswordAction } from "@/actions/auth/worker/reset-password-worker";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import img_reset_password from "../../../../../public/assets/images/worker/Reset password-amico.png";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    const result = await resetPasswordAction(token, password);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage(result.message || "Mot de passe réinitialisé avec succès");
      setTimeout(() => router.push("/worker/sign-in"), 2000);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center md:text-left">
            Réinitialiser le mot de passe
          </h1>

          <p className="text-gray-500 mb-6 text-center md:text-left">
            Choisissez un nouveau mot de passe sécurisé.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputForm
              id="password"
              label="Nouveau mot de passe"
              type="password"
              placeholder="Entrez votre nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setError(null)}
            />

            <InputForm
              id="confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              placeholder="Confirmez votre mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setError(null)}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#5F9598] hover:bg-[#1D546D] transition-colors"
            >
              {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </Button>
          </form>

          {error && (
            <p className="mt-4 text-red-700 bg-red-100 p-3 rounded-lg text-center">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-4 text-green-700 bg-green-100 p-3 rounded-lg text-center">
              {message}
            </p>
          )}
        </div>

        <div className="hidden md:flex items-center justify-center bg-[#F4F9F9] p-6">
          <Image
            src={img_reset_password}
            alt="Réinitialisation du mot de passe"
            className="max-w-md w-full h-auto"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

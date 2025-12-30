"use client";

import { useState } from "react";
import InputForm from "@/components/Form/inputForm";
import { Button } from "@/components/ui/button";
import { resetPasswordAction } from "@/actions/auth/entreprise/reset-password-entreprise";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

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
      setMessage(result.message || "Mot de passe réinitialisé avec succès !");
      setTimeout(() => router.push("/enterprise/sign-in"), 2000);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <div className="mb-6 flex justify-center lg:justify-start">
          <Link href="/" className="text-xl font-black text-slate-800">
            MARcrute <span className="text-[#5F9598]">Enterprise</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Réinitialiser le mot de passe
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Entrez votre nouveau mot de passe pour votre compte entreprise
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputForm
            id="password"
            label="Nouveau mot de passe"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setError(null)}
          />
          <InputForm
            id="confirmPassword"
            label="Confirmer le mot de passe"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setError(null)}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1D546D] hover:bg-[#5F9598] transition-colors cursor-pointer"
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

        <p className="mt-6 text-center text-sm text-gray-600">
          Vous vous souvenez de votre mot de passe ?{" "}
          <Link
            href="/enterprise/sign-in"
            className="text-cyan-700 font-medium hover:underline"
          >
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

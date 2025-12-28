"use client";

import { useState } from "react";
import InputForm from "@/components/Form/inputForm";
import { Button } from "@/components/ui/button";
import { resetPasswordAction } from "@/actions/auth/entreprise/reset-password-entreprise";
import { useSearchParams, useRouter } from "next/navigation";

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
      setMessage(result.message || "");
      setTimeout(() => router.push("/enterprise/sign-in"), 2000);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Réinitialiser le mot de passe</h1>
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </Button>
        </form>

        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPasswordPage;

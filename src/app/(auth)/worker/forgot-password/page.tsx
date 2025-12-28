"use client";

import React, { useState } from "react";
import InputForm from "@/components/Form/inputForm";
import { Button } from "@/components/ui/button";
import { forgotPasswordAction } from "@/actions/auth/worker/forgot-password-worker";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    const result = await forgotPasswordAction(email);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage(result.message || "");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Mot de passe oublié</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputForm
            id="email"
            label="Email"
            placeholder="Votre email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setError(null)}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
          </Button>
        </form>
        {message && <p className="mt-4 text-green-600 bg-green-200 p-2 rounded-md text-center">{message}</p>}
        {error && <p className="mt-4 text-red-600 bg-red-200 text-center p-2 rounded-md">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

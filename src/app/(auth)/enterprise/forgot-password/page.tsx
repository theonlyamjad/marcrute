"use client";

import React, { useState } from "react";
import InputForm from "@/components/Form/inputForm";
import { Button } from "@/components/ui/button";
import { forgotPasswordEntrepriseAction } from "@/actions/auth/entreprise/forgot-password-entreprise";
import Link from "next/link";
import Image from "next/image";
import img_forgot_password from "../../../../../public/assets/images/enterprise/Forgot password-cuate.png"; 

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

    const result = await forgotPasswordEntrepriseAction(email);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage(result.message || "Le lien de réinitialisation a été envoyé !");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-6 flex justify-center lg:justify-start">
            <Link href="/" className="text-xl font-black text-slate-800">
              MARcrute <span className="text-[#5F9598]">Enterprise</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center md:text-left">
            Mot de passe oublié
          </h1>

          <p className="text-gray-500 mb-6 text-center md:text-left">
            Entrez votre email professionnel pour recevoir un lien de réinitialisation.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputForm
              id="email"
              label="Email"
              placeholder="contact@entreprise.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setError(null)}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#1D546D] hover:bg-[#5F9598] transition-colors cursor-pointer"
            >
              {isLoading ? "Envoi..." : "Envoyer le lien"}
            </Button>
          </form>

          {message && (
            <p className="mt-4 text-green-700 bg-green-100 p-3 rounded-lg text-center">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-4 text-red-700 bg-red-100 p-3 rounded-lg text-center">
              {error}
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

        {/* IMAGE */}
        <div className="hidden md:flex items-center justify-center bg-[#F4F9F9] p-6">
          <Image
            src={img_forgot_password}
            alt="Mot de passe oublié entreprise"
            className="max-w-md w-full h-auto"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

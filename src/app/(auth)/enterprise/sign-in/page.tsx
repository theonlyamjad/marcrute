"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InputForm from "@/components/Form/inputForm";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import img_sign_in_entreprise from "../../../../../public/assets/images/enterprise/Profiling-bro.png";

const SignInEntreprisePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFocus = (field: "email" | "password") => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ email: "", password: "" });

    try {
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        role: "Institution",
        redirect: false,
        callbackUrl: "/enterprise/dashboard",
      });

      if (res?.error) {
        setErrors({
          email: "Email ou mot de passe incorrect",
          password: "Email ou mot de passe incorrect",
        });
        setIsLoading(false);
        return;
      }

      if (res?.ok) {
        router.push("/enterprise/dashboard");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setErrors({
        email: "Une erreur est survenue",
        password: "Une erreur est survenue",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden">

        {/* FORM */}
        <div className="p-6 sm:p-10 flex flex-col">
          <div className="mb-6 flex justify-center lg:justify-start">
            <Link href="/" className="text-xl font-black text-slate-800">
              MARcrute <span className="text-[#5F9598]">Enterprise</span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-lg">
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

                <div className="text-center lg:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                    Connexion entreprise
                  </h1>
                  <p className="text-slate-500 mt-1">
                    Accédez à votre espace de recrutement
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  
                  <InputForm
                    id="email"
                    label="Email professionnel"
                    placeholder="contact@entreprise.com"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus("email")}
                    icon="mail"
                    error={errors.email}
                  />
                  
                  <InputForm
                    id="password"
                    label="Mot de passe"
                    placeholder="••••••••"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus("password")}
                    icon="lock"
                    error={errors.password}
                  />
                  <div className="flex justify-end">
                    <Link
                      href="/enterprise/forgot-password"
                      className="text-sm font-medium text-[#1D546D] hover:text-[#5F9598] hover:underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1D546D] hover:bg-[#5F9598]"
                  >
                    {isLoading ? "Connexion..." : "Accéder à mon espace"}
                  </Button>

                  <p className="text-center text-sm text-slate-600">
                    Nouvelle entreprise ?{" "}
                    <Link
                      href="/enterprise/sign-up"
                      className="font-medium text-cyan-700 hover:underline"
                    >
                      Créer un compte
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* IMAGE */}
        <div className="hidden lg:flex items-center justify-center bg-linear-to-br from-cyan-50 to-sky-100 p-8">
          <Image
            src={img_sign_in_entreprise}
            alt="Connexion entreprise"
            className="max-w-md w-full h-auto"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default SignInEntreprisePage;
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InputForm from "@/components/Form/inputForm";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { Shield } from "lucide-react";
import Image from "next/image";
import img_sign_in_admin from "../../../../../public/assets/images/admin/Admin-rafiki.png";
const SignInAdminPage = () => {
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
        role: "Admin",
        redirect: false,
        callbackUrl: "/admin/dashboard",
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
        router.push("/admin/dashboard");
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
            <Link href="/" className="font-black text-slate-800">
              <span className="text-3xl text-[#5F9598]">MARcrute</span>{" "}
              <span className="inline-flex items-center justify-center rounded-full bg-slate-800 px-3 py-1 text-xs -rotate-7 font-semibold uppercase tracking-wide text-[#5F9598]">
                Admin
              </span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-lg">
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="text-center lg:text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-8 w-8 text-[#1D546D]" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                      Connexion administrateur
                    </h1>
                  </div>
                  <p className="text-slate-500 mt-1">
                    Accédez au panneau d&apos;administration
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <InputForm
                    id="email"
                    label="Email"
                    placeholder="admin@marcrute.com"
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
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#1D546D] hover:bg-[#5F9598]"
                  >
                    {isLoading ? "Connexion..." : "Accéder au panneau admin"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* IMAGE/ILLUSTRATION */}
        <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-[#1D546D] to-[#5F9598] p-8">
          <div className="flex flex-col items-center justify-center">
            <Image
              src={img_sign_in_admin}
              alt="Administration"
              width={500}
              height={500}
              className="object-contain"
              priority
            />
            <div className="text-center text-white mt-6">
              <h2 className="text-2xl font-bold mb-4">
                Panneau d&apos;administration
              </h2>
              <p className="text-lg opacity-90">
                Gérez tous les aspects de la plateforme MARcrute
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInAdminPage;

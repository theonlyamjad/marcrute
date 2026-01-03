"use client"
import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import InputForm from '@/components/Form/inputForm'
import OAuth from '@/components/Form/OAuth'
import { Button } from '@/components/ui/button'
import { signUpEnterpriseAction } from "@/actions/auth/entreprise/sign-up-enterprise"
import { signIn } from "next-auth/react"
import img_sign_up_entreprise from '../../../../../public/assets/images/enterprise/Hiring-amico.png'
import Image from "next/image"


const SignupPage = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: ""
  })

  const [errformData, seterrFormData] = useState({
    companyName: "",
    email: "",
    password: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  const handleFocus = (value: string) => {
    seterrFormData((prev) => ({
      ...prev,
      [value]: ""
    }))
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setMessage(null)
  seterrFormData({ companyName: "", email: "", password: "" })

  const result = await signUpEnterpriseAction(
    formData.companyName,
    formData.email,
    formData.password
  )

  if (result?.success) {
    setMessage(
      "Inscription réussie ! Vérifiez votre email pour activer votre compte entreprise."
    )

    setTimeout(() => {
      setMessage(null)
      router.push("/enterprise/sign-in")
    }, 5000)
  } else if (result?.error) {
    seterrFormData({
      companyName: "",
      email: result.error,
      password: ""
    })
  }

  setIsLoading(false)
}




return (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden">

      {/* FORM */}
      <div className="p-6 sm:p-10 flex flex-col">
        {/* LOGO */}
          <div className="mb-6 flex justify-center lg:justify-start">
            <Link href="/" className="font-black text-slate-800">
              <span className="text-3xl">MARcrute</span> <span className="inline-flex items-center justify-center rounded-full bg-slate-800 px-3 py-1 text-xs -rotate-7 font-semibold uppercase tracking-wide text-[#5F9598]">Enterprise</span>
            </Link>
          </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {message && (
              <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-green-700 text-sm text-center">
                {message}
              </div>
            )}
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  Créer un compte entreprise
                </h1>
                <p className="text-slate-500 mt-1">
                  Recrutez plus rapidement les talents adaptés à votre équipe
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <InputForm
                  id="companyName"
                  label="Nom de l’entreprise"
                  placeholder="Ex : Atlas Digital"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  onFocus={() => handleFocus("companyName")}
                  error={errformData.companyName}
                />

                <InputForm
                  id="email"
                  label="Email professionnel"
                  placeholder="contact@entreprise.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  icon="mail"
                  onFocus={() => handleFocus("email")}
                  error={errformData.email}
                />

                <InputForm
                  id="password"
                  label="Mot de passe"
                  placeholder="••••••••"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  icon="lock"
                  onFocus={() => handleFocus("password")}
                  error={errformData.password}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1D546D] hover:bg-[#5F9598] transition-colors cursor-pointer"
                >
                  {isLoading ? "Création..." : "Créer mon compte entreprise"}
                </Button>
                
                <p className="text-center text-sm text-slate-600">
                  Déjà inscrit ?{" "}
                  <Link
                    href="/enterprise/sign-in"
                    className="font-medium text-cyan-700 hover:underline"
                  >
                    Se connecter
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
          src={img_sign_up_entreprise}
          alt="Inscription entreprise"
          className="max-w-md w-full h-auto"
          priority
        />
      </div>
    </div>
  </div>
)

}

export default SignupPage
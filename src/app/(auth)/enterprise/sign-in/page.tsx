"use client"
import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import InputForm from '@/components/Form/inputForm'
import OAuth from '@/components/Form/OAuth'
import { Button } from '@/components/ui/button'
import { signInEntrepriseAction } from "@/actions/auth/entreprise/sign-in-entreprise"
import { signIn } from "next-auth/react"
import img_sign_in_entreprise from '../../../../../public/assets/images/enterprise/Profiling-bro.png'
import Image from "next/image"


const SignInPage = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const [errformData, seterrFormData] = useState({
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
    seterrFormData({ email: "", password: "" })

    const result = await signInEntrepriseAction(formData.email, formData.password)

    if (result?.error) {
      seterrFormData({
        email: result.error,
        password: result.error
      })
      setIsLoading(false)
    } else {
      router.push(result.redirectTo || "/")
    }
  }

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/dashboard" })
  }

return (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden">

      {/* FORM */}
      <div className="p-6 sm:p-10 flex flex-col">
        {/* LOGO */}
        <div className="mb-6 flex justify-center lg:justify-start">
          <Link href="/" className="text-xl font-black text-slate-800">
            MARcrute <span className="text-[#5F9598]">Enterprise</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

              {/* HEADER */}
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  Connexion entreprise
                </h1>
                <p className="text-slate-500 mt-1">
                  Accédez à votre espace de recrutement
                </p>
              </div>

              {/* FIELDS */}
              <div className="flex flex-col gap-4">
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

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      Mot de passe
                    </span>
                    <Link
                      href="/enterprise/forgot-password"
                      className="text-sm text-cyan-700 hover:underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  <InputForm
                    id="password"
                    label=""
                    placeholder="••••••••"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    icon="lock"
                    onFocus={() => handleFocus("password")}
                    error={errformData.password}
                  />
                </div>

                {/* BUTTON */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1D546D] hover:bg-[#5F9598] transition-colors cursor-pointer"
                >
                  {isLoading ? "Connexion..." : "Accéder à mon espace"}
                </Button>

                {/* OAUTH */}
                <OAuth
                  text_1="Continuer avec Google"
                  text_2="Continuer avec Microsoft"
                  onGoogleClick={handleGoogleSignIn}
                />

                {/* LINK */}
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
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-cyan-50 to-sky-100 p-8">
        <Image
          src={img_sign_in_entreprise}
          alt="Connexion entreprise"
          className="max-w-md w-full h-auto"
          priority
        />
      </div>
    </div>
  </div>
)

}

export default SignInPage
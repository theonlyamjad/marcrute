"use client"
import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import InputForm from '@/components/Form/inputForm'
import OAuth from '@/components/Form/OAuth'
import { Button } from '@/components/ui/button'
import { signIn } from "next-auth/react"
import { signInWorkerAction } from "@/actions/auth/worker/sign-in-worker"
import img_sign_in from '../../../../../public/assets/images/worker/Computer login-amico.png'
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

    const result = await signInWorkerAction(formData.email, formData.password)
    if (result?.error) {
      seterrFormData({
        email: result.error,
        password: result.error
      })
      setIsLoading(false)
    } else {
      // Redirect based on role
      router.push(result.redirectTo || "/")
    }
  }

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/dashboard" })
  }

return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg grid grid-cols-1 lg:grid-cols-2 overflow-hidden">

      {/* FORM */}
      <div className="p-6 sm:p-10 flex flex-col">
        {/* LOGO */}
        <div className="mb-6">
          <Link href="/" className="text-xl font-black text-[#1D546D]">
            MARcrute
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Connexion à votre compte
                </h1>
                <p className="text-gray-500 mt-1">
                  Accédez à votre espace personnel
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <InputForm
                  id="email"
                  label="Email"
                  placeholder="exemple@email.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  icon="mail"
                  onFocus={() => handleFocus("email")}
                  error={errformData.email}
                />

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Mot de passe
                    </span>
                    <Link
                      href="/worker/forgot-password"
                      className="text-sm text-[#1D546D] hover:underline"
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#5F9598] hover:bg-[#1D546D] transition-colors"
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>

                <OAuth
                  text_1="Continuer avec Google"
                  text_2="Continuer avec Microsoft"
                  onGoogleClick={handleGoogleSignIn}
                />

                <p className="text-center text-sm text-gray-600">
                  Vous n&apos;avez pas de compte ?{" "}
                  <Link
                    href="/worker/sign-up"
                    className="font-medium text-[#1D546D] hover:underline"
                  >
                    S&apos;inscrire
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* IMAGE */}
      <div className="hidden lg:flex items-center justify-center bg-[#F4F9F9] p-8">
        <Image
          src={img_sign_in}
          alt="Connexion"
          className="max-w-md w-full h-auto"
          priority
        />
      </div>
    </div>
  </div>
)

}

export default SignInPage
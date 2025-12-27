"use client"
import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dancing_Script } from "next/font/google"
import InputForm from '@/components/Form/inputForm'
import OAuth from '@/components/Form/OAuth'
import { Button } from '@/components/ui/button'
import { Users, TrendingUp, Shield } from "lucide-react"
import { signUpEnterpriseAction } from "@/actions/auth/sign-up-enterprise"
import { signIn } from "next-auth/react"

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "700"]
})

const SignupPage = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
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
    seterrFormData({ companyName: "", email: "", password: "" })

    const result = await signUpEnterpriseAction(
      formData.companyName,
      formData.email,
      formData.password
    )

    if (result?.error) {
      seterrFormData({
        companyName: "",
        email: result.error,
        password: ""
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
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-black">
            MARcrute
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold">Créer un compte entreprise</h1>
              </div>
              
              <div className="flex flex-col gap-4">
                <InputForm 
                  id="companyName" 
                  label="Nom de l'entreprise"
                  placeholder="Nom de votre entreprise"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  onFocus={() => handleFocus("companyName")}
                  error={errformData.companyName}
                />

                <InputForm 
                  id="email" 
                  label="Email"
                  placeholder="exemple@entreprise.com"
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
                  placeholder="******"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  icon="lock"
                  onFocus={() => handleFocus("password")}
                  error={errformData.password}
                />
                
                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                  {isLoading ? "Création..." : "Créer mon compte entreprise"}
                </Button>
                
                <OAuth 
                  text_1="S'inscrire avec Google" 
                  text_2="S'inscrire avec Microsoft"
                  onGoogleClick={handleGoogleSignIn}
                />
                
                <p className="text-center text-sm">
                  Déjà inscrit ?{" "}
                  <Link href="/enterprise/sign-in" className="underline underline-offset-4">
                    Connectez-vous
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block bg-linear-to-br from-cyan-600 to-cyan-800 rounded-l-4xl">
        <div className="flex gap-8 flex-col justify-center items-center h-full p-12">
          <h2 className={`${dancingScript.className} text-white text-5xl font-bold text-center max-w-lg leading-tight`}>
            Recrutez les meilleurs talents marocains
          </h2>
          <div className="text-white text-center space-y-4 max-w-md">
            <div className="flex items-center gap-3 justify-center">
              <Users className="w-6 h-6 shrink-0" />
              <p className="text-lg font-semibold">Accédez à +300 000 freelancers qualifiés</p>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <TrendingUp className="w-6 h-6 shrink-0" />
              <p className="text-lg font-semibold">Publication d'offres illimitée</p>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Shield className="w-6 h-6 shrink-0" />
              <p className="text-lg font-semibold">Gestion simplifiée des recrutements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
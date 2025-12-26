"use client"
import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dancing_Script } from "next/font/google"
import InputForm from '@/components/Form/inputForm'
import OAuth from '@/components/Form/OAuth'
import { Button } from '@/components/ui/button'
import { Users, TrendingUp, Shield } from "lucide-react"
import { signInAction } from "@/actions/auth/sign-in"
import { signIn } from "next-auth/react"

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "700"]
})

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

    const result = await signInAction(formData.email, formData.password)

    if (result?.error) {
      seterrFormData({
        email: result.error,
        password: result.error
      })
      setIsLoading(false)
    } else {
      // Redirect to dashboard
      router.push("/dashboard")
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
                <h1 className="text-2xl font-bold">Connexion à votre compte</h1>
              </div>
              
              <div className="flex flex-col gap-4">
                <InputForm 
                  id="email" 
                  label="Email"
                  placeholder="exemple@exemple.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  icon="mail"
                  onFocus={() => handleFocus("email")}
                  error={errformData.email}
                />
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mot de passe</span>
                    <Link
                      href="/forgot-password"
                      className="text-sm underline-offset-4 hover:underline"
                    >
                      Mot de passe oublié?
                    </Link>
                  </div>
                  <InputForm 
                    id="password" 
                    label=""
                    placeholder="******"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    icon="lock"
                    onFocus={() => handleFocus("password")}
                    error={errformData.password}
                  />
                </div>
                
                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                  {isLoading ? "Connexion..." : "Connecter"}
                </Button>
                
                <OAuth 
                  text_1="Continuez avec Google" 
                  text_2="Continuez avec Microsoft"
                  onGoogleClick={handleGoogleSignIn}
                />
                
                <p className="text-center text-sm">
                  Vous n&apos;avez pas de compte?{" "}
                  <Link href="/enterprise/sign-up" className="underline underline-offset-4">
                    S&apos;inscrire
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

export default SignInPage
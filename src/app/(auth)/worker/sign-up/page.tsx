"use client"
import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dancing_Script } from "next/font/google"
import InputForm from '@/components/Form/inputForm'
import OAuth from '@/components/Form/OAuth'
import { Button } from '@/components/ui/button'
import { Briefcase, Building2, Sparkles } from "lucide-react"
import { signUpWorkerAction } from "@/actions/auth/sign-up-worker"
import { signIn } from "next-auth/react"

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "700"]
})

const SignupPage = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: ""
  })

  const [errformData, seterrFormData] = useState({
    firstname: "",
    lastname: "",
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
    seterrFormData({ firstname: "", lastname: "", email: "", password: "" })
    setMessage(null)

    const result = await signUpWorkerAction(
      formData.firstname,
      formData.lastname,
      formData.email,
      formData.password
    )

    if(result.success){
      setMessage("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.")
      setTimeout(() => {
        setMessage(null)
        router.push("/worker/sign-in")
    },5000)
    
    }else if (result.error){
      seterrFormData({
        firstname: "",
        lastname: "",
        email: result.error,
        password: ""
      })
    }
    setIsLoading(false)
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

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-lg">

            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{message}</span>
              </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold">Je crée mon compte</h1>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputForm 
                    id="firstname" 
                    label="Prénom"
                    placeholder="Votre prénom"
                    type="text"
                    value={formData.firstname}
                    onChange={handleChange}
                    onFocus={() => handleFocus("firstname")}
                    error={errformData.firstname}
                  />
                  <InputForm 
                    id="lastname" 
                    label="Nom"
                    placeholder="Votre nom"
                    type="text"
                    value={formData.lastname}
                    onChange={handleChange}
                    onFocus={() => handleFocus("lastname")}
                    error={errformData.lastname}
                  />
                </div>

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
                  {isLoading ? "Création..." : "Créer mon compte"}
                </Button>
                
                <OAuth 
                  text_1="S'inscrire avec Google" 
                  text_2="S'inscrire avec Microsoft"
                  onGoogleClick={handleGoogleSignIn}
                />
                
                <p className="text-center text-sm">
                  Déjà inscrit ?{" "}
                  <Link href="/worker/sign-in" className="underline underline-offset-4">
                    Connectez-vous
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block bg-linear-to-br from-purple-600 to-purple-800 rounded-l-4xl">
        <div className="flex gap-8 flex-col justify-center items-center h-full p-12">
          <h2 className={`${dancingScript.className} text-white text-5xl font-bold text-center max-w-lg leading-tight`}>
            Trouvez votre prochaine mission
          </h2>
          <div className="text-white text-center space-y-4 max-w-md">
            <div className="flex items-center gap-3 justify-center">
              <Sparkles className="w-6 h-6 shrink-0" />
              <p className="text-lg font-semibold">Des milliers de missions disponibles</p>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Building2 className="w-6 h-6 shrink-0" />
              <p className="text-lg font-semibold">Travaillez avec les meilleures entreprises</p>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Briefcase className="w-6 h-6 shrink-0" />
              <p className="text-lg font-semibold">100% gratuit pour les freelancers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage

"use client"
import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import InputForm from '@/components/Form/inputForm'
import OAuth from '@/components/Form/OAuth'
import { Button } from '@/components/ui/button'
import { signUpWorkerAction } from "@/actions/auth/worker/sign-up-worker"
import { signIn } from "next-auth/react"
import img_sign_up from '../../../../../public/assets/images/worker/Sign up-amico.png'
import Image from "next/image"


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



return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg grid grid-cols-1 lg:grid-cols-2 overflow-hidden">

      <div className="p-6 sm:p-10 flex flex-col">

        <div className="mb-6">
            <Link href="/" className="font-black text-3xl text-[#5F9598]">
              MARcrute
            </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg">

            {message && (
              <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-green-700 text-sm text-center">
                {message}
              </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Je crée mon compte
                </h1>
                <p className="text-gray-500 mt-1">
                  Rejoignez la plateforme en quelques secondes
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="exemple@email.com"
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
                  className="w-full bg-[#5F9598] hover:bg-[#1D546D] transition-colors"
                >
                  {isLoading ? "Création..." : "Créer mon compte"}
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Déjà inscrit ?{" "}
                  <Link
                    href="/worker/sign-in"
                    className="font-medium text-[#1D546D] hover:underline"
                  >
                    Connectez-vous
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex items-center justify-center bg-[#F4F9F9] p-8">
        <Image
          src={img_sign_up}
          alt="Inscription"
          className="max-w-md w-full h-auto"
          priority
        />
      </div>
    </div>
  </div>
)

}

export default SignupPage

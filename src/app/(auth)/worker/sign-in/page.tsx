"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import InputForm from '@/components/Form/inputForm'
import OAuth from '@/components/Form/OAuth'
import { Button } from '@/components/ui/button'
import { signIn } from "next-auth/react"
import img_sign_in from '../../../../../public/assets/images/worker/Computer login-amico.png'
import Image from "next/image"
import { checkUserLoginStatus } from "@/actions/admin/check-ban-action"
import { formatBanMessage } from "@/lib/format-ban-message"
import { toast } from "sonner"

const SignInPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const [errformData, seterrFormData] = useState({
    email: "",
    password: ""
  })

  // Check if redirected due to ban
  useEffect(() => {
    if (searchParams.get('banned') === 'true') {
      toast.error("🚫 Accès au compte restreint", {
        description: "Votre compte a été suspendu. Veuillez vous reconnecter pour voir les détails.",
        duration: 10000,
        className: "border-2 border-red-500",
        style: {
          background: '#FEE2E2',
          color: '#991B1B',
        },
      })
    }
  }, [searchParams])

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

    try {
      // CHECK BAN STATUS FIRST
      const loginStatus = await checkUserLoginStatus(formData.email)
      
      if (loginStatus.isBanned && loginStatus.banInfo) {
        const banMessage = formatBanMessage(loginStatus.banInfo)
        
        // Simple clean format
        const fullMessage = `${banMessage.reasonTitle}

        ${banMessage.reasonDetail}

        Appliqué le: ${banMessage.metadata.appliedOn}
        ${banMessage.metadata.status}

        ${banMessage.footer}`

        toast.error(banMessage.header, {
          description: fullMessage,
          duration: 15000,
          className: "border-2 border-red-500",
          style: {
            background: '#FEE2E2',
            color: '#991B1B',
          },
        })
        setIsLoading(false)
        return // Stop login process
      }

      // Continue with normal authentication
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        role: "Travailleur",
        redirect: false,
      })

      if (result?.error) {
        seterrFormData({
          email: result.error,
          password: result.error
        })
        setIsLoading(false)
      } else if (result?.ok) {
        router.push("/worker/dashboard")
      }
    } catch (error) {
      console.error("Erreur de connexion:", error)
      seterrFormData({
        email: "Une erreur est survenue",
        password: "Une erreur est survenue"
      })
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg grid grid-cols-1 lg:grid-cols-2 overflow-hidden">

        {/* FORM */}
        <div className="p-6 sm:p-10 flex flex-col">
          {/* LOGO */}
          <div className="mb-6">
            <Link href="/" className="font-black text-3xl text-[#5F9598]">
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
                    className="w-full bg-[#5F9598] hover:bg-[#1D546D] transition-colors cursor-pointer"
                  >
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>

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
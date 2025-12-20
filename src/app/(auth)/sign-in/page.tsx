"use client"
import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Dancing_Script } from "next/font/google"
import InputForm from '@/components/Form/inputForm'
import OAuth from '@/components/Form/OAuth'
import { Button } from '@/components/ui/button'

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "700"]
})

const SignInPage = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Sign in:", formData)
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
          <div className="w-full max-w-xs">
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
                
                <Button type="submit" className="w-full cursor-pointer">
                  Connecter
                </Button>
                
                <OAuth text_1="Continuez avec Google" text_2="Continuez avec Microsoft" />
                
                <p className="text-center text-sm">
                  Vous n&apos;avez pas de compte?{" "}
                  <Link href="/sign-up" className="underline underline-offset-4">
                    S&apos;inscrire
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block bg-black rounded-l-4xl">
        <div className="flex gap-5 flex-col justify-center items-center h-full p-12">
          <h2 className={`${dancingScript.className} text-white text-5xl font-bold text-center max-w-lg leading-tight`}>
            Trouvez votre prochaine opportunité
          </h2>
          <div className="border-white border-4 rounded-lg">
            <Image
              src="/placeholder.svg"
              alt="Placeholder"
              width={400}
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInPage
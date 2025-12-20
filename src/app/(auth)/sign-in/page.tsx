"use client"
import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Dancing_Script } from "next/font/google"

import { LoginForm } from "@/components/login-form"

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
            <LoginForm 
              onSubmit={handleSubmit}
              formData={formData}
              setFormData={setFormData}
            />
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
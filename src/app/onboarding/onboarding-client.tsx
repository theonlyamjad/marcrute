"use client";

import { useState } from "react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { StepWelcome } from "./step-welcome";
import { StepPassword } from "./step-password";
import { StepPersonal } from "./step-personal";
import { StepProfessional } from "./step-professional";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

interface OnboardingClientProps {
  isGoogleUser: boolean;
  completion: {
    hasPassword?: boolean;
    hasPhone?: boolean;
    hasCity?: boolean;
    hasExperience?: boolean;
    hasDiploma?: boolean;
    hasSpecialty?: boolean;
  };
}

export function OnboardingClient({ isGoogleUser, completion }: OnboardingClientProps) {
  const router = useRouter();
  
  const getInitialStep = () => {
    if (isGoogleUser && !completion.hasPassword) return 0;
    if (!completion.hasPhone || !completion.hasCity) return isGoogleUser ? 2 : 1;
    if (!completion.hasExperience || !completion.hasDiploma || !completion.hasSpecialty) {
      return isGoogleUser ? 3 : 2;
    }
    return 0;
  };

  const [currentStep, setCurrentStep] = useState(getInitialStep());

  const steps = isGoogleUser
    ? ["welcome", "password", "personal", "professional"]
    : ["welcome", "personal", "professional"];

  const stepTitles = isGoogleUser
    ? ["Bienvenue", "Mot de passe", "Informations personnelles", "Informations professionnelles"]
    : ["Bienvenue", "Informations personnelles", "Informations professionnelles"];

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    toast.success("Profil complété avec succès!");
    router.push("/worker/dashboard");
    router.refresh();
  };

  const renderStep = () => {
    const step = steps[currentStep];

    switch (step) {
      case "welcome":
        return <StepWelcome onNext={handleNext} />;
      case "password":
        return <StepPassword onNext={handleNext} onBack={handleBack} />;
      case "personal":
        return <StepPersonal onNext={handleNext} onBack={handleBack} />;
      case "professional":
        return (
          <StepProfessional
            onNext={handleComplete}
            onBack={handleBack}
            isLastStep={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F4F9F9] via-gray-50 to-[#E8F4F4] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl">

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress Section */}
          <div className="bg-linear-to-r from-[#5F9598] to-[#1D546D] px-8 py-6">
            <div className="max-w-3xl mx-auto">
              {/* Step Indicators */}
              <div className="flex items-center justify-between mb-4">
                {stepTitles.map((title, index) => (
                  <div key={index} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                          index < currentStep
                            ? "bg-white text-[#5F9598]"
                            : index === currentStep
                            ? "bg-white text-[#5F9598] ring-4 ring-white/30"
                            : "bg-white/20 text-white/60"
                        }`}
                      >
                        {index < currentStep ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium text-center hidden sm:block ${
                          index <= currentStep ? "text-white" : "text-white/50"
                        }`}
                      >
                        {title}
                      </span>
                    </div>
                    {index < stepTitles.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded transition-all ${
                          index < currentStep ? "bg-white" : "bg-white/20"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-white text-sm">
                  <span className="font-medium">
                    Étape {currentStep + 1} sur {totalSteps}
                  </span>
                  <span className="font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 sm:p-12">
            <div className="max-w-3xl mx-auto">
              {renderStep()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Besoin d'aide ?{" "}
          <Link href="/contact" className="text-[#5F9598] hover:underline font-medium">
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  );
}
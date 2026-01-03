"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { StepWelcome } from "./step-welcome";
import { StepPassword } from "./step-password";
import { StepPersonal } from "./step-personal";
import { StepProfessional } from "./step-professional";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface OnboardingDialogProps {
  isOpen: boolean;
  isGoogleUser: boolean;
}

export function OnboardingDialog({ isOpen, isGoogleUser }: OnboardingDialogProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Define steps based on user type
  const steps = isGoogleUser
    ? ["welcome", "password", "personal", "professional"]
    : ["welcome", "personal", "professional"];

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
    <Dialog open={isOpen} modal>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                Étape {currentStep + 1} sur {totalSteps}
              </span>
              <span className="text-sm font-bold text-[#5F9598]">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-200" />
          </div>

          {/* Step Content */}
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
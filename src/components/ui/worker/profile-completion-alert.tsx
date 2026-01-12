"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ProfileCompletionAlertProps {
  completion: {
    hasExperience?: boolean;
    hasDiploma?: boolean;
    hasSpecialty?: boolean;
  };
}

export function ProfileCompletionAlert({ completion }: ProfileCompletionAlertProps) {
  const isFullyComplete = 
    completion.hasExperience && 
    completion.hasDiploma && 
    completion.hasSpecialty;

  if (isFullyComplete) {
    return null;
  }

  const missing: string[] = [];
  if (!completion.hasExperience) missing.push("expérience");
  if (!completion.hasDiploma) missing.push("diplôme");
  if (!completion.hasSpecialty) missing.push("spécialité");

  return (
    <Alert className="mb-6 bg-amber-50 border-amber-200">
      <AlertCircle className="h-5 w-5 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="font-medium text-amber-900 mb-1">
            Profil incomplet
          </p>
          <p className="text-sm text-amber-800">
            Pour postuler aux missions, ajoutez au moins : {missing.join(", ")}
          </p>
        </div>
        <Link href="/worker/cv">
          <Button 
            size="sm" 
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Compléter mon CV
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
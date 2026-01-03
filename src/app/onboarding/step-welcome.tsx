"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Star, Target } from "lucide-react";

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-[#061E29]">
          Bienvenue sur MARcrute!
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Complétez votre profil en quelques étapes simples pour commencer à postuler aux missions
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="border-[#5F9598]/30 bg-[#5F9598]/5">
          <CardContent className="pt-6 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#5F9598] rounded-full mb-2">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-[#061E29]">Trouvez des missions</h3>
            <p className="text-sm text-gray-600">
              Accédez à des centaines d'opportunités
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#5F9598]/30 bg-[#5F9598]/5">
          <CardContent className="pt-6 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#5F9598] rounded-full mb-2">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-[#061E29]">Gérez votre CV</h3>
            <p className="text-sm text-gray-600">
              Mettez en valeur vos compétences
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#5F9598]/30 bg-[#5F9598]/5">
          <CardContent className="pt-6 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#5F9598] rounded-full mb-2">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-[#061E29]">Suivez vos candidatures</h3>
            <p className="text-sm text-gray-600">
              Restez informé de vos démarches
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onNext}
          size="lg"
          className="bg-[#5F9598] hover:bg-[#1D546D] text-white px-12 h-14 text-lg"
        >
          Commencer
        </Button>
      </div>
    </div>
  );
}
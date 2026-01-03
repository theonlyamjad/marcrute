"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { setPasswordForGoogleUser } from "@/actions/worker/set-password";

interface StepPasswordProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepPassword({ onNext, onBack }: StepPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    // TODO: Call your API to set password
    const result = await setPasswordForGoogleUser(password);

    setIsLoading(false);

    if (result.success) {
      toast.success("Mot de passe défini avec succès");
      onNext();
    } else {
      toast.error(result.error || "Erreur lors de la définition du mot de passe");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-[#5F9598] to-[#1D546D] rounded-full mb-2">
          <KeyRound className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-[#061E29]">
          Définir un mot de passe
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Vous vous êtes inscrit avec Google. Définissez un mot de passe pour
          sécuriser votre compte.
        </p>
      </div>

      {/* Form */}
      <Card className="border-[#1D546D]/20">
        <CardContent className="pt-6 space-y-4">
          {/* Password */}
          <div className="space-y-2">
            <Label>Mot de passe *</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">Minimum 8 caractères</p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label>Confirmer le mot de passe *</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-[#1D546D]/30"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !password || !confirmPassword}
          className="bg-[#5F9598] hover:bg-[#1D546D] text-white"
        >
          {isLoading ? "Enregistrement..." : "Continuer"}
        </Button>
      </div>
    </form>
  );
}
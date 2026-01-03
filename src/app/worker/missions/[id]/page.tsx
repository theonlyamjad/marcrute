"use client";

import { useState,} from "react";
import { useRouter } from "next/navigation";
import { Mission } from "@/types/mission";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {MapPin,Calendar,Building2,Clock,Users,ArrowLeft,Send,CheckCircle2,} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// TODO: Replace with actual API call
const MOCK_MISSION: Mission = {
  idMission: "1",
  idInstitution: "inst1",
  titre: "Assistant Social - Maison de Retraite",
  description:
    "Nous recherchons un assistant social expérimenté pour rejoindre notre équipe et accompagner nos résidents dans leurs démarches quotidiennes. Vous serez en charge de maintenir le lien avec les familles, d'organiser des activités adaptées et de coordonner les soins avec l'équipe médicale.\n\nResponsabilités:\n- Évaluation des besoins sociaux des résidents\n- Coordination avec les services médicaux et sociaux\n- Accompagnement des familles\n- Organisation d'activités sociales et culturelles\n- Gestion administrative des dossiers",
  typePublic: "Personnes âgées",
  dateDebut: new Date("2025-02-01"),
  dateFin: new Date("2025-08-01"),
  urgence: "Urgent",
  statut: "Ouvert",
  dateCreation: new Date("2024-12-20"),
  institution: {
    nomInstitution: "Résidence Les Oliviers",
    ville: {
      nomVille: "Agadir",
      region: {
        nomRegion: "Souss-Massa",
      },
    },
  },
  specialitesRequises: [
    {
      idSpecialiteRequise: "1",
      idMission: "1",
      specialiteRequise: "Assistant social",
      anneesExperienceMin: 2,
    },
    {
      idSpecialiteRequise: "2",
      idMission: "1",
      specialiteRequise: "Gérontologie",
      anneesExperienceMin: 1,
    },
  ],
};

export default function MissionDetailPage() {
  const router = useRouter();
  const [mission] = useState<Mission>(MOCK_MISSION);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);


  const formatDate = (date: Date | null) => {
    if (!date) return "Non spécifié";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getUrgenceBadge = (urgence: string | null) => {
    if (!urgence) return null;

    const urgenceConfig = {
      Urgent: "bg-red-100 text-red-800 border-red-200",
      Normal: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Flexible: "bg-green-100 text-green-800 border-green-200",
    };

    const style = urgenceConfig[urgence as keyof typeof urgenceConfig] || "bg-gray-100 text-gray-800";

    return (
      <Badge variant="outline" className={style}>
        {urgence}
      </Badge>
    );
  };

  const handleApply = async () => {
    setIsSubmitting(true);
    
    // TODO: Check if worker profile is complete
    const isProfileComplete = await checkProfileComplete();
    
    if (!isProfileComplete) {
      // Redirect to profile page with message
      router.push("/worker/profile?message=complete-profile-to-apply");
      return;
    }
    
    // TODO: Submit application to API with worker's profile data
    // The backend will automatically attach:
    // - Worker's experience
    // - Worker's diplomas
    // - Worker's specialties
    // - Worker's availability
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
    
    setIsSubmitting(false);
    setHasApplied(true);
  };

  // TODO: Replace with actual API call
  const checkProfileComplete = async (): Promise<boolean> => {
    // Check if worker has:
    // - Bio filled
    // - At least one experience
    // - At least one diploma
    // - At least one specialty
    // - City selected
    return true; // Mock - always returns true for now
  };

  const MissionInfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-center gap-3 py-3 border-b border-[#1D546D]/10 last:border-0">
      <Icon className="h-5 w-5 text-[#5F9598] shrink-0" />
      <div className="flex-1">
        <span className="text-sm text-gray-600">{label}:</span>
        <span className="ml-2 font-medium text-[#061E29]">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F4]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-[#5F9598]/10 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux missions
        </Button>

        {/* Main Container */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* LEFT COLUMN - 2/3 width */}
            <div className="col-span-2 space-y-6">
              {/* Logo & Header */}
              <Card className="border-[#1D546D]/20 bg-[#1D546D]/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-6">
                    {/* Institution Logo */}
                    <div className="w-32 h-32 bg-white rounded-lg border-2 border-[#1D546D]/20 flex items-center justify-center shrink-0">
                      <Building2 className="h-16 w-16 text-[#5F9598]" />
                    </div>

                    {/* Mission Title & Institution */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h1 className="text-3xl font-bold text-[#061E29]">
                          {mission.titre}
                        </h1>
                        {getUrgenceBadge(mission.urgence)}
                      </div>
                      <p className="text-lg text-[#1D546D] font-medium">
                        {mission.institution.nomInstitution}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mission Details & Requirements Side by Side */}
              <div className="grid grid-cols-2 gap-6">
                {/* Mission Details - Left */}
                <Card className="border-[#1D546D]/20 bg-[#1D546D]/5">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#061E29] uppercase">
                      Détails
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    <MissionInfoRow
                      icon={MapPin}
                      label="Localisation"
                      value={
                        mission.institution.ville
                          ? `${mission.institution.ville.nomVille}, ${mission.institution.ville.region.nomRegion}`
                          : "Non spécifié"
                      }
                    />
                    <MissionInfoRow
                      icon={Calendar}
                      label="Période"
                      value={`${formatDate(mission.dateDebut)} - ${formatDate(mission.dateFin)}`}
                    />
                    {mission.typePublic && (
                      <MissionInfoRow
                        icon={Users}
                        label="Type de public"
                        value={mission.typePublic}
                      />
                    )}
                    <MissionInfoRow
                      icon={Clock}
                      label="Publié le"
                      value={formatDate(mission.dateCreation)}
                    />
                  </CardContent>
                </Card>

                {/* Required Competences - Right */}
                <Card className="border-[#1D546D]/20 bg-[#1D546D]/5">
                  <CardHeader>
                    <CardTitle className="text-xl text-[#061E29] uppercase">
                      Compétences Requises
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mission.specialitesRequises.map((spec) => (
                      <div
                        key={spec.idSpecialiteRequise}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#1D546D]/10"
                      >
                        <span className="font-medium text-[#061E29] text-sm">
                          {spec.specialiteRequise}
                        </span>
                        {spec.anneesExperienceMin && (
                          <Badge className="bg-[#5F9598] hover:bg-[#1D546D] text-white text-xs px-2 py-1">
                            {spec.anneesExperienceMin}+ ans
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* RIGHT COLUMN - 1/3 width */}
            <div className="row-span-3">
              <Card className="border-[#5F9598]/30 bg-[#5F9598]/10 h-full">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#061E29] uppercase">
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {mission.description || "Aucune description disponible"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Apply Button Section - INSIDE CONTAINER */}
          <div className="border-t border-gray-200 pt-6">
            {hasApplied ? (
              <Alert className="bg-green-50 border-2 border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 font-semibold">
                  Candidature envoyée avec succès ! L'institution recevra votre profil complet.
                </AlertDescription>
              </Alert>
            ) : (
              <Button
                size="lg"
                onClick={handleApply}
                disabled={isSubmitting}
                className="w-full h-16 text-xl font-semibold bg-white hover:bg-[#5F9598] text-[#061E29] hover:text-white border-2 border-[#061E29] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    POSTULER
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
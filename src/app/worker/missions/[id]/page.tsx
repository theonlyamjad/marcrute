"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {MapPin,Calendar,Building2,Clock,Users,ArrowLeft,Send,CheckCircle2,Loader2,AlertCircle,} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getMissionDetails, hasAppliedToMission } from "@/actions/worker/missions";
import { createApplication } from "@/actions/worker/candidatures";
import { getWorkerProfile } from "@/actions/worker/profile";
import { toast } from "sonner";

export default function MissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params.id as string;

  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadMissionData();
  }, [missionId]);

  const loadMissionData = async () => {
    setLoading(true);
    try {
      // Fetch mission details and application status in parallel
      const [missionResult, appliedResult] = await Promise.all([
        getMissionDetails(missionId),
        hasAppliedToMission(missionId),
      ]);

      if (missionResult.success && missionResult.data) {
        setMission(missionResult.data);
      } else {
        toast.error(missionResult.error || "Mission introuvable");
        router.push("/worker/dashboard");
      }

      if (appliedResult.success && appliedResult.data) {
        setHasApplied(appliedResult.data.hasApplied);
      }
    } catch (error) {
      console.error("Error loading mission:", error);
      toast.error("Erreur lors du chargement de la mission");
    } finally {
      setLoading(false);
    }
  };

  const checkProfileComplete = async (): Promise<boolean> => {
    const profileResult = await getWorkerProfile();

    if (!profileResult.success || !profileResult.data) {
      return false;
    }

    const profile = profileResult.data;

    // Check required fields
    const hasBasicInfo = !!(
      profile.biographie &&
      profile.idVille &&
      profile.utilisateur?.nomComplet &&
      profile.utilisateur?.telephone
    );

    const hasSpecialties = profile.specialites && profile.specialites.length > 0;
    const hasExperience = profile.experiences && profile.experiences.length > 0;
    const hasDiplomas = profile.diplomes && profile.diplomes.length > 0;

    return hasBasicInfo && hasSpecialties && hasExperience && hasDiplomas;
  };

  const handleApply = async () => {
    // Check profile completeness first
    const isProfileComplete = await checkProfileComplete();

    if (!isProfileComplete) {
      toast.error("Veuillez compléter votre profil avant de postuler");
      router.push("/worker/profile?message=complete-profile-to-apply");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createApplication({
        idMission: missionId,
      });

      if (result.success) {
        toast.success("Candidature envoyée avec succès!");
        setHasApplied(true);
      } else {
        toast.error(result.error || "Erreur lors de l'envoi de la candidature");
      }
    } catch (error) {
      console.error("Error applying:", error);
      toast.error("Erreur lors de l'envoi de la candidature");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      Urgente: "bg-red-100 text-red-800 border-red-200",
      Haute: "bg-orange-100 text-orange-800 border-orange-300",
      Normale: "bg-green-100 text-green-800 border-green-200",
    };

    const style =
      urgenceConfig[urgence as keyof typeof urgenceConfig] ||
      "bg-gray-100 text-gray-800";

    return (
      <Badge variant="outline" className={style}>
        {urgence}
      </Badge>
    );
  };

  const MissionInfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string;
  }) => (
    <div className="flex items-center gap-3 py-3 border-b border-[#1D546D]/10 last:border-0">
      <Icon className="h-5 w-5 text-[#5F9598] shrink-0" />
      <div className="flex-1">
        <span className="text-sm text-gray-600">{label}:</span>
        <span className="ml-2 font-medium text-[#061E29]">{value}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F4] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#1D546D] mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la mission...</p>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-[#F3F4F4] flex items-center justify-center">
        <Alert className="max-w-md bg-red-50 border-2 border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            Mission introuvable
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
                        {mission.institution?.nomInstitution}
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
                        mission.institution?.ville
                          ? `${mission.institution.ville.nomVille}, ${mission.institution.ville.region.nomRegion}`
                          : "Non spécifié"
                      }
                    />
                    <MissionInfoRow
                      icon={Calendar}
                      label="Période"
                      value={`${formatDate(mission.dateDebut)} - ${formatDate(
                        mission.dateFin
                      )}`}
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
                    <MissionInfoRow
                      icon={Users}
                      label="Candidatures"
                      value={`${mission._count?.candidatures || 0} candidature${
                        mission._count?.candidatures !== 1 ? "s" : ""
                      }`}
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
                    {mission.specialitesRequises &&
                    mission.specialitesRequises.length > 0 ? (
                      mission.specialitesRequises.map((spec: any) => (
                        <div
                          key={spec.idSpecialiteRequise}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#1D546D]/10"
                        >
                          <span className="font-medium text-[#061E29] text-sm">
                            {spec.specialiteRequise}
                          </span>
                          {spec.anneesExperienceMin !== null && (
                            <Badge className="bg-[#5F9598] hover:bg-[#1D546D] text-white text-xs px-2 py-1">
                              {spec.anneesExperienceMin}+ ans
                            </Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        Aucune compétence spécifique requise
                      </p>
                    )}
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

          {/* Apply Button Section */}
          <div className="border-t border-gray-200 pt-6">
            {hasApplied ? (
              <Alert className="bg-green-50 border-2 border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 font-semibold">
                  Vous avez déjà postulé à cette mission. L'institution a reçu
                  votre profil complet.
                </AlertDescription>
              </Alert>
            ) : mission.statut !== "Active" ? (
              <Alert className="bg-yellow-50 border-2 border-yellow-200">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <AlertDescription className="text-yellow-800 font-semibold">
                  Cette mission n'est plus ouverte aux candidatures.
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
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
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
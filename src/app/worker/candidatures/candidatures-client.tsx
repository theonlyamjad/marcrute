"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {FileText,Clock,CheckCircle,XCircle,AlertCircle,ExternalLink,Calendar,MapPin,Building2,} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cancelApplication } from "@/actions/worker/candidatures";
import { toast } from "sonner";

interface CandidaturesPageClientProps {
  initialApplications: any[];
  initialStats: any;
}

export function CandidaturesPageClient({
  initialApplications,
  initialStats,
}: CandidaturesPageClientProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [filterStatut, setFilterStatut] = useState<string>("Tous");
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Non spécifié";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatutBadge = (statut: string) => {
    const config = {
      "En attente": {
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      Acceptée: {
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 border-green-200",
      },
      Refusée: {
        icon: XCircle,
        className: "bg-red-100 text-red-800 border-red-200",
      },
      Annulée: {
        icon: AlertCircle,
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
    };

    const { icon: Icon, className } =
      config[statut as keyof typeof config] || {
        icon: AlertCircle,
        className: "bg-gray-100 text-gray-800",
      };

    return (
      <Badge variant="outline" className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {statut}
      </Badge>
    );
  };

  const getUrgenceBadge = (urgence: string | null) => {
    if (!urgence) return null;

    const urgenceStyles = {
      Haute: "bg-red-100 text-red-800 border-red-200",
      Moyenne: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Basse: "bg-green-100 text-green-800 border-green-200",
    };

    const style =
      urgenceStyles[urgence as keyof typeof urgenceStyles] ||
      "bg-gray-100 text-gray-800";

    return (
      <Badge variant="outline" className={`text-xs ${style}`}>
        {urgence}
      </Badge>
    );
  };

  const handleCancelApplication = async (idCandidature: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette candidature ?")) {
      return;
    }

    setIsCancelling(idCandidature);
    const result = await cancelApplication({ idCandidature });

    if (result.success) {
      // Update the application status locally
      setApplications(
        applications.map((app) =>
          app.idCandidature === idCandidature
            ? { ...app, statut: "Annulée" }
            : app
        )
      );
      toast.success("Candidature annulée avec succès");
    } else {
      toast.error(result.error || "Erreur lors de l'annulation");
    }

    setIsCancelling(null);
  };

  // Filter applications
  const filteredApplications = applications.filter((c) => {
    if (filterStatut === "Tous") return true;
    return c.statut === filterStatut;
  });

  // Count by status
  const countByStatus = {
    tous: applications.length,
    enAttente: applications.filter((c) => c.statut === "En attente").length,
    acceptee: applications.filter((c) => c.statut === "Acceptée").length,
    refusee: applications.filter((c) => c.statut === "Refusée").length,
  };

  return (
    <div className="min-h-screen bg-[#F3F4F4]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#061E29] mb-2">
            Mes Candidatures
          </h1>
          <p className="text-gray-600">
            Suivez l'état de vos candidatures aux missions
          </p>
        </div>

        {/* No Applications Alert */}
        {applications.length === 0 && (
          <Alert className="mb-6 bg-blue-50 border-2 border-blue-200">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-800 font-semibold">
              Vous n'avez aucune candidature pour le moment. Consultez les
              missions disponibles pour postuler.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="flex flex-row flex-nowrap gap-4 justify-between items-stretch mb-6 w-full">
          {/* Total Card */}
          <Card className="flex-1 border-[#1D546D]/20 bg-[#1D546D]/10 min-w-37.5">
            <CardContent className="pt-6 px-2">
              <div className="text-center">
                <FileText className="h-8 w-8 mx-auto text-[#1D546D] mb-2" />
                <p className="text-2xl font-bold text-[#061E29]">
                  {countByStatus.tous}
                </p>
                <p className="text-xs sm:text-sm text-[#1D546D] font-medium">
                  Total
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pending Card */}
          <Card className="flex-1 border-yellow-200 bg-yellow-50 min-w-37.5">
            <CardContent className="pt-6 px-2">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-2xl font-bold text-yellow-800">
                  {countByStatus.enAttente}
                </p>
                <p className="text-xs sm:text-sm text-yellow-700 font-medium">
                  En attente
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Accepted Card */}
          <Card className="flex-1 border-green-200 bg-green-50 min-w-37.5">
            <CardContent className="pt-6 px-2">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-800">
                  {countByStatus.acceptee}
                </p>
                <p className="text-xs sm:text-sm text-green-700 font-medium">
                  Acceptées
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Refused Card */}
          <Card className="flex-1 border-red-200 bg-red-50 min-w-37.5">
            <CardContent className="pt-6 px-2">
              <div className="text-center">
                <XCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
                <p className="text-2xl font-bold text-red-800">
                  {countByStatus.refusee}
                </p>
                <p className="text-xs sm:text-sm text-red-700 font-medium">
                  Refusées
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Card className="border-[#1D546D]/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-[#061E29]">
                  Filtrer par statut:
                </label>
                <Select value={filterStatut} onValueChange={setFilterStatut}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tous">
                      Tous ({countByStatus.tous})
                    </SelectItem>
                    <SelectItem value="En attente">
                      En attente ({countByStatus.enAttente})
                    </SelectItem>
                    <SelectItem value="Acceptée">
                      Acceptées ({countByStatus.acceptee})
                    </SelectItem>
                    <SelectItem value="Refusée">
                      Refusées ({countByStatus.refusee})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card className="border-[#1D546D]/20">
              <CardContent className="py-12">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg mb-2">
                    Aucune candidature trouvée
                  </p>
                  <p className="text-gray-400 text-sm mb-6">
                    {filterStatut === "Tous"
                      ? "Vous n'avez pas encore postulé à des missions"
                      : `Aucune candidature avec le statut "${filterStatut}"`}
                  </p>
                  <Link href="/worker/dashboard">
                    <Button className="bg-[#5F9598] hover:bg-[#1D546D]">
                      Découvrir les missions
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((candidature) => (
              <Card
                key={candidature.idCandidature}
                className="border-[#1D546D]/20 hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl text-[#061E29]">
                          {candidature.mission.titre}
                        </CardTitle>
                        {getUrgenceBadge(candidature.mission.urgence)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {candidature.mission.institution.nomInstitution}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {candidature.mission.institution.ville.nomVille}
                        </div>
                      </div>
                    </div>
                    {getStatutBadge(candidature.statut)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Application Info */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-[#F3F4F4] rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Date de candidature
                      </p>
                      <p className="text-sm font-medium text-[#061E29]">
                        {formatDate(candidature.dateCandidature)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Période de mission
                      </p>
                      <p className="text-sm font-medium text-[#061E29]">
                        {formatDate(candidature.mission.dateDebut)} -{" "}
                        {candidature.mission.dateFin
                          ? formatDate(candidature.mission.dateFin)
                          : "Indéterminée"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Type de public
                      </p>
                      <p className="text-sm font-medium text-[#061E29]">
                        {candidature.mission.typePublic || "Non spécifié"}
                      </p>
                    </div>
                  </div>

                  {/* Message if exists */}
                  {candidature.messageTravailleur && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1 font-medium">
                        Votre message:
                      </p>
                      <p className="text-sm text-blue-900">
                        {candidature.messageTravailleur}
                      </p>
                    </div>
                  )}

                  {/* Response date if exists */}
                  {candidature.dateReponse && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Réponse reçue le {formatDate(candidature.dateReponse)}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/worker/missions/${candidature.mission.idMission}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full border-[#1D546D] text-[#1D546D] hover:bg-[#1D546D] hover:text-white"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Voir la mission
                      </Button>
                    </Link>

                    {/* Cancel button - only for pending applications */}
                    {candidature.statut === "En attente" && (
                      <Button
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                        onClick={() =>
                          handleCancelApplication(candidature.idCandidature)
                        }
                        disabled={isCancelling === candidature.idCandidature}
                      >
                        {isCancelling === candidature.idCandidature
                          ? "Annulation..."
                          : "Annuler"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
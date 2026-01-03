import Link from "next/link";
import { Mission } from "@/types/mission";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Briefcase, Clock } from "lucide-react";

interface MissionCardProps {
  mission: Mission;
}

export function MissionCard({ mission }: MissionCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "Non spécifié";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getUrgenceBadge = (urgence: string | null) => {
    if (!urgence) return null;

    const urgenceStyles = {
      Urgent: "bg-red-100 text-red-800 border-red-200",
      Normal: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Flexible: "bg-green-100 text-green-800 border-green-200",
    };

    const style = urgenceStyles[urgence as keyof typeof urgenceStyles] || "bg-gray-100 text-gray-800";

    return (
      <Badge variant="outline" className={`shrink-0 ${style}`}>
        {urgence}
      </Badge>
    );
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 border-[#1D546D]/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 text-[#061E29]">
            {mission.titre}
          </h3>
          {getUrgenceBadge(mission.urgence)}
        </div>
        <p className="text-sm font-medium text-[#1D546D]">
          {mission.institution.nomInstitution}
        </p>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {mission.description || "Aucune description disponible"}
        </p>

        <div className="space-y-2">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-[#5F9598]" />
            <span>
              {mission.institution.ville
                ? `${mission.institution.ville.nomVille}, ${mission.institution.ville.region.nomRegion}`
                : "Lieu non spécifié"}
            </span>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-[#5F9598]" />
            <span>
              {formatDate(mission.dateDebut)} - {formatDate(mission.dateFin)}
            </span>
          </div>

          {/* Required specialties */}
          {mission.specialitesRequises.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Briefcase className="h-4 w-4 text-[#5F9598] mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {mission.specialitesRequises.slice(0, 3).map((spec) => (
                  <Badge
                    key={spec.idSpecialiteRequise}
                    variant="secondary"
                    className="bg-[#F3F4F4] text-[#1D546D] text-xs"
                  >
                    {spec.specialiteRequise}
                    {spec.anneesExperienceMin && ` (${spec.anneesExperienceMin}+ ans)`}
                  </Badge>
                ))}
                {mission.specialitesRequises.length > 3 && (
                  <Badge variant="secondary" className="bg-[#F3F4F4] text-[#1D546D] text-xs">
                    +{mission.specialitesRequises.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Posted date */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>
              Publié le {formatDate(mission.dateCreation)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Button
          asChild
          className="w-full bg-[#5F9598] hover:bg-[#1D546D] text-white"
        >
          <Link href={`/worker/missions/${mission.idMission}`}>
            Voir les détails
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
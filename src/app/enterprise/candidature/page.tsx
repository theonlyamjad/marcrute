"use client"
import React, { JSX, useState, useEffect } from 'react';
import { AppSidebar } from '@/components/enterprise-dashboard/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from '@/components/ui/select';
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle,DialogTrigger,} from '@/components/ui/dialog';
import {Tabs,TabsContent,TabsList,TabsTrigger,} from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Eye, Star, Briefcase, GraduationCap, Calendar, Filter, MessageSquare, Loader2 } from 'lucide-react';
import { getCandidatures, getMissionsForFilter, acceptCandidature, rejectCandidature } from '@/actions/enterprise/candidatures';
import { toast } from 'sonner';

// Types TypeScript
interface Diplome {
  nomDiplome: string;
  nomInstitution: string;
  annee: string;
}

interface Experience {
  titrePoste: string;
  organisation: string;
  duree: string;
}

interface Travailleur {
  id: string;
  nomComplet: string;
  photo: string;
  noteMoyenne: number;
  specialites: string[];
  anneesExperience: number;
  diplomes: Diplome[];
  experiences: Experience[];
}

interface Candidature {
  id: string;
  travailleur: Travailleur;
  mission: {
    id: string;
    titre: string;
  };
  dateCandidature: string;
  messageTravailleur: string;
  statut: 'En attente' | 'Acceptée' | 'Refusée';
  dateReponse?: string;
  messageReponse?: string;
}


const getStatusBadge = (statut: Candidature['statut']): JSX.Element => {
  const variants: Record<Candidature['statut'], string> = {
    'En attente': 'bg-amber-100 text-amber-800 border-amber-200',
    'Acceptée': 'bg-[#5F9598] bg-opacity-20 text-[#1D546D] border-[#5F9598]',
    'Refusée': 'bg-red-100 text-red-800 border-red-200'
  };
  return <Badge className={`${variants[statut]} border font-medium`}>{statut}</Badge>;
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-[#5F9598] text-[#5F9598]' : 'text-gray-300'}`}
        />
      ))}
      <span className="text-sm font-medium text-[#1D546D] ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};

const ResponseDialog: React.FC<{
  type: 'accept' | 'reject';
  candidature: Candidature;
  onConfirm: (message: string) => void;
}> = ({ type, candidature, onConfirm }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleConfirm = () => {
    onConfirm(message);
    setOpen(false);
    setMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {type === 'accept' ? (
          <Button className="bg-[#5F9598] hover:bg-[#1D546D] text-white">
            <Check className="h-4 w-4 mr-2" />
            Accepter
          </Button>
        ) : (
          <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
            <X className="h-4 w-4 mr-2" />
            Refuser
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#061E29]">
            {type === 'accept' ? 'Accepter la candidature' : 'Refuser la candidature'}
          </DialogTitle>
          <DialogDescription className="text-[#5F9598]">
            Candidature de {candidature.travailleur.nomComplet} pour &quot;{candidature.mission.titre}&quot;
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message" className="text-[#061E29]">
              {type === 'accept' ? 'Message de bienvenue (optionnel)' : 'Raison du refus (optionnel)'}
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                type === 'accept'
                  ? 'Écrivez un message de bienvenue au travailleur...'
                  : 'Expliquez les raisons du refus de manière constructive...'
              }
              rows={4}
              className="border-[#5F9598] focus:border-[#1D546D]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            className={type === 'accept' ? 'bg-[#5F9598] hover:bg-[#1D546D] text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
          >
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CandidatureCard: React.FC<{
  candidature: Candidature;
  onAccept: (message: string) => void;
  onReject: (message: string) => void;
  onViewProfile: () => void;
}> = ({ candidature, onAccept, onReject, onViewProfile }) => {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex gap-4 flex-1">
            <Avatar className="h-16 w-16 border-2 border-[#5F9598]">
              <AvatarImage src={candidature.travailleur.photo} alt={candidature.travailleur.nomComplet} />
              <AvatarFallback className="bg-[#1D546D] text-white">
                {candidature.travailleur.nomComplet.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-xl text-[#061E29]">{candidature.travailleur.nomComplet}</CardTitle>
                {getStatusBadge(candidature.statut)}
              </div>
              <StarRating rating={candidature.travailleur.noteMoyenne} />
              <CardDescription className="text-[#5F9598] font-medium">
                Pour: {candidature.mission.titre}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Message du travailleur - only show if exists */}
          {candidature.messageTravailleur && (
            <div className="bg-[#F3F4F4] rounded-lg p-4 border-l-4 border-[#5F9598]">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-[#1D546D]" />
                <p className="text-xs font-semibold text-[#061E29]">Message de candidature:</p>
              </div>
              <p className="text-sm text-[#1D546D]">{candidature.messageTravailleur}</p>
            </div>
          )}

          {/* Informations */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-[#5F9598] font-medium">Date de candidature</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#1D546D]" />
                <span className="text-sm font-medium text-[#061E29]">
                  {new Date(candidature.dateCandidature).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#5F9598] font-medium">Années d&apos;expérience</p>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#1D546D]" />
                <span className="text-sm font-medium text-[#061E29]">
                  {candidature.travailleur.anneesExperience} ans
                </span>
              </div>
            </div>
          </div>

          {/* Spécialités */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#061E29]">Spécialités:</p>
            <div className="flex gap-2 flex-wrap">
              {candidature.travailleur.specialites.map((spec, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-[#F3F4F4] text-[#1D546D] border-[#5F9598]">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          {/* Diplômes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#1D546D]" />
              <p className="text-xs font-semibold text-[#061E29]">Diplômes:</p>
            </div>
            <div className="space-y-1">
              {candidature.travailleur.diplomes.map((diplome, idx) => (
                <div key={idx} className="text-sm text-[#5F9598] pl-6">
                  • {diplome.nomDiplome} - {diplome.nomInstitution} ({diplome.annee})
                </div>
              ))}
            </div>
          </div>

          {/* Expériences */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#1D546D]" />
              <p className="text-xs font-semibold text-[#061E29]">Expériences:</p>
            </div>
            <div className="space-y-1">
              {candidature.travailleur.experiences.map((exp, idx) => (
                <div key={idx} className="text-sm text-[#5F9598] pl-6">
                  • {exp.titrePoste} - {exp.organisation} ({exp.duree})
                </div>
              ))}
            </div>
          </div>

          {/* Message de réponse si acceptée/refusée */}
          {candidature.statut !== 'En attente' && candidature.messageReponse && (
            <div className="bg-[#5F9598] bg-opacity-10 rounded-lg p-4 border-l-4 border-[#1D546D]">
              <p className="text-xs font-semibold text-[#061E29] mb-2">
                Réponse envoyée le {new Date(candidature.dateReponse!).toLocaleDateString('fr-FR')}:
              </p>
              <p className="text-sm text-[#1D546D]">{candidature.messageReponse}</p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-[#5F9598] border-opacity-20 flex gap-3 flex-wrap">
            <Button
              onClick={onViewProfile}
              variant="outline"
              className="border-[#1D546D] text-[#1D546D] hover:bg-[#1D546D] hover:text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir profil complet
            </Button>
            
            {candidature.statut === 'En attente' && (
              <>
                <ResponseDialog
                  type="accept"
                  candidature={candidature}
                  onConfirm={onAccept}
                />
                <ResponseDialog
                  type="reject"
                  candidature={candidature}
                  onConfirm={onReject}
                />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Candidature: React.FC = () => {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [missions, setMissions] = useState<{ id: string; titre: string }[]>([]);
  const [filterMission, setFilterMission] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [candidaturesResult, missionsResult] = await Promise.all([
          getCandidatures({ idMission: filterMission !== 'all' ? filterMission : undefined, statut: filterStatut !== 'all' ? filterStatut : undefined }),
          getMissionsForFilter(),
        ]);

        if (candidaturesResult.success && candidaturesResult.data) {
          // Convertir les données de l'API vers le format attendu par le composant
          const formatted = candidaturesResult.data.map(c => ({
            id: c.id,
            travailleur: {
              id: c.travailleur.id,
              nomComplet: c.travailleur.nomComplet,
              photo: `https://i.pravatar.cc/150?img=${c.travailleur.id.slice(-2)}`,
              noteMoyenne: c.travailleur.noteMoyenne,
              specialites: c.travailleur.specialites,
              anneesExperience: c.travailleur.anneesExperience,
              diplomes: c.travailleur.diplomes,
              experiences: c.travailleur.experiences,
            },
            mission: c.mission,
            dateCandidature: c.dateCandidature,
            messageTravailleur: c.messageTravailleur,
            statut: c.statut,
            dateReponse: c.dateReponse,
            messageReponse: c.messageReponse,
          }));
          setCandidatures(formatted);
        }

        if (missionsResult.success && missionsResult.data) {
          setMissions(missionsResult.data.map(m => ({ id: m.idMission, titre: m.titre })));
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des candidatures");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filterMission, filterStatut]);

  const filteredCandidatures = candidatures;

  const enAttente = filteredCandidatures.filter(c => c.statut === 'En attente');
  const acceptees = filteredCandidatures.filter(c => c.statut === 'Acceptée');
  const refusees = filteredCandidatures.filter(c => c.statut === 'Refusée');

  const handleAccept = async (candidatureId: string, message: string) => {
    const result = await acceptCandidature(candidatureId, message);
    if (result.success) {
      toast.success("Candidature acceptée avec succès");
      // Recharger les données
      const candidaturesResult = await getCandidatures({ idMission: filterMission !== 'all' ? filterMission : undefined, statut: filterStatut !== 'all' ? filterStatut : undefined });
      if (candidaturesResult.success && candidaturesResult.data) {
        const formatted = candidaturesResult.data.map(c => ({
          id: c.id,
          travailleur: {
            id: c.travailleur.id,
            nomComplet: c.travailleur.nomComplet,
            photo: `https://i.pravatar.cc/150?img=${c.travailleur.id.slice(-2)}`,
            noteMoyenne: c.travailleur.noteMoyenne,
            specialites: c.travailleur.specialites,
            anneesExperience: c.travailleur.anneesExperience,
            diplomes: c.travailleur.diplomes,
            experiences: c.travailleur.experiences,
          },
          mission: c.mission,
          dateCandidature: c.dateCandidature,
          messageTravailleur: c.messageTravailleur,
          statut: c.statut,
          dateReponse: c.dateReponse,
          messageReponse: c.messageReponse,
        }));
        setCandidatures(formatted);
      }
    } else {
      toast.error(result.error || "Erreur lors de l'acceptation");
    }
  };

  const handleReject = async (candidatureId: string, message: string) => {
    const result = await rejectCandidature(candidatureId, message);
    if (result.success) {
      toast.success("Candidature refusée");
      // Recharger les données
      const candidaturesResult = await getCandidatures({ idMission: filterMission !== 'all' ? filterMission : undefined, statut: filterStatut !== 'all' ? filterStatut : undefined });
      if (candidaturesResult.success && candidaturesResult.data) {
        const formatted = candidaturesResult.data.map(c => ({
          id: c.id,
          travailleur: {
            id: c.travailleur.id,
            nomComplet: c.travailleur.nomComplet,
            photo: `https://i.pravatar.cc/150?img=${c.travailleur.id.slice(-2)}`,
            noteMoyenne: c.travailleur.noteMoyenne,
            specialites: c.travailleur.specialites,
            anneesExperience: c.travailleur.anneesExperience,
            diplomes: c.travailleur.diplomes,
            experiences: c.travailleur.experiences,
          },
          mission: c.mission,
          dateCandidature: c.dateCandidature,
          messageTravailleur: c.messageTravailleur,
          statut: c.statut,
          dateReponse: c.dateReponse,
          messageReponse: c.messageReponse,
        }));
        setCandidatures(formatted);
      }
    } else {
      toast.error(result.error || "Erreur lors du refus");
    }
  };

  const handleViewProfile = (travailleurId: string) => {
    // Rediriger vers la page du travailleur ou ouvrir un modal
    window.location.href = `/enterprise/travailleurs?id=${travailleurId}`;
  };

  if (loading) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-8 bg-[#F3F4F4]">
            <Loader2 className="h-8 w-8 animate-spin text-[#1D546D] mb-4" />
            <p className="text-[#5F9598] text-lg">Chargement des candidatures...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
          {/* En-tête */}
          <div className="bg-[#1D546D] rounded-xl p-6 shadow-lg">
            <h1 className="text-3xl font-bold text-white">Candidatures</h1>
            <p className="text-[#F3F4F4] text-opacity-90 mt-1">
              Gérez les candidatures reçues pour vos missions
            </p>
          </div>

          {/* Filtre par mission */}
          <Card className="border-none shadow-lg bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-[#5F9598]" />
                <Select value={filterMission} onValueChange={setFilterMission}>
                  <SelectTrigger className="w-75 border-[#5F9598]">
                    <SelectValue placeholder="Filtrer par mission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les missions</SelectItem>
                    {missions.map(mission => (
                      <SelectItem key={mission.id} value={mission.id}>
                        {mission.titre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabs avec candidatures */}
          <Tabs defaultValue="en-attente" className="space-y-6">
            <TabsList className="bg-white shadow-lg p-1">
              <TabsTrigger value="en-attente" className="data-[state=active]:bg-[#1D546D] data-[state=active]:text-white">
                En attente ({enAttente.length})
              </TabsTrigger>
              <TabsTrigger value="acceptees" className="data-[state=active]:bg-[#5F9598] data-[state=active]:text-white">
                Acceptées ({acceptees.length})
              </TabsTrigger>
              <TabsTrigger value="refusees" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                Refusées ({refusees.length})
              </TabsTrigger>
              <TabsTrigger value="toutes" className="data-[state=active]:bg-[#061E29] data-[state=active]:text-white">
                Toutes ({filteredCandidatures.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="en-attente" className="space-y-6">
              {enAttente.length > 0 ? (
                enAttente.map(candidature => (
                  <CandidatureCard
                    key={candidature.id}
                    candidature={candidature}
                    onAccept={(msg) => handleAccept(candidature.id, msg)}
                    onReject={(msg) => handleReject(candidature.id, msg)}
                    onViewProfile={() => handleViewProfile(candidature.travailleur.id)}
                  />
                ))
              ) : (
                <Card className="border-none shadow-lg bg-white">
                  <CardContent className="py-12 text-center">
                    <p className="text-[#5F9598] text-lg">Aucune candidature en attente</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="acceptees" className="space-y-6">
              {acceptees.length > 0 ? (
                acceptees.map(candidature => (
                  <CandidatureCard
                    key={candidature.id}
                    candidature={candidature}
                    onAccept={() => {}}
                    onReject={() => {}}
                    onViewProfile={() => handleViewProfile(candidature.travailleur.id)}
                  />
                ))
              ) : (
                <Card className="border-none shadow-lg bg-white">
                  <CardContent className="py-12 text-center">
                    <p className="text-[#5F9598] text-lg">Aucune candidature acceptée</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="refusees" className="space-y-6">
              {refusees.length > 0 ? (
                refusees.map(candidature => (
                  <CandidatureCard
                    key={candidature.id}
                    candidature={candidature}
                    onAccept={() => {}}
                    onReject={() => {}}
                    onViewProfile={() => handleViewProfile(candidature.travailleur.id)}
                  />
                ))
              ) : (
                <Card className="border-none shadow-lg bg-white">
                  <CardContent className="py-12 text-center">
                    <p className="text-[#5F9598] text-lg">Aucune candidature refusée</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="toutes" className="space-y-6">
              {filteredCandidatures.length > 0 ? (
                filteredCandidatures.map(candidature => (
                  <CandidatureCard
                    key={candidature.id}
                    candidature={candidature}
                    onAccept={(msg) => handleAccept(candidature.id, msg)}
                    onReject={(msg) => handleReject(candidature.id, msg)}
                    onViewProfile={() => handleViewProfile(candidature.travailleur.id)}
                  />
                ))
              ) : (
                <Card className="border-none shadow-lg bg-white">
                  <CardContent className="py-12 text-center">
                    <p className="text-[#5F9598] text-lg">Aucune candidature</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Candidature;
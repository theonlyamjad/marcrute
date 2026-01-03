"use client"
import React, { JSX, useState } from 'react';
import { AppSidebar } from '@/components/enterprise-dashboard/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Eye, Star, Briefcase, GraduationCap, Calendar, Filter, MessageSquare } from 'lucide-react';

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

// Données mockées
const mockCandidatures: Candidature[] = [
  {
    id: '1',
    travailleur: {
      id: 't1',
      nomComplet: 'Dr. Ahmed Benali',
      photo: 'https://i.pravatar.cc/150?img=12',
      noteMoyenne: 4.8,
      specialites: ['Psychologie clinique', 'Thérapie cognitive', 'Psychologie de l\'enfant'],
      anneesExperience: 8,
      diplomes: [
        { nomDiplome: 'Doctorat en Psychologie', nomInstitution: 'Université Mohammed V', annee: '2015' },
        { nomDiplome: 'Master en Psychologie Clinique', nomInstitution: 'Université Hassan II', annee: '2012' }
      ],
      experiences: [
        { titrePoste: 'Psychologue Clinicien', organisation: 'Centre Hospitalier Universitaire', duree: '5 ans' },
        { titrePoste: 'Psychologue pour enfants', organisation: 'Cabinet privé', duree: '3 ans' }
      ]
    },
    mission: {
      id: 'm1',
      titre: 'Psychologue pour centre d\'accueil'
    },
    dateCandidature: '2025-01-02',
    messageTravailleur: 'Je suis très intéressé par cette mission. Mon expérience de 8 ans en psychologie clinique, notamment avec les enfants en difficulté, me permet d\'apporter un accompagnement adapté et bienveillant.',
    statut: 'En attente'
  },
  {
    id: '2',
    travailleur: {
      id: 't2',
      nomComplet: 'Fatima Zahra El Amrani',
      photo: 'https://i.pravatar.cc/150?img=45',
      noteMoyenne: 4.6,
      specialites: ['Éducation spécialisée', 'Autisme', 'Troubles du comportement'],
      anneesExperience: 6,
      diplomes: [
        { nomDiplome: 'Master en Éducation Spécialisée', nomInstitution: 'ISEPS Rabat', annee: '2018' }
      ],
      experiences: [
        { titrePoste: 'Éducatrice spécialisée', organisation: 'Centre pour enfants autistes', duree: '4 ans' },
        { titrePoste: 'Éducatrice', organisation: 'Foyer de l\'enfance', duree: '2 ans' }
      ]
    },
    mission: {
      id: 'm2',
      titre: 'Éducateur spécialisé - Urgence'
    },
    dateCandidature: '2025-01-01',
    messageTravailleur: 'Forte de 6 ans d\'expérience auprès d\'adolescents en difficulté, je suis disponible immédiatement pour cette mission urgente.',
    statut: 'Acceptée',
    dateReponse: '2025-01-03',
    messageReponse: 'Votre profil correspond parfaitement à nos besoins. Nous serions ravis de vous accueillir dans notre équipe.'
  },
  {
    id: '3',
    travailleur: {
      id: 't3',
      nomComplet: 'Omar Idrissi',
      photo: 'https://i.pravatar.cc/150?img=33',
      noteMoyenne: 4.5,
      specialites: ['Travail social', 'Intervention familiale', 'Médiation'],
      anneesExperience: 5,
      diplomes: [
        { nomDiplome: 'Licence en Travail Social', nomInstitution: 'INAS Tanger', annee: '2019' }
      ],
      experiences: [
        { titrePoste: 'Assistant social', organisation: 'Services sociaux municipaux', duree: '3 ans' },
        { titrePoste: 'Médiateur familial', organisation: 'Association Solidarité', duree: '2 ans' }
      ]
    },
    mission: {
      id: 'm3',
      titre: 'Assistant social polyvalent'
    },
    dateCandidature: '2024-12-30',
    messageTravailleur: 'Mon expérience en accompagnement des familles et mes compétences en médiation me permettront d\'assurer pleinement cette mission.',
    statut: 'En attente'
  },
  {
    id: '4',
    travailleur: {
      id: 't4',
      nomComplet: 'Samira Benchekroun',
      photo: 'https://i.pravatar.cc/150?img=27',
      noteMoyenne: 3.9,
      specialites: ['Psychologie scolaire', 'Orientation'],
      anneesExperience: 3,
      diplomes: [
        { nomDiplome: 'Master en Psychologie de l\'Éducation', nomInstitution: 'Université Cadi Ayyad', annee: '2021' }
      ],
      experiences: [
        { titrePoste: 'Psychologue scolaire', organisation: 'Lycée privé', duree: '2 ans' }
      ]
    },
    mission: {
      id: 'm1',
      titre: 'Psychologue pour centre d\'accueil'
    },
    dateCandidature: '2024-12-28',
    messageTravailleur: 'Je souhaite élargir mon expérience au-delà du milieu scolaire et contribuer à l\'accompagnement des enfants en centre d\'accueil.',
    statut: 'Refusée',
    dateReponse: '2025-01-02',
    messageReponse: 'Nous recherchons un profil avec plus d\'expérience en psychologie clinique. Nous vous encourageons à postuler à nouveau dans le futur.'
  },
  {
    id: '5',
    travailleur: {
      id: 't5',
      nomComplet: 'Youssef Tazi',
      photo: 'https://i.pravatar.cc/150?img=51',
      noteMoyenne: 4.7,
      specialites: ['Orthophonie', 'Troubles du langage', 'Dyslexie'],
      anneesExperience: 7,
      diplomes: [
        { nomDiplome: 'Diplôme d\'État en Orthophonie', nomInstitution: 'Institut Supérieur de Santé', annee: '2017' }
      ],
      experiences: [
        { titrePoste: 'Orthophoniste', organisation: 'Cabinet libéral', duree: '5 ans' },
        { titrePoste: 'Orthophoniste', organisation: 'Centre médico-pédagogique', duree: '2 ans' }
      ]
    },
    mission: {
      id: 'm4',
      titre: 'Orthophoniste pédiatrique'
    },
    dateCandidature: '2024-12-27',
    messageTravailleur: 'Ma spécialisation en troubles du langage chez l\'enfant et mes 7 ans d\'expérience font de moi le candidat idéal pour cette mission.',
    statut: 'En attente'
  }
];

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
              {type === 'accept' ? 'Message de bienvenue' : 'Raison du refus'}
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
          {/* Message du travailleur */}
          <div className="bg-[#F3F4F4] rounded-lg p-4 border-l-4 border-[#5F9598]">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-[#1D546D]" />
              <p className="text-xs font-semibold text-[#061E29]">Message de candidature:</p>
            </div>
            <p className="text-sm text-[#1D546D]">{candidature.messageTravailleur}</p>
          </div>

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
  const [candidatures, setCandidatures] = useState<Candidature[]>(mockCandidatures);
  const [filterMission, setFilterMission] = useState<string>('all');

  const missions = Array.from(new Set(candidatures.map(c => c.mission.id))).map(id => {
    const candidature = candidatures.find(c => c.mission.id === id);
    return { id, titre: candidature?.mission.titre || '' };
  });

  const filteredCandidatures = candidatures.filter(c => 
    filterMission === 'all' || c.mission.id === filterMission
  );

  const enAttente = filteredCandidatures.filter(c => c.statut === 'En attente');
  const acceptees = filteredCandidatures.filter(c => c.statut === 'Acceptée');
  const refusees = filteredCandidatures.filter(c => c.statut === 'Refusée');

  const handleAccept = (candidatureId: string, message: string) => {
    setCandidatures(candidatures.map(c => 
      c.id === candidatureId 
        ? { ...c, statut: 'Acceptée', dateReponse: new Date().toISOString(), messageReponse: message }
        : c
    ));
  };

  const handleReject = (candidatureId: string, message: string) => {
    setCandidatures(candidatures.map(c => 
      c.id === candidatureId 
        ? { ...c, statut: 'Refusée', dateReponse: new Date().toISOString(), messageReponse: message }
        : c
    ));
  };

  const handleViewProfile = (travailleurId: string) => {
    console.log('View profile:', travailleurId);
  };

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
export function formatBanMessage(banInfo: {
  titre: string;
  description: string;
  dateBan: string;
  dateExpiration: string | null;
  isPermanent: boolean;
  administrateur: string;
}) {
  const formatDate = (dateStr: string, includeTime = false) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const statusText = banInfo.isPermanent 
    ? "Bannissement permanent" 
    : `Expire le ${formatDate(banInfo.dateExpiration!, true)}`;

  return {
    header: "Accès au compte restreint",
    reasonTitle: banInfo.titre,
    reasonDetail: banInfo.description,
    metadata: {
      appliedOn: formatDate(banInfo.dateBan),
      status: statusText,
      admin: banInfo.administrateur
    },
    footer: "Si vous contestez cette décision, veuillez contacter le support via notre portail d'assistance."
  };
}
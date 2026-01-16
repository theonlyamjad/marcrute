import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

interface ExportFilters {
  userType: 'worker' | 'enterprise';
  cityId?: string;
  regionId?: string;
  specialtyId?: number;
  dateFrom?: string;
  yearsExperienceRange?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { filters, format } = await request.json() as { 
      filters: ExportFilters; 
      format: 'csv' | 'excel' 
    };

    if (!filters.userType || !format) {
      return NextResponse.json(
        { error: "Type d'utilisateur et format requis" },
        { status: 400 }
      );
    }

    let data: Record<string, string | number>[] = [];
    let filename = "";

    if (filters.userType === 'worker') {
      // Build where clause for workers - don't filter by role initially
      const whereClause: Record<string, unknown> = {};

      // Date filter
      if (filters.dateFrom) {
        whereClause.dateCreation = {
          gte: new Date(filters.dateFrom),
        };
      }

      // Fetch ALL users with travailleur relation (this ensures we get workers)
      const workers = await prisma.utilisateur.findMany({
        where: {
          ...whereClause,
          travailleur: {
            isNot: null // Only get users that have a travailleur record
          }
        },
        include: {
          travailleur: {
            include: {
              ville: {
                include: {
                  region: true
                }
              },
              specialites: {
                include: {
                  categorie: true
                }
              },
              diplomes: true,
              experiences: true,
            }
          }
        }
      });

      console.log(`Found ${workers.length} workers in database`);

      // Apply additional filters
      let filteredWorkers = workers;

      if (filters.cityId) {
        filteredWorkers = filteredWorkers.filter(w => 
          w.travailleur?.idVille === filters.cityId
        );
        console.log(`After city filter: ${filteredWorkers.length} workers`);
      }

      if (filters.regionId) {
        filteredWorkers = filteredWorkers.filter(w => 
          w.travailleur?.ville?.idRegion === filters.regionId
        );
        console.log(`After region filter: ${filteredWorkers.length} workers`);
      }

      if (filters.specialtyId) {
        filteredWorkers = filteredWorkers.filter(w => 
          w.travailleur?.specialites.some(s => s.idCategorie === filters.specialtyId)
        );
        console.log(`After specialty filter: ${filteredWorkers.length} workers`);
      }

      // Years of experience filter
      if (filters.yearsExperienceRange) {
        filteredWorkers = filteredWorkers.filter(w => {
          const years = w.travailleur?.anneesExperience ?? 0;
          switch (filters.yearsExperienceRange) {
            case '0-1':
              return years >= 0 && years <= 1;
            case '1-5':
              return years > 1 && years <= 5;
            case '5-10':
              return years > 5 && years <= 10;
            case '10+':
              return years > 10;
            default:
              return true;
          }
        });
        console.log(`After years experience filter: ${filteredWorkers.length} workers`);
      }

      // Format data for export
      data = filteredWorkers.map(user => ({
        'ID': user.idUtilisateur,
        'Nom Complet': user.nomComplet || `${user.prenom || ''} ${user.nom || ''}`.trim(),
        'Email': user.email,
        'Téléphone': user.telephone || '',
        'Ville': user.travailleur?.ville?.nomVille || '',
        'Région': user.travailleur?.ville?.region?.nomRegion || '',
        'Années d\'expérience': user.travailleur?.anneesExperience || 0,
        'Spécialités': user.travailleur?.specialites.map(s => s.nomSpecialite).join(', ') || '',
        'Catégories': user.travailleur?.specialites.map(s => s.categorie?.name).filter(Boolean).join(', ') || '',
        'Statut Label': user.travailleur?.statutLabel || '',
        'Note Moyenne': user.travailleur?.noteMoyenne?.toString() || '',
        'Nombre de diplômes': user.travailleur?.diplomes.length || 0,
        'Nombre d\'expériences': user.travailleur?.experiences.length || 0,
        'Date de création': user.dateCreation.toISOString().split('T')[0],
      }));

      filename = 'Travailleurs';

    } else if (filters.userType === 'enterprise') {
      // Build where clause for enterprises
      const whereClause: Record<string, unknown> = {};

      // Date filter
      if (filters.dateFrom) {
        whereClause.dateCreation = {
          gte: new Date(filters.dateFrom),
        };
      }

      // Fetch ALL users with institution relation (this ensures we get enterprises)
      const enterprises = await prisma.utilisateur.findMany({
        where: {
          ...whereClause,
          institution: {
            isNot: null // Only get users that have an institution record
          }
        },
        include: {
          institution: {
            include: {
              ville: {
                include: {
                  region: true
                }
              },
              specialites: {
                include: {
                  categorie: true
                }
              },
              missions: true,
            }
          }
        }
      });

      console.log(`Found ${enterprises.length} enterprises in database`);

      // Apply additional filters
      let filteredEnterprises = enterprises;

      if (filters.cityId) {
        filteredEnterprises = filteredEnterprises.filter(e => 
          e.institution?.idVille === filters.cityId
        );
        console.log(`After city filter: ${filteredEnterprises.length} enterprises`);
      }

      if (filters.regionId) {
        filteredEnterprises = filteredEnterprises.filter(e => 
          e.institution?.ville?.idRegion === filters.regionId
        );
        console.log(`After region filter: ${filteredEnterprises.length} enterprises`);
      }

      if (filters.specialtyId) {
        filteredEnterprises = filteredEnterprises.filter(e => 
          e.institution?.specialites.some(s => s.idCategorie === filters.specialtyId)
        );
        console.log(`After specialty filter: ${filteredEnterprises.length} enterprises`);
      }

      // Format data for export
      data = filteredEnterprises.map(user => ({
        'ID': user.idUtilisateur,
        'Nom de l\'institution': user.institution?.nomInstitution || '',
        'Email': user.email,
        'Téléphone': user.telephone || '',
        'Téléphone Institution': user.institution?.telephoneInstitution || '',
        'Ville': user.institution?.ville?.nomVille || '',
        'Région': user.institution?.ville?.region?.nomRegion || '',
        'Adresse': user.institution?.adresse || '',
        'Site Web': user.institution?.siteWeb || '',
        'Spécialités': user.institution?.specialites.map(s => s.categorie?.name).filter(Boolean).join(', ') || '',
        'Nombre de missions': user.institution?.missions.length || 0,
        'Date de création': user.dateCreation.toISOString().split('T')[0],
      }));

      filename = 'Institutions';
    }

    console.log(`Final data length: ${data.length}`);

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée trouvée avec ces filtres" },
        { status: 404 }
      );
    }

    const dateStr = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      // Generate CSV
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            const stringValue = String(value);
            // Escape quotes and commas
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'text/csv;charset=utf-8;',
          'Content-Disposition': `attachment; filename="${filename}_${dateStr}.csv"`,
        },
      });

    } else if (format === 'excel') {
      // Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Auto-size columns
      const maxWidth = 50;
      const columnWidths = Object.keys(data[0]).map(key => {
        const maxLength = Math.max(
          key.length,
          ...data.map(row => String(row[key] || '').length)
        );
        return { wch: Math.min(maxLength + 2, maxWidth) };
      });
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, filename);

      const excelBuffer = XLSX.write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx' 
      });

      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}_${dateStr}.xlsx"`,
        },
      });
    }

    return NextResponse.json(
      { error: "Format non supporté" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Erreur lors de l'export:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'export des données" },
      { status: 500 }
    );
  }
}
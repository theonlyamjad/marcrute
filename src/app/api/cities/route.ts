import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cities = await prisma.ville.findMany({
      orderBy: {
        nomVille: 'asc'
      },
      select: {
        idVille: true,
        nomVille: true,
        idRegion: true,
      }
    });
    
    return NextResponse.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Error fetching cities' },
      { status: 500 }
    );
  }
}
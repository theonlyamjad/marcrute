import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      orderBy: {
        nomRegion: 'asc'
      },
      select: {
        idRegion: true,
        nomRegion: true,
      }
    });
    
    return NextResponse.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Error fetching regions' },
      { status: 500 }
    );
  }
}
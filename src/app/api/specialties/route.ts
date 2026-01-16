import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const specialties = await prisma.categorieSpecialite.findMany({
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
      }
    });
    
    return NextResponse.json(specialties);
  } catch (error) {
    console.error('Error fetching specialties:', error);
    return NextResponse.json(
      { error: 'Error fetching specialties' },
      { status: 500 }
    );
  }
}
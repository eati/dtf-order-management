import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Aktuális árazás lekérése
export async function GET() {
  try {
    const pricing = await prisma.pricing.findFirst({
      orderBy: { validFrom: 'desc' }
    });

    // Ha nincs árazás, akkor létrehozzuk az alapértelmezettet
    if (!pricing) {
      const newPricing = await prisma.pricing.create({
        data: {
          pricePerSqm: 6800,
          vatRate: 27,
          glsPrice: 1490,
          codPrice: 600,
        }
      });
      return NextResponse.json(newPricing);
    }

    return NextResponse.json(pricing);
  } catch (error) {
    console.error('Hiba az árazás lekérése során:', error);
    return NextResponse.json(
      { error: 'Hiba történt az árazás lekérése során' },
      { status: 500 }
    );
  }
}
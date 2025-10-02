import { NextRequest, NextResponse } from 'next/server';
import { glsClient } from '@/lib/gls-client';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ parcelNumber: string }> }
) {
  try {
    const { parcelNumber } = await params;

    if (!parcelNumber) {
      return NextResponse.json(
        { error: 'Csomagszám megadása kötelező' },
        { status: 400 }
      );
    }

    // GLS nyomkövetés lekérdezése
    const trackingResult = await glsClient.trackParcel(parcelNumber);

    if (!trackingResult.success) {
      return NextResponse.json(
        { error: trackingResult.error || 'Hiba a nyomkövetés során' },
        { status: 500 }
      );
    }

    // Opcionálisan: frissíthetjük az adatbázist a legfrissebb státusszal
    if (trackingResult.status) {
      await prisma.order.updateMany({
        where: { glsParcelNumber: parcelNumber },
        data: {
          glsStatus: trackingResult.statusText || trackingResult.status
        }
      });
    }

    return NextResponse.json({
      success: true,
      parcelNumber,
      status: trackingResult.status,
      statusText: trackingResult.statusText,
      location: trackingResult.location,
      timestamp: trackingResult.timestamp,
      trackingUrl: `https://online.gls-hungary.com/tt_page.php?tt_value=${parcelNumber}`
    });

  } catch (error) {
    console.error('GLS tracking error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a nyomkövetés során' },
      { status: 500 }
    );
  }
}

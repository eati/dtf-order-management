import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { GLSWebhookPayload } from '@/lib/types/gls';

/**
 * GLS Webhook endpoint - státusz frissítések fogadása
 * GLS automatikusan hívja ezt az endpointot, amikor a csomag státusza változik
 */
export async function POST(request: NextRequest) {
  try {
    const payload: GLSWebhookPayload = await request.json();

    // Validáció
    if (!payload.parcelNumber || !payload.status) {
      return NextResponse.json(
        { error: 'Hiányzó kötelező mezők (parcelNumber, status)' },
        { status: 400 }
      );
    }

    console.log('GLS webhook received:', payload);

    // Keressük meg a rendelést a csomagszám alapján
    const order = await prisma.order.findFirst({
      where: { glsParcelNumber: payload.parcelNumber }
    });

    if (!order) {
      console.warn(`Order not found for parcel number: ${payload.parcelNumber}`);
      return NextResponse.json(
        { error: 'Rendelés nem található' },
        { status: 404 }
      );
    }

    // Státusz szöveg előállítása
    const statusText = getStatusText(payload.statusCode || payload.status);

    // Rendelés státuszának frissítése
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        glsStatus: statusText
      }
    });

    // Ha a csomag kézbesítve lett, frissítsük a rendelés státuszt is
    if (payload.statusCode === '6' || payload.status.toLowerCase().includes('kézbesítve')) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          orderStatus: 'kiszállítva'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Státusz frissítve',
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      newStatus: statusText
    });

  } catch (error) {
    console.error('GLS webhook error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a webhook feldolgozása során' },
      { status: 500 }
    );
  }
}

/**
 * Státusz kód fordítása magyar szövegre
 */
function getStatusText(statusCode: string): string {
  const statusMap: Record<string, string> = {
    '1': 'Csomag regisztrálva',
    '2': 'Csomag átvéve',
    '3': 'Depóban',
    '4': 'Úton a címzetthez',
    '5': 'Kézbesítés alatt',
    '6': 'Kézbesítve',
    '7': 'Sikertelen kézbesítés',
    '8': 'Visszaküldve',
    '9': 'Megsemmisítve',
    '10': 'Tárolva',
  };

  return statusMap[statusCode] || statusCode;
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSzamlazzClient } from '@/lib/szamlazz';

// POST - Számla sztornózása
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Rendelés azonosító szükséges' },
        { status: 400 }
      );
    }

    // Rendelés lekérése
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Rendelés nem található' },
        { status: 404 }
      );
    }

    // Ellenőrzés: van-e számla?
    if (order.invoiceStatus !== 'kiállítva' || !order.invoiceNumber) {
      return NextResponse.json(
        { error: 'Nincs kiállított számla ehhez a rendeléshez' },
        { status: 400 }
      );
    }

    // Számlázz.hu client
    const szamlazzClient = getSzamlazzClient();

    // Számla sztornózása
    const result = await szamlazzClient.cancelInvoice(order.invoiceNumber);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Számlázz.hu hiba', message: result.message },
        { status: 500 }
      );
    }

    // Rendelés frissítése
    await prisma.order.update({
      where: { id: order.id },
      data: {
        invoiceStatus: 'sztornózva',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Számla sikeresen sztornózva',
    });
  } catch (error) {
    console.error('Hiba a számla sztornózása során:', error);
    return NextResponse.json(
      { error: 'Hiba történt a számla sztornózása során' },
      { status: 500 }
    );
  }
}

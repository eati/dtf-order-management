import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { glsClient } from '@/lib/gls-client';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    // Rendelés lekérése az ügyféllel együtt
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Rendelés nem található' },
        { status: 404 }
      );
    }

    if (order.shippingMethod !== 'gls') {
      return NextResponse.json(
        { error: 'Ez a rendelés nem GLS szállítás' },
        { status: 400 }
      );
    }

    if (order.glsParcelNumber) {
      return NextResponse.json(
        { error: 'Már létezik GLS címke ehhez a rendeléshez' },
        { status: 400 }
      );
    }

    // Cím feldolgozása
    const shippingAddr = order.shippingAddress || 
      `${order.customer.shippingZip} ${order.customer.shippingCity}, ${order.customer.shippingAddress}`;
    
    // Cím szétbontása (egyszerűsített)
    const addressParts = shippingAddr.split(',');
    const zipCity = addressParts[0]?.trim() || '';
    const street = addressParts[1]?.trim() || '';
    const zipMatch = zipCity.match(/^(\d{4})\s+(.+)$/);
    const zipCode = zipMatch ? zipMatch[1] : '';
    const city = zipMatch ? zipMatch[2] : zipCity;

    // GLS csomag létrehozása
    const glsResult = await glsClient.createParcel({
      name: order.customer.shippingName || order.customer.name,
      address: street,
      city: city,
      zipCode: zipCode,
      phone: order.customer.phone,
      email: order.customer.email || undefined,
      reference: order.orderNumber,
      weight: 1, // DTF film súlya - beállítható
      codAmount: order.paymentMethod === 'utánvét' ? order.totalGross : undefined,
      count: 1
    });

    if (!glsResult.success) {
      return NextResponse.json(
        { error: glsResult.error || 'Hiba a GLS címke létrehozása során' },
        { status: 500 }
      );
    }

    // Rendelés frissítése a GLS adatokkal
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        glsParcelNumber: glsResult.parcelNumber,
        glsLabelUrl: glsResult.labelUrl,
        glsTrackingUrl: glsResult.trackingUrl,
        glsStatus: 'Címke létrehozva'
      }
    });

    return NextResponse.json({
      success: true,
      parcelNumber: glsResult.parcelNumber,
      labelUrl: glsResult.labelUrl,
      trackingUrl: glsResult.trackingUrl,
      order: updatedOrder
    });

  } catch (error) {
    console.error('GLS címke létrehozási hiba:', error);
    return NextResponse.json(
      { error: 'Hiba történt a GLS címke létrehozása során' },
      { status: 500 }
    );
  }
}
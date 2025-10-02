import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSzamlazzClient } from '@/lib/szamlazz';

// POST - Számla kiállítása egy rendeléshez
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
      include: {
        customer: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Rendelés nem található' },
        { status: 404 }
      );
    }

    // Ellenőrzés: már van számla?
    if (order.invoiceStatus === 'kiállítva' && order.invoiceNumber) {
      return NextResponse.json(
        { error: 'Ehhez a rendeléshez már ki van állítva számla' },
        { status: 400 }
      );
    }

    // Számlázz.hu client
    const szamlazzClient = getSzamlazzClient();

    // Tételek összeállítása
    const items = [
      {
        name: `DTF nyomtatás ${order.widthMm}x${order.lengthMm}mm (${order.squareMeters.toFixed(2)} m²)`,
        quantity: 1,
        unit: 'db',
        netUnitPrice: order.productNetPrice,
        vatRate: 27,
        netPrice: order.productNetPrice,
        vatAmount: order.productVat,
        grossAmount: order.productNetPrice + order.productVat,
      },
    ];

    // Ha van szállítási díj
    if (order.shippingNetPrice > 0) {
      items.push({
        name: 'Szállítási díj (GLS)',
        quantity: 1,
        unit: 'db',
        netUnitPrice: order.shippingNetPrice,
        vatRate: 27,
        netPrice: order.shippingNetPrice,
        vatAmount: order.shippingVat,
        grossAmount: order.shippingNetPrice + order.shippingVat,
      });
    }

    // Ha van utánvét díj
    if (order.codNetPrice > 0) {
      items.push({
        name: 'Utánvét kezelési díj',
        quantity: 1,
        unit: 'db',
        netUnitPrice: order.codNetPrice,
        vatRate: 27,
        netPrice: order.codNetPrice,
        vatAmount: order.codVat,
        grossAmount: order.codNetPrice + order.codVat,
      });
    }

    // Számla kiállítása
    const result = await szamlazzClient.createInvoice({
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer.companyName || order.customer.billingName,
        zip: order.customer.billingZip,
        city: order.customer.billingCity,
        address: order.customer.billingAddress,
        email: order.customer.email,
        taxNumber: order.customer.taxNumber || undefined,
        phone: order.customer.phone,
      },
      items,
      paymentMethod: order.paymentMethod,
      paymentDate: order.paymentDate?.toISOString().split('T')[0],
      deadline: order.deadline?.toISOString().split('T')[0],
      comment: order.description || undefined,
    });

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
        invoiceStatus: 'kiállítva',
        invoiceNumber: result.invoiceNumber,
      },
    });

    return NextResponse.json({
      success: true,
      invoiceNumber: result.invoiceNumber,
      pdfUrl: result.invoicePdfUrl,
      message: 'Számla sikeresen kiállítva',
    });
  } catch (error) {
    console.error('Hiba a számla kiállítása során:', error);
    return NextResponse.json(
      { error: 'Hiba történt a számla kiállítása során' },
      { status: 500 }
    );
  }
}

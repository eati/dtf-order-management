import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Összes ügyfél lekérése
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalGross: true,
            orderStatus: true,
          }
        }
      }
    });
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Hiba az ügyfelek lekérése során:', error);
    return NextResponse.json(
      { error: 'Hiba történt az ügyfelek lekérése során' },
      { status: 500 }
    );
  }
}

// POST - Új ügyfél létrehozása
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        billingName: data.billingName,
        billingZip: data.billingZip,
        billingCity: data.billingCity,
        billingAddress: data.billingAddress,
        companyName: data.companyName || null,
        taxNumber: data.taxNumber || null,
        shippingName: data.shippingName || null,
        shippingZip: data.shippingZip || null,
        shippingCity: data.shippingCity || null,
        shippingAddress: data.shippingAddress || null,
        note: data.note || null,
      },
    });
    
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Hiba az ügyfél létrehozása során:', error);
    return NextResponse.json(
      { error: 'Hiba történt az ügyfél létrehozása során' },
      { status: 500 }
    );
  }
}
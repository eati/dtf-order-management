import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Egy ügyfél lekérése
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Ügyfél nem található' },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Hiba az ügyfél lekérése során:', error);
    return NextResponse.json(
      { error: 'Hiba történt az ügyfél lekérése során' },
      { status: 500 }
    );
  }
}

// PUT - Ügyfél frissítése
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    const customer = await prisma.customer.update({
      where: { id: parseInt(params.id) },
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        taxNumber: data.taxNumber || null,
        note: data.note || null,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Hiba az ügyfél frissítése során:', error);
    return NextResponse.json(
      { error: 'Hiba történt az ügyfél frissítése során' },
      { status: 500 }
    );
  }
}

// DELETE - Ügyfél törlése
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ellenőrizzük, hogy van-e aktív rendelése
    const orderCount = await prisma.order.count({
      where: { customerId: parseInt(params.id) }
    });

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Az ügyfél nem törölhető, mert vannak hozzá tartozó rendelések' },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Hiba az ügyfél törlése során:', error);
    return NextResponse.json(
      { error: 'Hiba történt az ügyfél törlése során' },
      { status: 500 }
    );
  }
}
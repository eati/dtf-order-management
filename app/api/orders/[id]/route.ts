import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Egy rendelés lekérése
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        customer: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Rendelés nem található' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Hiba a rendelés lekérése során:', error);
    return NextResponse.json(
      { error: 'Hiba történt a rendelés lekérése során' },
      { status: 500 }
    );
  }
}

// PUT - Rendelés frissítése
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    const order = await prisma.order.update({
      where: { id: parseInt(params.id) },
      data: {
        orderStatus: data.orderStatus,
        paymentStatus: data.paymentStatus,
        invoiceStatus: data.invoiceStatus,
        invoiceNumber: data.invoiceNumber || null,
        paymentDate: data.paymentDate || null,
        description: data.description || null,
        deadline: data.deadline || null,
      },
      include: {
        customer: true
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Hiba a rendelés frissítése során:', error);
    return NextResponse.json(
      { error: 'Hiba történt a rendelés frissítése során' },
      { status: 500 }
    );
  }
}

// DELETE - Rendelés törlése
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.order.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Hiba a rendelés törlése során:', error);
    return NextResponse.json(
      { error: 'Hiba történt a rendelés törlése során' },
      { status: 500 }
    );
  }
}
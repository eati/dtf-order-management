import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Rendelésszám generálása
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const lastOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: `DTF-${year}-`
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  let nextNumber = 1;
  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `DTF-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

// Ár számítása
function calculatePrice(lengthMm: number, shippingMethod: string, paymentMethod: string) {
  const pricing = {
    pricePerSqm: 6800,
    vatRate: 27,
    glsPrice: 1490,
    codPrice: 600
  };

  // Négyzetméter számítás (szélesség mindig 300mm)
  const squareMeters = (300 * lengthMm) / 1000000;
  
  // Termék ár
  const productNet = squareMeters * pricing.pricePerSqm;
  const productVat = productNet * (pricing.vatRate / 100);
  
  // Szállítási díj
  let shippingNet = 0;
  let shippingVat = 0;
  if (shippingMethod === 'gls') {
    shippingNet = pricing.glsPrice;
    shippingVat = shippingNet * (pricing.vatRate / 100);
  }
  
  // Utánvét díj
  let codNet = 0;
  let codVat = 0;
  if (paymentMethod === 'utánvét') {
    codNet = pricing.codPrice;
    codVat = codNet * (pricing.vatRate / 100);
  }
  
  // Összegek
  const totalNet = productNet + shippingNet + codNet;
  const totalVat = productVat + shippingVat + codVat;
  const totalGross = totalNet + totalVat;

  return {
    squareMeters: Math.round(squareMeters * 100) / 100,
    productNetPrice: Math.round(productNet),
    productVat: Math.round(productVat),
    shippingNetPrice: Math.round(shippingNet),
    shippingVat: Math.round(shippingVat),
    codNetPrice: Math.round(codNet),
    codVat: Math.round(codVat),
    totalNet: Math.round(totalNet),
    totalVat: Math.round(totalVat),
    totalGross: Math.round(totalGross)
  };
}

// GET - Összes rendelés lekérése
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const where = status ? { orderStatus: status } : {};

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Hiba a rendelések lekérése során:', error);
    return NextResponse.json(
      { error: 'Hiba történt a rendelések lekérése során' },
      { status: 500 }
    );
  }
}

// POST - Új rendelés létrehozása
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validáció
    if (!data.customerId || isNaN(data.customerId)) {
      return NextResponse.json(
        { error: 'Érvénytelen ügyfél ID' },
        { status: 400 }
      );
    }
    
    if (!data.lengthMm || isNaN(data.lengthMm) || data.lengthMm <= 0) {
      return NextResponse.json(
        { error: 'Érvénytelen hosszúság' },
        { status: 400 }
      );
    }
    
    const orderNumber = await generateOrderNumber();
    const prices = calculatePrice(data.lengthMm, data.shippingMethod, data.paymentMethod);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: data.customerId,
        widthMm: 300,
        lengthMm: data.lengthMm,
        squareMeters: prices.squareMeters,
        productNetPrice: prices.productNetPrice,
        productVat: prices.productVat,
        shippingNetPrice: prices.shippingNetPrice,
        shippingVat: prices.shippingVat,
        codNetPrice: prices.codNetPrice,
        codVat: prices.codVat,
        totalNet: prices.totalNet,
        totalVat: prices.totalVat,
        totalGross: prices.totalGross,
        description: data.description || null,
        shippingMethod: data.shippingMethod,
        shippingAddress: data.shippingAddress || null,
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
        orderStatus: 'új',
        paymentStatus: 'nem_fizetve',
        invoiceStatus: 'nincs_számla',
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
      include: {
        customer: true
      }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Hiba a rendelés létrehozása során:', error);
    
    // Részletesebb hibaüzenet
    const errorMessage = error instanceof Error ? error.message : 'Ismeretlen hiba';
    
    return NextResponse.json(
      { 
        error: 'Hiba történt a rendelés létrehozása során',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
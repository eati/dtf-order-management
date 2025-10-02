import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Havi elszámolás lekérdezése
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Dátum szűrés építése
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (year && month) {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      startDate = new Date(yearNum, monthNum - 1, 1);
      endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
    }

    // Lekérdezés feltételek
    const where: any = {
      paymentMethod: 'havi_elszámolás',
    };

    if (customerId) {
      where.customerId = parseInt(customerId);
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Rendelések lekérdezése
    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Összesítések számítása
    const summary = {
      totalOrders: orders.length,
      totalSquareMeters: orders.reduce((sum, order) => sum + order.squareMeters, 0),
      totalNet: orders.reduce((sum, order) => sum + order.totalNet, 0),
      totalVat: orders.reduce((sum, order) => sum + order.totalVat, 0),
      totalGross: orders.reduce((sum, order) => sum + order.totalGross, 0),
      byCustomer: {} as Record<string, {
        customerName: string;
        orderCount: number;
        totalSquareMeters: number;
        totalNet: number;
        totalVat: number;
        totalGross: number;
      }>,
    };

    // Ügyfél szerinti csoportosítás
    orders.forEach((order) => {
      const customerId = order.customerId.toString();
      if (!summary.byCustomer[customerId]) {
        summary.byCustomer[customerId] = {
          customerName: order.customer.name,
          orderCount: 0,
          totalSquareMeters: 0,
          totalNet: 0,
          totalVat: 0,
          totalGross: 0,
        };
      }
      summary.byCustomer[customerId].orderCount++;
      summary.byCustomer[customerId].totalSquareMeters += order.squareMeters;
      summary.byCustomer[customerId].totalNet += order.totalNet;
      summary.byCustomer[customerId].totalVat += order.totalVat;
      summary.byCustomer[customerId].totalGross += order.totalGross;
    });

    return NextResponse.json({
      orders,
      summary,
      filters: {
        customerId: customerId ? parseInt(customerId) : null,
        year: year ? parseInt(year) : null,
        month: month ? parseInt(month) : null,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Hiba a havi elszámolás lekérdezése során:', error);
    return NextResponse.json(
      { error: 'Hiba történt a havi elszámolás lekérdezése során' },
      { status: 500 }
    );
  }
}

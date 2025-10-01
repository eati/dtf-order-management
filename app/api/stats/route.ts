import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Aktív rendelések (nem lezárva)
    const activeOrders = await prisma.order.count({
      where: {
        orderStatus: {
          not: 'lezárva'
        }
      }
    });

    // Gyártásban lévő rendelések
    const inProduction = await prisma.order.count({
      where: {
        orderStatus: 'gyártásban'
      }
    });

    // Kész rendelések (kész vagy kiszállítva státuszban)
    const completed = await prisma.order.count({
      where: {
        orderStatus: {
          in: ['kész', 'kiszállítva']
        }
      }
    });

    // Havi bevétel (fizetve státuszú rendelések)
    const monthlyRevenue = await prisma.order.aggregate({
      where: {
        paymentStatus: 'fizetve',
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        totalGross: true
      }
    });

    // Éves bevétel
    const yearlyRevenue = await prisma.order.aggregate({
      where: {
        paymentStatus: 'fizetve',
        createdAt: {
          gte: startOfYear
        }
      },
      _sum: {
        totalGross: true
      }
    });

    // Nem fizetett rendelések összege
    const unpaidAmount = await prisma.order.aggregate({
      where: {
        paymentStatus: 'nem_fizetve'
      },
      _sum: {
        totalGross: true
      }
    });

    // Legutóbbi 10 rendelés
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            name: true,
            companyName: true
          }
        }
      }
    });

    // Lejáró határidők (következő 7 nap)
    const upcomingDeadlines = await prisma.order.findMany({
      where: {
        deadline: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        },
        orderStatus: {
          notIn: ['kiszállítva', 'lezárva']
        }
      },
      orderBy: { deadline: 'asc' },
      include: {
        customer: {
          select: {
            name: true,
            companyName: true
          }
        }
      }
    });

    // Mai rendelések
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    });

    // Státuszok megoszlása
    const ordersByStatus = await prisma.order.groupBy({
      by: ['orderStatus'],
      _count: {
        id: true
      }
    });

    // Fizetési státuszok megoszlása
    const ordersByPaymentStatus = await prisma.order.groupBy({
      by: ['paymentStatus'],
      _count: {
        id: true
      }
    });

    return NextResponse.json({
      activeOrders,
      inProduction,
      completed,
      monthlyRevenue: Math.round(monthlyRevenue._sum.totalGross || 0),
      yearlyRevenue: Math.round(yearlyRevenue._sum.totalGross || 0),
      unpaidAmount: Math.round(unpaidAmount._sum.totalGross || 0),
      recentOrders,
      upcomingDeadlines,
      todayOrders,
      ordersByStatus,
      ordersByPaymentStatus
    });
  } catch (error) {
    console.error('Hiba a statisztikák lekérése során:', error);
    return NextResponse.json(
      { error: 'Hiba történt a statisztikák lekérése során' },
      { status: 500 }
    );
  }
}
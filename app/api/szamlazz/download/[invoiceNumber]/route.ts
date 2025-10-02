import { NextRequest, NextResponse } from 'next/server';
import { getSzamlazzClient } from '@/lib/szamlazz';

// GET - Számla PDF letöltése
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  try {
    const { invoiceNumber } = await params;

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: 'Számlaszám szükséges' },
        { status: 400 }
      );
    }

    // Számlázz.hu client
    const szamlazzClient = getSzamlazzClient();

    // Számla letöltése
    const pdfBlob = await szamlazzClient.downloadInvoice(invoiceNumber);

    if (!pdfBlob) {
      return NextResponse.json(
        { error: 'Számla nem található vagy hiba történt a letöltés során' },
        { status: 404 }
      );
    }

    // PDF visszaadása
    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Hiba a számla letöltése során:', error);
    return NextResponse.json(
      { error: 'Hiba történt a számla letöltése során' },
      { status: 500 }
    );
  }
}

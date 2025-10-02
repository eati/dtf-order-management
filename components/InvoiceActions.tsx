'use client';

import { useState } from 'react';

interface InvoiceActionsProps {
  orderId: number;
  invoiceStatus: string;
  invoiceNumber: string | null;
  onInvoiceCreated?: () => void;
  onInvoiceCancelled?: () => void;
}

export default function InvoiceActions({
  orderId,
  invoiceStatus,
  invoiceNumber,
  onInvoiceCreated,
  onInvoiceCancelled,
}: InvoiceActionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Számla kiállítása
  const handleCreateInvoice = async () => {
    if (!confirm('Biztosan kiállítod a számlát ehhez a rendeléshez?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/szamlazz/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Hiba történt');
      }

      setSuccess(`Számla sikeresen kiállítva: ${data.invoiceNumber}`);
      onInvoiceCreated?.();

      // PDF letöltés opcionális
      if (data.pdfUrl) {
        window.open(data.pdfUrl, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba');
    } finally {
      setLoading(false);
    }
  };

  // Számla sztornózása
  const handleCancelInvoice = async () => {
    if (!confirm(`Biztosan sztornózod a számlát? (${invoiceNumber})`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/szamlazz/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Hiba történt');
      }

      setSuccess('Számla sikeresen sztornózva');
      onInvoiceCancelled?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba');
    } finally {
      setLoading(false);
    }
  };

  // Számla letöltése
  const handleDownloadInvoice = () => {
    if (!invoiceNumber) return;

    window.open(`/api/szamlazz/download/${invoiceNumber}`, '_blank');
  };

  return (
    <div className="space-y-3">
      {/* Hibaüzenet */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          ❌ {error}
        </div>
      )}

      {/* Siker üzenet */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          ✅ {success}
        </div>
      )}

      {/* Gombok */}
      <div className="flex flex-wrap gap-2">
        {/* Számla kiállítása */}
        {invoiceStatus === 'nincs_számla' && (
          <button
            onClick={handleCreateInvoice}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Kiállítás...
              </>
            ) : (
              <>
                📄 Számla Kiállítása
              </>
            )}
          </button>
        )}

        {/* Számla letöltése */}
        {invoiceStatus === 'kiállítva' && invoiceNumber && (
          <>
            <button
              onClick={handleDownloadInvoice}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              📥 Számla Letöltése
            </button>

            <button
              onClick={handleCancelInvoice}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Sztornózás...
                </>
              ) : (
                <>
                  🚫 Számla Sztornózása
                </>
              )}
            </button>
          </>
        )}

        {/* Sztornózott */}
        {invoiceStatus === 'sztornózva' && (
          <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2">
            ❌ Számla sztornózva
          </div>
        )}
      </div>

      {/* Számlaszám megjelenítése */}
      {invoiceNumber && (
        <div className="text-sm text-gray-600">
          Számlaszám: <span className="font-semibold">{invoiceNumber}</span>
        </div>
      )}
    </div>
  );
}

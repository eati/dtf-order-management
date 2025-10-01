'use client';

import { useState, useRef, useEffect } from 'react';

interface QuickActionsProps {
  orderId: number;
  currentStatus: string;
  currentPaymentStatus: string;
  onUpdate: () => void;
}

export default function QuickActions({ orderId, currentStatus, currentPaymentStatus, onUpdate }: QuickActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const statusFlow = {
    'új': 'gyártásban',
    'gyártásban': 'kész',
    'kész': 'kiszállítva',
    'kiszállítva': 'lezárva'
  };

  const statusLabels = {
    'új': 'Gyártásba',
    'gyártásban': 'Késszé tesz',
    'kész': 'Kiszállítva',
    'kiszállítva': 'Lezár',
    'lezárva': 'Lezárva'
  };

  const nextStatus = statusFlow[currentStatus as keyof typeof statusFlow];

  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 224 + window.scrollX // 224px = 14rem (menü szélessége)
      });
    }
  }, [showMenu]);

  const handleQuickStatusChange = async () => {
    if (!nextStatus) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: nextStatus,
          paymentStatus: currentPaymentStatus,
          invoiceStatus: 'nincs_számla',
        }),
      });

      if (response.ok) {
        onUpdate();
        setShowMenu(false);
      }
    } catch (error) {
      console.error('Hiba a státusz frissítése során:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: currentStatus,
          paymentStatus: newPaymentStatus,
          invoiceStatus: 'nincs_számla',
          paymentDate: newPaymentStatus === 'fizetve' ? new Date().toISOString().split('T')[0] : null,
        }),
      });

      if (response.ok) {
        onUpdate();
        setShowMenu(false);
      }
    } catch (error) {
      console.error('Hiba a fizetési státusz frissítése során:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        className="text-gray-600 hover:text-gray-900 font-medium text-sm whitespace-nowrap"
        disabled={updating}
      >
        {updating ? '...' : '⚡ Gyors'}
      </button>

      {showMenu && (
        <>
          {/* Háttér overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menü - fixed pozicionálás a dokumentum tetején */}
          <div 
            className="fixed w-56 bg-white rounded-lg shadow-2xl border-2 border-gray-300 z-50"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`
            }}
          >
            <div className="p-2">
              {/* Gyors státusz váltás */}
              {nextStatus && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Rendelés státusz
                  </div>
                  <button
                    onClick={handleQuickStatusChange}
                    disabled={updating}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded flex items-center justify-between disabled:opacity-50"
                  >
                    <span>→ {statusLabels[nextStatus as keyof typeof statusLabels]}</span>
                    <span className="text-xs text-gray-500">({nextStatus})</span>
                  </button>
                  <div className="border-t border-gray-200 my-2" />
                </>
              )}

              {/* Fizetési státusz */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Fizetési státusz
              </div>
              
              {currentPaymentStatus !== 'fizetve' && (
                <button
                  onClick={() => handlePaymentStatusChange('fizetve')}
                  disabled={updating}
                  className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded disabled:opacity-50"
                >
                  ✓ Fizetettnek jelöl
                </button>
              )}
              
              {currentPaymentStatus !== 'részben_fizetve' && (
                <button
                  onClick={() => handlePaymentStatusChange('részben_fizetve')}
                  disabled={updating}
                  className="w-full text-left px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-50 rounded disabled:opacity-50"
                >
                  ◐ Részben fizetett
                </button>
              )}
              
              {currentPaymentStatus !== 'nem_fizetve' && (
                <button
                  onClick={() => handlePaymentStatusChange('nem_fizetve')}
                  disabled={updating}
                  className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                >
                  ✗ Nem fizetve
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
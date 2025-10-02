'use client';

import { useState, useEffect } from 'react';

interface Order {
  id: number;
  orderNumber: string;
  createdAt: string;
  squareMeters: number;
  totalNet: number;
  totalVat: number;
  totalGross: number;
  description: string | null;
  invoiceStatus: string;
  invoiceNumber: string | null;
  customer: {
    id: number;
    name: string;
    email: string;
  };
}

interface CustomerSummary {
  customerName: string;
  orderCount: number;
  totalSquareMeters: number;
  totalNet: number;
  totalVat: number;
  totalGross: number;
}

interface MonthlyData {
  orders: Order[];
  summary: {
    totalOrders: number;
    totalSquareMeters: number;
    totalNet: number;
    totalVat: number;
    totalGross: number;
    byCustomer: Record<string, CustomerSummary>;
  };
  filters: {
    customerId: number | null;
    year: number | null;
    month: number | null;
  };
}

export default function MonthlyInvoicing() {
  const [data, setData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [updating, setUpdating] = useState(false);
  
  // Szűrők
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());

  // Ügyfelek betöltése
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        }
      } catch (error) {
        console.error('Hiba az ügyfelek betöltése során:', error);
      }
    };
    loadCustomers();
  }, []);

  // Adatok betöltése
  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCustomer) params.append('customerId', selectedCustomer);
      if (selectedYear) params.append('year', selectedYear);
      if (selectedMonth) params.append('month', selectedMonth);

      const response = await fetch(`/api/invoicing/monthly?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        alert('Hiba történt az adatok betöltése során');
      }
    } catch (error) {
      console.error('Hiba:', error);
      alert('Hiba történt az adatok betöltése során');
    } finally {
      setLoading(false);
    }
  };

  // Automatikus betöltés induláskor
  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hu-HU');
  };

  // Rendelés kiválasztása
  const handleSelectOrder = (orderId: number) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  // Összes kiválasztása/törlése
  const handleSelectAll = () => {
    if (!data) return;
    if (selectedOrders.length === data.orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(data.orders.map(o => o.id));
    }
  };

  // Egyedi rendelés számlázott állapotra állítása
  const handleMarkAsBilled = async (orderId: number, invoiceNumber?: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceStatus: 'kiállítva',
          invoiceNumber: invoiceNumber || `INV-${new Date().getFullYear()}-${orderId}`,
        }),
      });

      if (response.ok) {
        await loadData(); // Újratöltés
        alert('Számla státusz frissítve!');
      } else {
        alert('Hiba történt a frissítés során');
      }
    } catch (error) {
      console.error('Hiba:', error);
      alert('Hiba történt a frissítés során');
    } finally {
      setUpdating(false);
    }
  };

  // Kiválasztott rendelések tömeges számlázása
  const handleBulkMarkAsBilled = async () => {
    if (selectedOrders.length === 0) {
      alert('Nincs kiválasztott rendelés');
      return;
    }

    if (!confirm(`Biztosan számlázottnak jelölöd ${selectedOrders.length} rendelést?`)) {
      return;
    }

    setUpdating(true);
    try {
      const promises = selectedOrders.map(orderId =>
        fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceStatus: 'kiállítva',
            invoiceNumber: `INV-${new Date().getFullYear()}-${orderId}`,
          }),
        })
      );

      await Promise.all(promises);
      setSelectedOrders([]);
      await loadData();
      alert('Rendelések sikeresen számlázottnak jelölve!');
    } catch (error) {
      console.error('Hiba:', error);
      alert('Hiba történt a tömeges frissítés során');
    } finally {
      setUpdating(false);
    }
  };

  const monthNames = [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Fejléc */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Havi Elszámolás</h1>
        <p className="text-gray-600">Havi elszámolásos ügyfelek rendeléseinek összesítése</p>
      </div>

      {/* Szűrők */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Szűrők</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ügyfél
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Összes ügyfél</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Év
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hónap
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {monthNames.map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadData}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Betöltés...' : 'Szűrés'}
            </button>
          </div>
        </div>
      </div>

      {/* Tömeges műveletek */}
      {data && data.orders.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedOrders.length === data.orders.length && data.orders.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Összes kiválasztása ({selectedOrders.length} / {data.orders.length})
              </span>
            </label>
          </div>
          
          {selectedOrders.length > 0 && (
            <button
              onClick={handleBulkMarkAsBilled}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {updating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Frissítés...
                </>
              ) : (
                <>
                  ✓ Kiválasztottak számlázottnak jelölése ({selectedOrders.length} db)
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Összesítő kártyák */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Rendelések száma</div>
            <div className="text-2xl font-bold text-gray-900">{data.summary.totalOrders} db</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Összesen m²</div>
            <div className="text-2xl font-bold text-purple-600">
              {data.summary.totalSquareMeters.toFixed(2)} m²
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Nettó összesen</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.summary.totalNet)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">ÁFA összesen</div>
            <div className="text-2xl font-bold text-gray-600">
              {formatCurrency(data.summary.totalVat)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Bruttó összesen</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.summary.totalGross)}
            </div>
          </div>
        </div>
      )}

      {/* Ügyfél szerinti összesítés */}
      {data && Object.keys(data.summary.byCustomer).length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Ügyfél szerinti összesítés</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ügyfél
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Rendelések
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    m²
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Nettó
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    ÁFA
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Bruttó
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(data.summary.byCustomer).map(([customerId, summary]) => (
                  <tr key={customerId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {summary.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {summary.orderCount} db
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-purple-600 font-semibold">
                      {summary.totalSquareMeters.toFixed(2)} m²
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(summary.totalNet)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                      {formatCurrency(summary.totalVat)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                      {formatCurrency(summary.totalGross)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rendelések listája */}
      {data && data.orders.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Rendelések részletesen</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === data.orders.length && data.orders.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rendelésszám
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dátum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ügyfél
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Leírás
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    m²
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Nettó
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Bruttó
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Számla
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Művelet
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.orders.map((order) => (
                  <tr key={order.id} className={`hover:bg-gray-50 ${selectedOrders.includes(order.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-purple-600 font-semibold">
                      {order.squareMeters.toFixed(2)} m²
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(order.totalNet)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(order.totalGross)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.invoiceStatus === 'kiállítva' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ {order.invoiceNumber || 'Kiállítva'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Nincs számla
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.invoiceStatus !== 'kiállítva' && (
                        <button
                          onClick={() => handleMarkAsBilled(order.id)}
                          disabled={updating}
                          className="text-green-600 hover:text-green-800 font-medium disabled:text-gray-400"
                        >
                          Számlázott
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Üres állapot */}
      {data && data.orders.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-lg">
            Nincs havi elszámolásos rendelés a kiválasztott időszakban
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

export default function Statistics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'year'>('month');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Hiba a statisztikák betöltése során:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="text-gray-500">Betöltés...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="text-gray-500">Nincs elérhető statisztika</div>
      </div>
    );
  }

  const revenue = period === 'month' ? stats.monthlyRevenue : stats.yearlyRevenue;
  const periodLabel = period === 'month' ? 'Havi' : 'Éves';

  return (
    <div className="space-y-6">
      {/* Időszak választó */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Részletes statisztikák</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg font-medium ${
              period === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Havi
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 rounded-lg font-medium ${
              period === 'year'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Éves
          </button>
        </div>
      </div>

      {/* Bevételi összefoglaló */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="text-sm text-green-700 font-medium">{periodLabel} bevétel</div>
          <div className="text-3xl font-bold text-green-900 mt-2">
            {revenue.toLocaleString('hu-HU')} Ft
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
          <div className="text-sm text-red-700 font-medium">Nem fizetett</div>
          <div className="text-3xl font-bold text-red-900 mt-2">
            {stats.unpaidAmount.toLocaleString('hu-HU')} Ft
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-700 font-medium">Összes rendelés</div>
          <div className="text-3xl font-bold text-blue-900 mt-2">
            {stats.activeOrders + (stats.ordersByStatus?.find((s: any) => s.orderStatus === 'lezárva')?._count?.id || 0)}
          </div>
        </div>
      </div>

      {/* Rendelés státuszok */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Rendelések státusz szerint</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.ordersByStatus?.map((item: any) => {
            const colors: Record<string, { bg: string; text: string; border: string }> = {
              'új': { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-200' },
              'gyártásban': { bg: 'bg-yellow-50', text: 'text-yellow-900', border: 'border-yellow-200' },
              'kész': { bg: 'bg-green-50', text: 'text-green-900', border: 'border-green-200' },
              'kiszállítva': { bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-200' },
              'lezárva': { bg: 'bg-gray-50', text: 'text-gray-900', border: 'border-gray-200' },
            };
            const color = colors[item.orderStatus] || colors['új'];
            
            return (
              <div key={item.orderStatus} className={`${color.bg} p-4 rounded-lg border ${color.border}`}>
                <div className="text-xs text-gray-600 uppercase font-medium">{item.orderStatus}</div>
                <div className={`text-2xl font-bold ${color.text} mt-1`}>
                  {item._count.id}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fizetési státuszok */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Fizetési státuszok</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.ordersByPaymentStatus?.map((item: any) => {
            const colors: Record<string, { bg: string; text: string; border: string; label: string }> = {
              'nem_fizetve': { bg: 'bg-red-50', text: 'text-red-900', border: 'border-red-200', label: 'Nem fizetve' },
              'részben_fizetve': { bg: 'bg-yellow-50', text: 'text-yellow-900', border: 'border-yellow-200', label: 'Részben fizetve' },
              'fizetve': { bg: 'bg-green-50', text: 'text-green-900', border: 'border-green-200', label: 'Fizetve' },
            };
            const color = colors[item.paymentStatus] || colors['nem_fizetve'];
            
            return (
              <div key={item.paymentStatus} className={`${color.bg} p-6 rounded-lg border ${color.border}`}>
                <div className="text-sm text-gray-600 font-medium">{color.label}</div>
                <div className={`text-3xl font-bold ${color.text} mt-2`}>
                  {item._count.id}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Napi/Havi breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mai aktivitás */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Mai aktivitás</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="text-sm font-medium text-gray-700">Új rendelések</span>
              <span className="text-xl font-bold text-blue-900">{stats.todayOrders || 0}</span>
            </div>
          </div>
        </div>

        {/* Gyors összesítő */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Gyors összesítő</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Átlagos rendelés érték:</span>
              <span className="text-sm font-bold text-gray-900">
                {stats.activeOrders > 0 
                  ? Math.round(stats.monthlyRevenue / stats.activeOrders).toLocaleString('hu-HU') 
                  : 0} Ft
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Aktív rendelések:</span>
              <span className="text-sm font-bold text-gray-900">{stats.activeOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Lezárt rendelések:</span>
              <span className="text-sm font-bold text-gray-900">
                {stats.ordersByStatus?.find((s: any) => s.orderStatus === 'lezárva')?._count?.id || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lejáró határidők */}
      {stats.upcomingDeadlines && stats.upcomingDeadlines.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Közelgő határidők (7 napon belül)</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rendelésszám</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ügyfél</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Státusz</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Határidő</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hátralévő</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.upcomingDeadlines.map((order: any) => {
                  const daysLeft = Math.ceil((new Date(order.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysLeft <= 2;
                  
                  return (
                    <tr key={order.id} className={isUrgent ? 'bg-red-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {order.customer?.companyName || order.customer?.name}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(order.deadline).toLocaleDateString('hu-HU')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${isUrgent ? 'text-red-700' : 'text-gray-700'}`}>
                          {daysLeft} nap
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export gombok */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Exportálás</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => alert('CSV export funkció hamarosan...')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            📊 Exportálás CSV-be
          </button>
          <button
            onClick={() => alert('PDF export funkció hamarosan...')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            📄 Exportálás PDF-be
          </button>
        </div>
      </div>
    </div>
  );
}
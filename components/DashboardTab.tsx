'use client';

interface DashboardTabProps {
  stats: any;
  loading: boolean;
  onOrderClick: (orderId: number) => void;
}

export default function DashboardTab({ stats, loading, onOrderClick }: DashboardTabProps) {
  const statsData = stats || {
    activeOrders: 0,
    inProduction: 0,
    completed: 0,
    monthlyRevenue: 0,
    recentOrders: []
  };

  const statusColors: Record<string, string> = {
    'új': 'bg-blue-100 text-blue-800',
    'gyártásban': 'bg-yellow-100 text-yellow-800',
    'kész': 'bg-green-100 text-green-800',
    'kiszállítva': 'bg-purple-100 text-purple-800',
    'lezárva': 'bg-gray-100 text-gray-800'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="text-gray-500">Betöltés...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statisztikák */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Aktív rendelések</div>
          <div className="text-3xl font-bold text-blue-900 mt-2">{statsData.activeOrders}</div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-600 font-medium">Gyártásban</div>
          <div className="text-3xl font-bold text-yellow-900 mt-2">{statsData.inProduction}</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium">Kész</div>
          <div className="text-3xl font-bold text-green-900 mt-2">{statsData.completed}</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600 font-medium">Havi bevétel</div>
          <div className="text-3xl font-bold text-purple-900 mt-2">
            {statsData.monthlyRevenue.toLocaleString('hu-HU')} Ft
          </div>
        </div>
      </div>

      {/* Második sor statisztikák */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <div className="text-sm text-orange-600 font-medium">Mai rendelések</div>
          <div className="text-3xl font-bold text-orange-900 mt-2">{statsData.todayOrders || 0}</div>
        </div>
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="text-sm text-red-600 font-medium">Nem fizetett</div>
          <div className="text-3xl font-bold text-red-900 mt-2">
            {(statsData.unpaidAmount || 0).toLocaleString('hu-HU')} Ft
          </div>
        </div>
        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
          <div className="text-sm text-indigo-600 font-medium">Éves bevétel</div>
          <div className="text-3xl font-bold text-indigo-900 mt-2">
            {(statsData.yearlyRevenue || 0).toLocaleString('hu-HU')} Ft
          </div>
        </div>
      </div>

      {/* Lejáró határidők */}
      {statsData.upcomingDeadlines && statsData.upcomingDeadlines.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-bold text-red-900 mb-3">⚠️ Lejáró határidők (következő 7 nap)</h3>
          <div className="space-y-2">
            {statsData.upcomingDeadlines.map((order: any) => (
              <div key={order.id} className="flex justify-between items-center bg-white p-3 rounded">
                <div>
                  <span className="font-medium text-gray-900">{order.orderNumber}</span>
                  <span className="text-gray-600 ml-2">- {order.customer?.companyName || order.customer?.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-red-700">
                    {new Date(order.deadline).toLocaleDateString('hu-HU')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.ceil((new Date(order.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} nap
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legutóbbi rendelések */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Legutóbbi rendelések</h2>
        </div>
        {statsData.recentOrders && statsData.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rendelésszám</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ügyfél</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hossz (mm)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Státusz</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Összeg</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Műveletek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {statsData.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.customer?.companyName || order.customer?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.lengthMm.toLocaleString('hu-HU')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.totalGross.toLocaleString('hu-HU')} Ft
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button 
                        onClick={() => onOrderClick(order.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Megtekintés
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            Még nincsenek rendelések
          </div>
        )}
      </div>
    </div>
  );
}
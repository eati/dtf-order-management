'use client';

interface OrderFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  paymentFilter: string;
  setPaymentFilter: (status: string) => void;
  dateFrom: string;
  setDateFrom: (date: string) => void;
  dateTo: string;
  setDateTo: (date: string) => void;
  onReset: () => void;
}

export default function OrderFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onReset
}: OrderFiltersProps) {
  const hasActiveFilters = searchTerm || statusFilter || paymentFilter || dateFrom || dateTo;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Szűrés és keresés</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Szűrők törlése
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Keresés */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keresés
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rendelésszám, ügyfél neve..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Rendelés státusz */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rendelés státusz
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Összes</option>
            <option value="új">Új</option>
            <option value="gyártásban">Gyártásban</option>
            <option value="kész">Kész</option>
            <option value="kiszállítva">Kiszállítva</option>
            <option value="lezárva">Lezárva</option>
          </select>
        </div>

        {/* Fizetési státusz */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fizetési státusz
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Összes</option>
            <option value="nem_fizetve">Nem fizetve</option>
            <option value="részben_fizetve">Részben fizetve</option>
            <option value="fizetve">Fizetve</option>
          </select>
        </div>

        {/* Dátum szűrő gomb (collapse) */}
        <div className="flex items-end">
          <button
            onClick={() => {
              const dateFilters = document.getElementById('date-filters');
              if (dateFilters) {
                dateFilters.classList.toggle('hidden');
              }
            }}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            📅 Dátum szűrő
          </button>
        </div>
      </div>

      {/* Dátum szűrők (elrejtve alapból) */}
      <div id="date-filters" className="hidden grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dátum-tól
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dátum-ig
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Aktív szűrők kijelzése */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          <span className="text-sm text-gray-600">Aktív szűrők:</span>
          {searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Keresés: {searchTerm}
              <button
                onClick={() => setSearchTerm('')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Státusz: {statusFilter}
              <button
                onClick={() => setStatusFilter('')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {paymentFilter && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Fizetés: {paymentFilter === 'nem_fizetve' ? 'Nem fizetve' : paymentFilter === 'részben_fizetve' ? 'Részben' : 'Fizetve'}
              <button
                onClick={() => setPaymentFilter('')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {(dateFrom || dateTo) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Dátum: {dateFrom || '...'} - {dateTo || '...'}
              <button
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
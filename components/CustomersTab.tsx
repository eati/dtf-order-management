'use client';

interface CustomersTabProps {
  customers: any[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onNewCustomer: () => void;
  onEditCustomer: (customer: any) => void;
  onDeleteCustomer: (id: number) => void;
}

export default function CustomersTab({
  customers,
  loading,
  searchTerm,
  setSearchTerm,
  onNewCustomer,
  onEditCustomer,
  onDeleteCustomer
}: CustomersTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Ügyfelek</h2>
        <button
          onClick={onNewCustomer}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Új ügyfél
        </button>
      </div>

      {/* Keresés */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Keresés név, email, telefon vagy cégnév alapján..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Törlés
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500">Betöltés...</div>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500 mb-4">Még nincsenek ügyfelek</div>
          <button
            onClick={onNewCustomer}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Első ügyfél hozzáadása
          </button>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-600">
            {customers.length} ügyfél
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Név</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rendelések</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Műveletek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      {customer.companyName && (
                        <div className="text-xs text-gray-500">{customer.companyName}</div>
                      )}
                      {customer.taxNumber && (
                        <div className="text-xs text-gray-500">Adószám: {customer.taxNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{customer.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{customer.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {customer.orders?.length || 0} db
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => onEditCustomer(customer)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Szerkesztés
                      </button>
                      <button
                        onClick={() => onDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Törlés
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
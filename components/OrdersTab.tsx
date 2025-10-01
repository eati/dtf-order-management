'use client';

import { useState } from 'react';
import OrderFilters from './OrderFilters';
import QuickActions from './QuickActions';

interface OrdersTabProps {
  orders: any[];
  loading: boolean;
  selectedOrders: number[];
  onSelectOrder: (id: number) => void;
  onSelectAll: () => void;
  onBulkStatusUpdate: (status: string) => void;
  onOrderClick: (id: number) => void;
  onNewOrder: () => void;
  onUpdate: () => void;
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
  onResetFilters: () => void;
}

type SortField = 'orderNumber' | 'customer' | 'length' | 'total' | 'status' | 'payment' | 'date';
type SortDirection = 'asc' | 'desc';

export default function OrdersTab({
  orders,
  loading,
  selectedOrders,
  onSelectOrder,
  onSelectAll,
  onBulkStatusUpdate,
  onOrderClick,
  onNewOrder,
  onUpdate,
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
  onResetFilters
}: OrdersTabProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const statusColors: Record<string, string> = {
    'új': 'bg-blue-100 text-blue-800',
    'gyártásban': 'bg-yellow-100 text-yellow-800',
    'kész': 'bg-green-100 text-green-800',
    'kiszállítva': 'bg-purple-100 text-purple-800',
    'lezárva': 'bg-gray-100 text-gray-800'
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'orderNumber':
        comparison = a.orderNumber.localeCompare(b.orderNumber);
        break;
      case 'customer':
        const nameA = a.customer?.companyName || a.customer?.name || '';
        const nameB = b.customer?.companyName || b.customer?.name || '';
        comparison = nameA.localeCompare(nameB);
        break;
      case 'length':
        comparison = a.lengthMm - b.lengthMm;
        break;
      case 'total':
        comparison = a.totalGross - b.totalGross;
        break;
      case 'status':
        comparison = a.orderStatus.localeCompare(b.orderStatus);
        break;
      case 'payment':
        comparison = a.paymentStatus.localeCompare(b.paymentStatus);
        break;
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400 ml-1">⇅</span>;
    }
    return sortDirection === 'asc' ? 
      <span className="text-blue-600 ml-1">↑</span> : 
      <span className="text-blue-600 ml-1">↓</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Rendelések</h2>
        <div className="flex gap-2">
          {selectedOrders.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{selectedOrders.length} kiválasztva</span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onBulkStatusUpdate(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Tömeges művelet...</option>
                <option value="gyártásban">→ Gyártásba</option>
                <option value="kész">→ Kész</option>
                <option value="kiszállítva">→ Kiszállítva</option>
                <option value="lezárva">→ Lezár</option>
              </select>
            </div>
          )}
          <button
            onClick={onNewOrder}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Új rendelés
          </button>
        </div>
      </div>

      {/* Szűrők */}
      <OrderFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        onReset={onResetFilters}
      />

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500">Betöltés...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500 mb-4">Még nincsenek rendelések</div>
          <button
            onClick={onNewOrder}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Első rendelés létrehozása
          </button>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-600">
            {orders.length} rendelés
          </div>

          <div className="bg-white rounded-lg border border-gray-200 relative">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === orders.length && orders.length > 0}
                        onChange={onSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('orderNumber')}
                    >
                      <div className="flex items-center">
                        Rendelésszám
                        <SortIcon field="orderNumber" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('customer')}
                    >
                      <div className="flex items-center">
                        Ügyfél
                        <SortIcon field="customer" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('length')}
                    >
                      <div className="flex items-center">
                        Méret
                        <SortIcon field="length" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total')}
                    >
                      <div className="flex items-center">
                        Összeg
                        <SortIcon field="total" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Státusz
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('payment')}
                    >
                      <div className="flex items-center">
                        Fizetés
                        <SortIcon field="payment" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Műveletek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedOrders.map((order) => (
                    <tr key={order.id} className={`hover:bg-gray-50 ${selectedOrders.includes(order.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => onSelectOrder(order.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {order.customer?.companyName || order.customer?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {order.lengthMm.toLocaleString('hu-HU')} mm<br/>
                        <span className="text-xs text-gray-500">{order.squareMeters} m²</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {order.totalGross.toLocaleString('hu-HU')} Ft
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.orderStatus]}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.paymentStatus === 'fizetve' ? 'bg-green-100 text-green-800' : 
                          order.paymentStatus === 'részben_fizetve' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.paymentStatus === 'fizetve' ? 'Fizetve' :
                           order.paymentStatus === 'részben_fizetve' ? 'Részben' : 'Nem fizetve'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button 
                          onClick={() => onOrderClick(order.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Részletek
                        </button>
                        <QuickActions
                          orderId={order.id}
                          currentStatus={order.orderStatus}
                          currentPaymentStatus={order.paymentStatus}
                          onUpdate={onUpdate}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
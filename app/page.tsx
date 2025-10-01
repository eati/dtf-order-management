'use client';

import { useState, useEffect } from 'react';
import CustomerForm from '@/components/CustomerForm';
import OrderForm from '@/components/OrderForm';
import OrderDetails from '@/components/OrderDetails';
import Statistics from '@/components/Statistics';
import DashboardTab from '@/components/DashboardTab';
import OrdersTab from '@/components/OrdersTab';
import CustomersTab from '@/components/CustomersTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Szűrők
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('');
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  // Ügyfelek betöltése
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Hiba az ügyfelek betöltése során:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rendelések betöltése
  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Hiba a rendelések betöltése során:', error);
    } finally {
      setLoading(false);
    }
  };

  // Statisztikák betöltése
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

  // Első betöltés
  useEffect(() => {
    if (activeTab === 'customers') {
      loadCustomers();
    } else if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'dashboard') {
      loadStats();
    }
  }, [activeTab]);

  // Ügyfél törlése
  const handleDeleteCustomer = async (id: number) => {
    if (!confirm('Biztosan törölni szeretnéd ezt az ügyfelet?')) return;

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Hiba történt a törlés során');
        return;
      }

      loadCustomers();
    } catch (error) {
      alert('Hiba történt a törlés során');
    }
  };

  // Szűrt rendelések
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !orderSearchTerm || 
      order.orderNumber.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      order.customer?.name.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      order.customer?.companyName?.toLowerCase().includes(orderSearchTerm.toLowerCase());
    
    const matchesStatus = !orderStatusFilter || order.orderStatus === orderStatusFilter;
    const matchesPayment = !orderPaymentFilter || order.paymentStatus === orderPaymentFilter;
    
    const orderDate = new Date(order.createdAt);
    const matchesDateFrom = !orderDateFrom || orderDate >= new Date(orderDateFrom);
    const matchesDateTo = !orderDateTo || orderDate <= new Date(orderDateTo + 'T23:59:59');
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDateFrom && matchesDateTo;
  });

  // Szűrt ügyfelek
  const filteredCustomers = customers.filter(customer => {
    if (!customerSearchTerm) return true;
    const term = customerSearchTerm.toLowerCase();
    return customer.name.toLowerCase().includes(term) ||
      customer.email?.toLowerCase().includes(term) ||
      customer.phone?.toLowerCase().includes(term) ||
      customer.companyName?.toLowerCase().includes(term);
  });

  // Tömeges műveletek
  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const handleSelectOrder = (orderId: number) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.length === 0) return;
    if (!confirm(`Biztosan módosítod ${selectedOrders.length} rendelés státuszát?`)) return;

    try {
      await Promise.all(
        selectedOrders.map(orderId =>
          fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderStatus: newStatus,
              paymentStatus: orders.find(o => o.id === orderId)?.paymentStatus,
              invoiceStatus: 'nincs_számla',
            }),
          })
        )
      );
      
      setSelectedOrders([]);
      loadOrders();
    } catch (error) {
      alert('Hiba történt a tömeges frissítés során');
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <DashboardTab
            stats={stats}
            loading={loading}
            onOrderClick={setSelectedOrderId}
          />
        );
      
      case 'orders':
        return (
          <OrdersTab
            orders={filteredOrders}
            loading={loading}
            selectedOrders={selectedOrders}
            onSelectOrder={handleSelectOrder}
            onSelectAll={handleSelectAll}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            onOrderClick={setSelectedOrderId}
            onNewOrder={() => setShowOrderForm(true)}
            onUpdate={loadOrders}
            searchTerm={orderSearchTerm}
            setSearchTerm={setOrderSearchTerm}
            statusFilter={orderStatusFilter}
            setStatusFilter={setOrderStatusFilter}
            paymentFilter={orderPaymentFilter}
            setPaymentFilter={setOrderPaymentFilter}
            dateFrom={orderDateFrom}
            setDateFrom={setOrderDateFrom}
            dateTo={orderDateTo}
            setDateTo={setOrderDateTo}
            onResetFilters={() => {
              setOrderSearchTerm('');
              setOrderStatusFilter('');
              setOrderPaymentFilter('');
              setOrderDateFrom('');
              setOrderDateTo('');
            }}
          />
        );
      
      case 'customers':
        return (
          <CustomersTab
            customers={filteredCustomers}
            loading={loading}
            searchTerm={customerSearchTerm}
            setSearchTerm={setCustomerSearchTerm}
            onNewCustomer={() => {
              setEditingCustomer(null);
              setShowCustomerForm(true);
            }}
            onEditCustomer={(customer) => {
              setEditingCustomer(customer);
              setShowCustomerForm(true);
            }}
            onDeleteCustomer={handleDeleteCustomer}
          />
        );
      
      case 'stats':
        return <Statistics />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">DTF Rendeléskezelő</h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'orders', label: 'Rendelések' },
              { id: 'customers', label: 'Ügyfelek' },
              { id: 'stats', label: 'Statisztikák' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderContent()}
      </main>

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <CustomerForm
          onClose={() => {
            setShowCustomerForm(false);
            setEditingCustomer(null);
          }}
          onSuccess={loadCustomers}
          editData={editingCustomer}
        />
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <OrderForm
          onClose={() => setShowOrderForm(false)}
          onSuccess={loadOrders}
        />
      )}

      {/* Order Details Modal */}
      {selectedOrderId && (
        <OrderDetails
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onSuccess={loadOrders}
        />
      )}
    </div>
  );
}
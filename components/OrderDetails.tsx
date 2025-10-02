'use client';

import { useState, useEffect } from 'react';
import InvoiceActions from './InvoiceActions';

interface OrderDetailsProps {
  orderId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderDetails({ orderId, onClose, onSuccess }: OrderDetailsProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [creatingGLS, setCreatingGLS] = useState(false);
  const [glsError, setGlsError] = useState('');

  const [editData, setEditData] = useState({
    orderStatus: '',
    paymentStatus: '',
    invoiceStatus: '',
    invoiceNumber: '',
    paymentDate: '',
    description: '',
    deadline: '',
  });

  // Rendelés betöltése
  const loadOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error('Hiba a rendelés betöltése során');
        
        const data = await response.json();
        setOrder(data);
        setEditData({
          orderStatus: data.orderStatus,
          paymentStatus: data.paymentStatus,
          invoiceStatus: data.invoiceStatus,
          invoiceNumber: data.invoiceNumber || '',
          paymentDate: data.paymentDate ? data.paymentDate.split('T')[0] : '',
          description: data.description || '',
          deadline: data.deadline ? data.deadline.split('T')[0] : '',
        });
    } catch (err) {
      setError('Hiba történt a rendelés betöltése során');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Hiba a mentés során');

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      setIsEditing(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Biztosan törölni szeretnéd ezt a rendelést?')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Hiba a törlés során');

      onSuccess();
      onClose();
    } catch (err) {
      alert('Hiba történt a törlés során');
    }
  };

  const handleCreateGLS = async () => {
    if (!confirm('Biztosan létrehozod a GLS címkét?')) return;
    
    setCreatingGLS(true);
    setGlsError('');
    
    try {
      const response = await fetch('/api/gls/create-parcel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setGlsError(data.error || 'Hiba történt a GLS címke létrehozása során');
        return;
      }

      // Frissítjük a rendelés adatokat
      const updatedOrderResponse = await fetch(`/api/orders/${orderId}`);
      if (updatedOrderResponse.ok) {
        const updatedOrder = await updatedOrderResponse.json();
        setOrder(updatedOrder);
      }

      alert(`GLS címke sikeresen létrehozva!\nCsomagszám: ${data.parcelNumber}`);
    } catch (error) {
      console.error('GLS error:', error);
      setGlsError('Hiba történt a GLS címke létrehozása során');
    } finally {
      setCreatingGLS(false);
    }
  };

  const statusColors: Record<string, string> = {
    'új': 'bg-blue-100 text-blue-800',
    'gyártásban': 'bg-yellow-100 text-yellow-800',
    'kész': 'bg-green-100 text-green-800',
    'kiszállítva': 'bg-purple-100 text-purple-800',
    'lezárva': 'bg-gray-100 text-gray-800'
  };

  const paymentStatusColors: Record<string, string> = {
    'nem_fizetve': 'bg-red-100 text-red-800',
    'részben_fizetve': 'bg-yellow-100 text-yellow-800',
    'fizetve': 'bg-green-100 text-green-800'
  };

  const invoiceStatusColors: Record<string, string> = {
    'nincs_számla': 'bg-gray-100 text-gray-800',
    'kiállítva': 'bg-green-100 text-green-800',
    'sztornózva': 'bg-red-100 text-red-800'
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-12">
          <div className="text-gray-500">Betöltés...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Létrehozva: {new Date(order.createdAt).toLocaleString('hu-HU')}
            </p>
          </div>
          <div className="flex space-x-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Szerkesztés
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Törlés
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
                >
                  {saving ? 'Mentés...' : 'Mentés'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      orderStatus: order.orderStatus,
                      paymentStatus: order.paymentStatus,
                      invoiceStatus: order.invoiceStatus,
                      invoiceNumber: order.invoiceNumber || '',
                      paymentDate: order.paymentDate ? order.paymentDate.split('T')[0] : '',
                      description: order.description || '',
                      deadline: order.deadline ? order.deadline.split('T')[0] : '',
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Mégse
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bal oldal - Rendelés és ügyfél adatok */}
          <div className="space-y-6">
            {/* Ügyfél adatok */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ügyfél adatok</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Név:</span>
                  <span className="ml-2 font-medium">{order.customer?.name}</span>
                </div>
                {order.customer?.companyName && (
                  <div>
                    <span className="text-gray-600">Cégnév:</span>
                    <span className="ml-2 font-medium">{order.customer.companyName}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2">{order.customer?.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Telefon:</span>
                  <span className="ml-2">{order.customer?.phone}</span>
                </div>
                {order.customer?.taxNumber && (
                  <div>
                    <span className="text-gray-600">Adószám:</span>
                    <span className="ml-2">{order.customer.taxNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Termék adatok */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Termék adatok</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Szélesség:</span>
                  <span className="ml-2 font-medium">300 mm</span>
                </div>
                <div>
                  <span className="text-gray-600">Hossz:</span>
                  <span className="ml-2 font-medium">{order.lengthMm.toLocaleString('hu-HU')} mm</span>
                </div>
                <div>
                  <span className="text-gray-600">Négyzetméter:</span>
                  <span className="ml-2 font-medium">{order.squareMeters} m²</span>
                </div>
              </div>
            </div>

            {/* Szállítás és fizetés */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Szállítás és fizetés</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Szállítási mód:</span>
                  <span className="ml-2 font-medium">
                    {order.shippingMethod === 'személyes' ? 'Személyes átvétel' : 'GLS szállítás'}
                  </span>
                </div>
                {order.shippingAddress && (
                  <div>
                    <span className="text-gray-600">Szállítási cím:</span>
                    <span className="ml-2">{order.shippingAddress}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Fizetési mód:</span>
                  <span className="ml-2 font-medium">
                    {order.paymentMethod === 'előre_utalás' ? 'Előre utalás' :
                     order.paymentMethod === 'személyes_átvétel' ? 'Személyes átvételkor' :
                     order.paymentMethod === 'utánvét' ? 'Utánvét' :
                     order.paymentMethod === 'utalás' ? 'Utólagos utalás' : 'Havi elszámolás'}
                  </span>
                </div>
                
                {/* GLS adatok */}
                {order.shippingMethod === 'gls' && (
                  <>
                    <div className="border-t border-gray-300 my-2 pt-2">
                      <span className="text-sm font-semibold text-gray-700">GLS státusz:</span>
                    </div>
                    {order.glsParcelNumber ? (
                      <>
                        <div>
                          <span className="text-gray-600">Csomagszám:</span>
                          <span className="ml-2 font-mono font-medium text-blue-600">{order.glsParcelNumber}</span>
                        </div>
                        {order.glsStatus && (
                          <div>
                            <span className="text-gray-600">Státusz:</span>
                            <span className="ml-2">{order.glsStatus}</span>
                          </div>
                        )}
                        {order.glsTrackingUrl && (
                          <div>
                            <a
                              href={order.glsTrackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                            >
                              🔍 Nyomkövetés
                            </a>
                          </div>
                        )}
                        {order.glsLabelUrl && (
                          <div>
                            <a
                              href={order.glsLabelUrl}
                              download={`GLS_${order.orderNumber}.pdf`}
                              className="inline-block mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm"
                            >
                              📄 Címke letöltése
                            </a>
                          </div>
                        )}
                      </>
                    ) : (
                      <div>
                        {glsError && (
                          <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                            {glsError}
                          </div>
                        )}
                        <button
                          onClick={handleCreateGLS}
                          disabled={creatingGLS}
                          className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {creatingGLS ? (
                            <>
                              <span className="inline-block animate-spin mr-2">⏳</span>
                              Létrehozás...
                            </>
                          ) : (
                            '📦 GLS címke létrehozása'
                          )}
                        </button>
                        <p className="text-xs text-gray-500 mt-1">Még nem lett létrehozva GLS címke</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Leírás */}
            {!isEditing && order.description && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Leírás</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.description}</p>
              </div>
            )}

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leírás
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Jobb oldal - Státuszok és árazás */}
          <div className="space-y-6">
            {/* Státuszok szerkesztése */}
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rendelés státusz
                  </label>
                  <select
                    value={editData.orderStatus}
                    onChange={(e) => setEditData({ ...editData, orderStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="új">Új</option>
                    <option value="gyártásban">Gyártásban</option>
                    <option value="kész">Kész</option>
                    <option value="kiszállítva">Kiszállítva</option>
                    <option value="lezárva">Lezárva</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fizetési státusz
                  </label>
                  <select
                    value={editData.paymentStatus}
                    onChange={(e) => setEditData({ ...editData, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="nem_fizetve">Nem fizetve</option>
                    <option value="részben_fizetve">Részben fizetve</option>
                    <option value="fizetve">Fizetve</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fizetés dátuma
                  </label>
                  <input
                    type="date"
                    value={editData.paymentDate}
                    onChange={(e) => setEditData({ ...editData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Számlázási státusz
                  </label>
                  <select
                    value={editData.invoiceStatus}
                    onChange={(e) => setEditData({ ...editData, invoiceStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="nincs_számla">Nincs számla</option>
                    <option value="kiállítva">Kiállítva</option>
                    <option value="sztornózva">Sztornózva</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Számla szám
                  </label>
                  <input
                    type="text"
                    value={editData.invoiceNumber}
                    onChange={(e) => setEditData({ ...editData, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="pl: 2025-0001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Határidő
                  </label>
                  <input
                    type="date"
                    value={editData.deadline}
                    onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Státuszok</h3>
                  <div>
                    <span className="text-sm text-gray-600">Rendelés státusz:</span>
                    <div className="mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Fizetési státusz:</span>
                    <div className="mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${paymentStatusColors[order.paymentStatus]}`}>
                        {order.paymentStatus === 'fizetve' ? 'Fizetve' :
                         order.paymentStatus === 'részben_fizetve' ? 'Részben fizetve' : 'Nem fizetve'}
                      </span>
                    </div>
                    {order.paymentDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Fizetés dátuma: {new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(order.paymentDate))}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Számlázási státusz:</span>
                    <div className="mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${invoiceStatusColors[order.invoiceStatus]}`}>
                        {order.invoiceStatus === 'kiállítva' ? 'Kiállítva' :
                         order.invoiceStatus === 'sztornózva' ? 'Sztornózva' : 'Nincs számla'}
                      </span>
                    </div>
                    {order.invoiceNumber && (
                      <p className="text-xs text-gray-500 mt-1">Számla szám: {order.invoiceNumber}</p>
                    )}
                  </div>
                </div>

                {/* Számlázz.hu integráció */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">📄 Számlázás (Számlázz.hu)</h3>
                  <InvoiceActions
                    orderId={order.id}
                    invoiceStatus={order.invoiceStatus}
                    invoiceNumber={order.invoiceNumber}
                    onInvoiceCreated={() => {
                      loadOrder();
                      onSuccess();
                    }}
                    onInvoiceCancelled={() => {
                      loadOrder();
                      onSuccess();
                    }}
                  />
                </div>

                {/* Határidő */}
                {order.deadline && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm text-gray-600">Határidő:</span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(order.deadline))}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Árazás */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Árazás</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Termék nettó:</span>
                  <span className="font-medium text-blue-900">{order.productNetPrice.toLocaleString('hu-HU')} Ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Termék ÁFA:</span>
                  <span className="font-medium text-blue-900">{order.productVat.toLocaleString('hu-HU')} Ft</span>
                </div>
                {order.shippingNetPrice > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Szállítás nettó:</span>
                      <span className="font-medium text-blue-900">{order.shippingNetPrice.toLocaleString('hu-HU')} Ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Szállítás ÁFA:</span>
                      <span className="font-medium text-blue-900">{order.shippingVat.toLocaleString('hu-HU')} Ft</span>
                    </div>
                  </>
                )}
                {order.codNetPrice > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Utánvét nettó:</span>
                      <span className="font-medium text-blue-900">{order.codNetPrice.toLocaleString('hu-HU')} Ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Utánvét ÁFA:</span>
                      <span className="font-medium text-blue-900">{order.codVat.toLocaleString('hu-HU')} Ft</span>
                    </div>
                  </>
                )}
                <div className="border-t-2 border-blue-300 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-blue-800">Összesen nettó:</span>
                    <span className="font-bold text-blue-900">{order.totalNet.toLocaleString('hu-HU')} Ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-blue-800">ÁFA összesen:</span>
                    <span className="font-bold text-blue-900">{order.totalVat.toLocaleString('hu-HU')} Ft</span>
                  </div>
                  <div className="flex justify-between text-lg mt-1">
                    <span className="font-bold text-blue-900">Fizetendő bruttó:</span>
                    <span className="font-bold text-blue-600">{order.totalGross.toLocaleString('hu-HU')} Ft</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}
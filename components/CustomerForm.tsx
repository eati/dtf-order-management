'use client';

import { useState } from 'react';
import { getCityByZipCode, isValidZipCode } from '@/lib/zipCodes';

interface CustomerFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editData?: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    billingName: string | null;
    billingZip: string | null;
    billingCity: string | null;
    billingAddress: string | null;
    companyName: string | null;
    taxNumber: string | null;
    shippingName: string | null;
    shippingZip: string | null;
    shippingCity: string | null;
    shippingAddress: string | null;
    note: string | null;
  } | null;
}

export default function CustomerForm({ onClose, onSuccess, editData }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: editData?.name || '',
    email: editData?.email || '',
    phone: editData?.phone || '',
    
    // Számlázási adatok
    billingName: editData?.billingName || '',
    billingZip: editData?.billingZip || '',
    billingCity: editData?.billingCity || '',
    billingAddress: editData?.billingAddress || '',
    
    // Cég adatok
    companyName: editData?.companyName || '',
    taxNumber: editData?.taxNumber || '',
    
    // Szállítási adatok
    shippingName: editData?.shippingName || '',
    shippingZip: editData?.shippingZip || '',
    shippingCity: editData?.shippingCity || '',
    shippingAddress: editData?.shippingAddress || '',
    
    note: editData?.note || '',
  });
  
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [isCompany, setIsCompany] = useState(!!editData?.companyName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Irányítószám változás kezelése - számlázási cím
  const handleBillingZipChange = (zip: string) => {
    setFormData({ ...formData, billingZip: zip });
    
    if (isValidZipCode(zip)) {
      const city = getCityByZipCode(zip);
      if (city) {
        setFormData(prev => ({ ...prev, billingZip: zip, billingCity: city }));
      }
    }
  };

  // Irányítószám változás kezelése - szállítási cím
  const handleShippingZipChange = (zip: string) => {
    setFormData({ ...formData, shippingZip: zip });
    
    if (isValidZipCode(zip)) {
      const city = getCityByZipCode(zip);
      if (city) {
        setFormData(prev => ({ ...prev, shippingZip: zip, shippingCity: city }));
      }
    }
  };

  const handleSameAsBillingChange = (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked) {
      setFormData({
        ...formData,
        shippingName: formData.billingName,
        shippingZip: formData.billingZip,
        shippingCity: formData.billingCity,
        shippingAddress: formData.billingAddress,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = editData 
        ? `/api/customers/${editData.id}` 
        : '/api/customers';
      
      const method = editData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Hiba történt a mentés során');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {editData ? 'Ügyfél szerkesztése' : 'Új ügyfél'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Alapadatok */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Alapadatok</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kapcsolattartó neve <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Kovács János"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@pelda.hu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+36 30 123 4567"
                />
              </div>
            </div>
          </div>

          {/* Cég adatok checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isCompany"
              checked={isCompany}
              onChange={(e) => setIsCompany(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isCompany" className="ml-2 text-sm font-medium text-gray-700">
              Céges vásárló
            </label>
          </div>

          {/* Cég adatok */}
          {isCompany && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900">Céges adatok</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cégnév <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required={isCompany}
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Példa Kft."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adószám <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required={isCompany}
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12345678-1-23"
                />
              </div>
            </div>
          )}

          {/* Számlázási adatok */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Számlázási adatok <span className="text-red-500">*</span>
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Számlázási név <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.billingName}
                onChange={(e) => setFormData({ ...formData, billingName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={isCompany ? "Példa Kft." : "Kovács János"}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Irányítószám <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={formData.billingZip}
                  onChange={(e) => handleBillingZipChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234"
                />
                {formData.billingZip && isValidZipCode(formData.billingZip) && getCityByZipCode(formData.billingZip) && (
                  <p className="mt-1 text-xs text-green-600">✓ Település automatikusan kitöltve</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Város <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.billingCity}
                  onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Budapest"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Utca, házszám <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.billingAddress}
                onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Példa utca 123."
              />
            </div>
          </div>

          {/* Szállítási adatok */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Szállítási adatok</h3>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Megegyezik a számlázási címmel</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Szállítási név
              </label>
              <input
                type="text"
                disabled={sameAsBilling}
                value={formData.shippingName}
                onChange={(e) => setFormData({ ...formData, shippingName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Kovács János"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Irányítószám
                </label>
                <input
                  type="text"
                  disabled={sameAsBilling}
                  maxLength={4}
                  value={formData.shippingZip}
                  onChange={(e) => handleShippingZipChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="1234"
                />
                {!sameAsBilling && formData.shippingZip && isValidZipCode(formData.shippingZip) && getCityByZipCode(formData.shippingZip) && (
                  <p className="mt-1 text-xs text-green-600">✓ Település automatikusan kitöltve</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Város
                </label>
                <input
                  type="text"
                  disabled={sameAsBilling}
                  value={formData.shippingCity}
                  onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Budapest"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Utca, házszám
              </label>
              <input
                type="text"
                disabled={sameAsBilling}
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Példa utca 123."
              />
            </div>
          </div>

          {/* Megjegyzés */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Megjegyzés
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="További információk..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Mégse
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
            >
              {loading ? 'Mentés...' : (editData ? 'Módosítás' : 'Létrehozás')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
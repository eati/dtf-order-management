'use client';

import { useState, useEffect } from 'react';

interface OrderFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  companyName: string | null;
}

export default function OrderForm({ onClose, onSuccess }: OrderFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pricing, setPricing] = useState({
    pricePerSqm: 6800,
    vatRate: 27,
    glsPrice: 1490,
    codPrice: 600
  });
  
  const [formData, setFormData] = useState({
    customerId: '',
    lengthMm: '',
    description: '',
    shippingMethod: 'személyes' as 'személyes' | 'gls',
    shippingAddress: '',
    paymentMethod: 'előre_utalás' as 'előre_utalás' | 'személyes_átvétel' | 'utánvét' | 'utalás' | 'havi_elszámolás',
    deadline: '',
  });

  const [calculatedPrice, setCalculatedPrice] = useState({
    squareMeters: 0,
    productNet: 0,
    productVat: 0,
    shippingNet: 0,
    shippingVat: 0,
    codNet: 0,
    codVat: 0,
    totalNet: 0,
    totalVat: 0,
    totalGross: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ügyfelek és árazás betöltése
  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersRes, pricingRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/pricing')
        ]);
        
        const customersData = await customersRes.json();
        const pricingData = await pricingRes.json();
        
        setCustomers(customersData);
        setPricing(pricingData);
      } catch (error) {
        console.error('Hiba az adatok betöltése során:', error);
      }
    };
    
    loadData();
  }, []);

  // Ár kalkuláció
  useEffect(() => {
    if (!formData.lengthMm) {
      setCalculatedPrice({
        squareMeters: 0,
        productNet: 0,
        productVat: 0,
        shippingNet: 0,
        shippingVat: 0,
        codNet: 0,
        codVat: 0,
        totalNet: 0,
        totalVat: 0,
        totalGross: 0
      });
      return;
    }

    const lengthMm = parseInt(formData.lengthMm);
    const squareMeters = (300 * lengthMm) / 1000000;
    
    // Termék ár
    const productNet = squareMeters * pricing.pricePerSqm;
    const productVat = productNet * (pricing.vatRate / 100);
    
    // Szállítási díj
    let shippingNet = 0;
    let shippingVat = 0;
    if (formData.shippingMethod === 'gls') {
      shippingNet = pricing.glsPrice;
      shippingVat = shippingNet * (pricing.vatRate / 100);
    }
    
    // Utánvét díj
    let codNet = 0;
    let codVat = 0;
    if (formData.paymentMethod === 'utánvét') {
      codNet = pricing.codPrice;
      codVat = codNet * (pricing.vatRate / 100);
    }
    
    // Összegek
    const totalNet = productNet + shippingNet + codNet;
    const totalVat = productVat + shippingVat + codVat;
    const totalGross = totalNet + totalVat;

    setCalculatedPrice({
      squareMeters: Math.round(squareMeters * 100) / 100,
      productNet: Math.round(productNet),
      productVat: Math.round(productVat),
      shippingNet: Math.round(shippingNet),
      shippingVat: Math.round(shippingVat),
      codNet: Math.round(codNet),
      codVat: Math.round(codVat),
      totalNet: Math.round(totalNet),
      totalVat: Math.round(totalVat),
      totalGross: Math.round(totalGross)
    });
  }, [formData.lengthMm, formData.shippingMethod, formData.paymentMethod, pricing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: parseInt(formData.customerId),
          lengthMm: parseInt(formData.lengthMm),
          description: formData.description || null,
          shippingMethod: formData.shippingMethod,
          shippingAddress: formData.shippingAddress || null,
          paymentMethod: formData.paymentMethod,
          deadline: formData.deadline || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Hiba történt a rendelés létrehozása során');
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
          <h2 className="text-2xl font-bold text-gray-900">Új rendelés</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bal oldal - Rendelés adatok */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Rendelés adatok</h3>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ügyfél <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Válassz ügyfelet...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.companyName || customer.name} - {customer.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hossz (mm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.lengthMm}
                  onChange={(e) => setFormData({ ...formData, lengthMm: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5000"
                />
                <p className="text-sm text-gray-500 mt-1">Szélesség: 300 mm (fix)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leírás
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rendelés részletei..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Szállítási mód <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.shippingMethod}
                  onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="személyes">Személyes átvétel</option>
                  <option value="gls">GLS szállítás (+{pricing.glsPrice} Ft + ÁFA)</option>
                </select>
              </div>

              {formData.shippingMethod === 'gls' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Szállítási cím
                  </label>
                  <textarea
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Szállítási cím..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fizetési mód <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="előre_utalás">Előre utalás</option>
                  <option value="személyes_átvétel">Személyes átvételkor</option>
                  <option value="utánvét">Utánvét (+{pricing.codPrice} Ft + ÁFA)</option>
                  <option value="utalás">Utólagos utalás</option>
                  <option value="havi_elszámolás">Havi elszámolás</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Határidő
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Jobb oldal - Ár kalkuláció */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Ár kalkuláció</h3>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Négyzetméter:</span>
                  <span className="font-medium">{calculatedPrice.squareMeters} m²</span>
                </div>

                <div className="border-t border-gray-300 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Termék nettó:</span>
                    <span className="font-medium">{calculatedPrice.productNet.toLocaleString('hu-HU')} Ft</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Termék ÁFA (27%):</span>
                    <span className="font-medium">{calculatedPrice.productVat.toLocaleString('hu-HU')} Ft</span>
                  </div>
                </div>

                {calculatedPrice.shippingNet > 0 && (
                  <div className="border-t border-gray-300 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Szállítás nettó:</span>
                      <span className="font-medium">{calculatedPrice.shippingNet.toLocaleString('hu-HU')} Ft</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Szállítás ÁFA (27%):</span>
                      <span className="font-medium">{calculatedPrice.shippingVat.toLocaleString('hu-HU')} Ft</span>
                    </div>
                  </div>
                )}

                {calculatedPrice.codNet > 0 && (
                  <div className="border-t border-gray-300 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Utánvét nettó:</span>
                      <span className="font-medium">{calculatedPrice.codNet.toLocaleString('hu-HU')} Ft</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Utánvét ÁFA (27%):</span>
                      <span className="font-medium">{calculatedPrice.codVat.toLocaleString('hu-HU')} Ft</span>
                    </div>
                  </div>
                )}

                <div className="border-t-2 border-gray-400 pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Összesen nettó:</span>
                    <span className="font-bold">{calculatedPrice.totalNet.toLocaleString('hu-HU')} Ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">ÁFA összesen:</span>
                    <span className="font-bold">{calculatedPrice.totalVat.toLocaleString('hu-HU')} Ft</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-gray-900">Fizetendő bruttó:</span>
                    <span className="font-bold text-blue-600">{calculatedPrice.totalGross.toLocaleString('hu-HU')} Ft</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Árazás:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {pricing.pricePerSqm.toLocaleString('hu-HU')} Ft/m² + {pricing.vatRate}% ÁFA</li>
                  <li>• GLS szállítás: {pricing.glsPrice.toLocaleString('hu-HU')} Ft + ÁFA</li>
                  <li>• Utánvét díj: {pricing.codPrice.toLocaleString('hu-HU')} Ft + ÁFA</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
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
              disabled={loading || !formData.customerId || !formData.lengthMm}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
            >
              {loading ? 'Létrehozás...' : 'Rendelés létrehozása'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
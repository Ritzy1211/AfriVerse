'use client';

import { useState } from 'react';
import { CheckCircle, ArrowRight, Building2 } from 'lucide-react';

interface AdvertisingPackage {
  id: string;
  name: string;
  price: string;
  includes: string[];
}

interface AdvertisingCheckoutProps {
  packages: AdvertisingPackage[];
}

export default function AdvertisingCheckout({ packages }: AdvertisingCheckoutProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    contactName: '',
    phone: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenCheckout = (packageId: string) => {
    setSelectedPackage(packageId);
    setIsModalOpen(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.companyName || !formData.contactName) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'advertising',
          packageType: selectedPackage,
          email: formData.email,
          companyName: formData.companyName,
          contactName: formData.contactName,
          phone: formData.phone,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.authorizationUrl) {
        window.location.href = data.data.authorizationUrl;
      } else {
        setError(data.error || 'Failed to initialize payment');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPackageDetails = (id: string) => {
    return packages.find(p => 
      p.name.toUpperCase().replace(/ /g, '_') === id || 
      p.name === 'Sponsored Article' && id === 'SPONSORED_ARTICLE' ||
      p.name === 'Content Series' && id === 'CONTENT_SERIES' ||
      p.name === 'Brand Takeover' && id === 'BRAND_TAKEOVER'
    );
  };

  return (
    <>
      {/* Package Cards with Buy Now buttons */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {packages.map((pkg, index) => {
          const packageId = pkg.name === 'Sponsored Article' ? 'SPONSORED_ARTICLE' 
            : pkg.name === 'Content Series' ? 'CONTENT_SERIES' 
            : 'BRAND_TAKEOVER';
          
          return (
            <div 
              key={pkg.name}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ${
                index === 1 ? 'ring-2 ring-amber-500 relative' : ''
              }`}
            >
              {index === 1 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </span>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{pkg.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{pkg.price}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {pkg.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleOpenCheckout(packageId)}
                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  index === 1
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Buy Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedPackage && getPackageDetails(selectedPackage)?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedPackage && getPackageDetails(selectedPackage)?.price}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Campaign Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Tell us about your campaign goals..."
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay Now
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-gray-500">
                Secure payment powered by Paystack
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

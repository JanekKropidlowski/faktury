import React, { useState } from 'react';
import { Business } from '../types';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface BusinessFormProps {
  business?: Business | null;
  onSave: (business: any) => Promise<void>;
  onCancel: () => void;
}

export default function BusinessForm({ business, onSave, onCancel }: BusinessFormProps) {
  const [formData, setFormData] = useState({
    name: business?.name || '',
    seller_name: business?.seller_name || '',
    seller_address: business?.seller_address || '',
    seller_nip: business?.seller_nip || '',
    seller_bank_account: business?.seller_bank_account || '',
    monthly_limit: business?.monthly_limit || 8000,
    yearly_limit: business?.yearly_limit || 20000,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSave(formData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('limit') ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onCancel}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Powrót do listy
        </button>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {business ? 'Edytuj działalność' : 'Dodaj działalność'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Błąd</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nazwa działalności *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="np. Fotografia ślubna"
              />
            </div>

            <div>
              <label htmlFor="seller_name" className="block text-sm font-medium text-gray-700">
                Nazwa sprzedawcy *
              </label>
              <input
                type="text"
                name="seller_name"
                id="seller_name"
                required
                value={formData.seller_name}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Jan Kowalski"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="seller_address" className="block text-sm font-medium text-gray-700">
                Adres sprzedawcy *
              </label>
              <textarea
                name="seller_address"
                id="seller_address"
                required
                rows={3}
                value={formData.seller_address}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ul. Przykładowa 123&#10;00-000 Warszawa"
              />
            </div>

            <div>
              <label htmlFor="seller_nip" className="block text-sm font-medium text-gray-700">
                NIP (opcjonalnie)
              </label>
              <input
                type="text"
                name="seller_nip"
                id="seller_nip"
                value={formData.seller_nip}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="1234567890"
              />
            </div>

            <div>
              <label htmlFor="seller_bank_account" className="block text-sm font-medium text-gray-700">
                Numer rachunku (opcjonalnie)
              </label>
              <input
                type="text"
                name="seller_bank_account"
                id="seller_bank_account"
                value={formData.seller_bank_account}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="12 1234 5678 9012 3456 7890 1234"
              />
            </div>

            <div>
              <label htmlFor="monthly_limit" className="block text-sm font-medium text-gray-700">
                Limit miesięczny (PLN) *
              </label>
              <input
                type="number"
                name="monthly_limit"
                id="monthly_limit"
                required
                min="0"
                step="0.01"
                value={formData.monthly_limit}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="yearly_limit" className="block text-sm font-medium text-gray-700">
                Limit roczny (PLN) *
              </label>
              <input
                type="number"
                name="yearly_limit"
                id="yearly_limit"
                required
                min="0"
                step="0.01"
                value={formData.yearly_limit}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                business ? 'Zapisz zmiany' : 'Utwórz działalność'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { InvoiceItem } from '../types';
import { apiService } from '../services/api';
import { ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react';

interface InvoiceFormProps {
  invoiceId?: number;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function InvoiceForm({ invoiceId, onSave, onCancel }: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    issue_date: new Date().toISOString().split('T')[0],
    buyer_name: '',
    buyer_address: '',
    buyer_nip: '',
    notes: ''
  });

  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    { name: '', quantity: 1, unit_price: 0, tax_rate: 0 }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(!!invoiceId);

  useEffect(() => {
    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoadingData(true);
      const invoice = await apiService.getInvoice(invoiceId!);
      setFormData({
        issue_date: invoice.issue_date,
        buyer_name: invoice.buyer_name,
        buyer_address: invoice.buyer_address,
        buyer_nip: invoice.buyer_nip || '',
        notes: invoice.notes || ''
      });
      setItems(invoice.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (items.length === 0 || !items.some(item => item.name)) {
      setError('Dodaj przynajmniej jedną pozycję faktury');
      return;
    }

    setLoading(true);

    try {
      const invoiceData = {
        ...formData,
        items: items.filter(item => item.name)
      };

      if (invoiceId) {
        await apiService.updateInvoice(invoiceId, invoiceData);
      } else {
        await apiService.createInvoice(invoiceData);
      }

      if (onSave) {
        onSave();
      } else {
        window.location.href = '/invoices';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const addItem = () => {
    setItems(prev => [...prev, { name: '', quantity: 1, unit_price: 0, tax_rate: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateItemTotal = (item: Partial<InvoiceItem>) => {
    const subtotal = (item.quantity || 0) * (item.unit_price || 0);
    const tax = subtotal * ((item.tax_rate || 0) / 100);
    return subtotal + tax;
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onCancel || (() => window.history.back())}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Powrót
        </button>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {invoiceId ? 'Edytuj fakturę' : 'Nowa faktura'}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Szczegóły faktury</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700">
                Data wystawienia *
              </label>
              <input
                type="date"
                name="issue_date"
                id="issue_date"
                required
                value={formData.issue_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Buyer Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Dane nabywcy</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="buyer_name" className="block text-sm font-medium text-gray-700">
                Nazwa nabywcy *
              </label>
              <input
                type="text"
                name="buyer_name"
                id="buyer_name"
                required
                value={formData.buyer_name}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nazwa firmy lub imię i nazwisko"
              />
            </div>

            <div>
              <label htmlFor="buyer_address" className="block text-sm font-medium text-gray-700">
                Adres nabywcy *
              </label>
              <textarea
                name="buyer_address"
                id="buyer_address"
                required
                rows={3}
                value={formData.buyer_address}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Adres nabywcy"
              />
            </div>

            <div>
              <label htmlFor="buyer_nip" className="block text-sm font-medium text-gray-700">
                NIP nabywcy (opcjonalnie)
              </label>
              <input
                type="text"
                name="buyer_nip"
                id="buyer_nip"
                value={formData.buyer_nip}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="1234567890"
              />
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Pozycje faktury</h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Dodaj pozycję
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nazwa usługi/produktu *
                    </label>
                    <input
                      type="text"
                      required
                      value={item.name || ''}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Nazwa pozycji"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ilość *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={item.quantity || ''}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cena jedn. (PLN) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={item.unit_price || ''}
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Podatek (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.tax_rate || ''}
                      onChange={(e) => handleItemChange(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Razem (PLN)
                      </label>
                      <div className="mt-1 text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('pl-PL', {
                          style: 'currency',
                          currency: 'PLN'
                        }).format(calculateItemTotal(item))}
                      </div>
                    </div>
                    
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <div className="text-lg font-medium">
              Razem do zapłaty: {new Intl.NumberFormat('pl-PL', {
                style: 'currency',
                currency: 'PLN'
              }).format(calculateGrandTotal())}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Notatki</h2>
          
          <div>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={handleInputChange}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Dodatkowe informacje (opcjonalnie)"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel || (() => window.history.back())}
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
              invoiceId ? 'Zapisz zmiany' : 'Utwórz fakturę'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
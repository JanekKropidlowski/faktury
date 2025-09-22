import React, { useState, useEffect } from 'react';
import { InvoiceWithBusiness } from '../types';
import { apiService } from '../services/api';
import { ArrowLeft, Printer, AlertCircle, Edit } from 'lucide-react';

interface InvoiceViewProps {
  invoiceId: number;
}

export default function InvoiceView({ invoiceId }: InvoiceViewProps) {
  const [invoice, setInvoice] = useState<InvoiceWithBusiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await apiService.getInvoice(invoiceId);
      setInvoice(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Błąd</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Faktura nie znaleziona</h3>
      </div>
    );
  }

  return (
    <div>
      {/* Header with actions - hidden in print */}
      <div className="mb-6 print:hidden">
        <div className="flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Powrót
          </button>
          
          <div className="flex space-x-3">
            <a
              href={`/invoices/${invoiceId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edytuj
            </a>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Printer className="h-4 w-4 mr-2" />
              Drukuj
            </button>
          </div>
        </div>
      </div>

      {/* Invoice content - optimized for print */}
      <div className="bg-white shadow-sm print:shadow-none print:bg-white">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FAKTURA</h1>
              <p className="text-xl text-gray-600 mt-2">{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Data wystawienia:</p>
              <p className="text-lg font-medium">{formatDate(invoice.issue_date)}</p>
            </div>
          </div>

          {/* Seller and Buyer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Sprzedawca:</h2>
              <div className="text-gray-700">
                <p className="font-medium">{invoice.seller_name}</p>
                <div className="whitespace-pre-line mt-1">{invoice.seller_address}</div>
                {invoice.seller_nip && (
                  <p className="mt-1">NIP: {invoice.seller_nip}</p>
                )}
                {invoice.seller_bank_account && (
                  <p className="mt-1">Nr rachunku: {invoice.seller_bank_account}</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Nabywca:</h2>
              <div className="text-gray-700">
                <p className="font-medium">{invoice.buyer_name}</p>
                <div className="whitespace-pre-line mt-1">{invoice.buyer_address}</div>
                {invoice.buyer_nip && (
                  <p className="mt-1">NIP: {invoice.buyer_nip}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lp.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nazwa towaru/usługi
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ilość
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cena jedn.
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Podatek
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wartość
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items?.map((item, index) => {
                  const subtotal = item.quantity * item.unit_price;
                  const taxAmount = subtotal * (item.tax_rate / 100);
                  
                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {item.tax_rate}%
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Razem do zapłaty:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(invoice.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Uwagi:</h3>
              <div className="whitespace-pre-line text-gray-700">{invoice.notes}</div>
            </div>
          )}

          {/* Footer info */}
          <div className="text-center text-sm text-gray-500 border-t pt-6">
            <p>Działalność nierejestrowana - zwolnienie podmiotowe z podatku VAT</p>
          </div>
        </div>
      </div>
    </div>
  );
}
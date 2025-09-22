import React from 'react';
import Dashboard from './Dashboard';
import InvoiceList from './InvoiceList';
import InvoiceForm from './InvoiceForm';
import InvoiceView from './InvoiceView';
import BusinessList from './BusinessList';

export default function Router() {
  const path = window.location.pathname;
  const pathParts = path.split('/').filter(Boolean);

  // Route matching
  if (path === '/' || path === '/dashboard') {
    return <Dashboard />;
  }

  if (path === '/invoices') {
    return <InvoiceList />;
  }

  if (path === '/invoices/new') {
    return <InvoiceForm />;
  }

  if (pathParts[0] === 'invoices' && pathParts[2] === 'edit') {
    const invoiceId = parseInt(pathParts[1]);
    if (invoiceId) {
      return <InvoiceForm invoiceId={invoiceId} />;
    }
  }

  if (pathParts[0] === 'invoices' && pathParts[2] === 'view') {
    const invoiceId = parseInt(pathParts[1]);
    if (invoiceId) {
      return <InvoiceView invoiceId={invoiceId} />;
    }
  }

  if (path === '/businesses') {
    return <BusinessList />;
  }

  // 404 fallback
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900">Strona nie znaleziona</h1>
      <p className="mt-2 text-gray-600">Żądana strona nie istnieje.</p>
      <a href="/" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
        Powrót do Dashboard
      </a>
    </div>
  );
}
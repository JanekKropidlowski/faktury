import React, { useState, useEffect } from 'react';
import { Business } from '../types';
import { apiService } from '../services/api';
import { Plus, Edit, Trash2, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import BusinessForm from './BusinessForm';

export default function BusinessList() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBusinesses();
      setBusinesses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (businessData: any) => {
    try {
      if (editingBusiness) {
        await apiService.updateBusiness(editingBusiness.id, businessData);
      } else {
        await apiService.createBusiness(businessData);
      }
      await loadBusinesses();
      setShowForm(false);
      setEditingBusiness(null);
    } catch (err: any) {
      throw err;
    }
  };

  const handleEdit = (business: Business) => {
    setEditingBusiness(business);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Czy na pewno chcesz usunąć tę działalność?')) {
      return;
    }

    try {
      await apiService.deleteBusiness(id);
      await loadBusinesses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await apiService.activateBusiness(id);
      await loadBusinesses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };

  if (showForm) {
    return (
      <BusinessForm
        business={editingBusiness}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingBusiness(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Działalności</h1>
          <p className="mt-2 text-sm text-gray-700">
            Zarządzaj swoimi działalnościami gospodarczymi. Jedna działalność może być aktywna w danym momencie.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj działalność
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Błąd</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {businesses.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Brak działalności</h3>
          <p className="mt-1 text-sm text-gray-500">
            Zacznij od utworzenia pierwszej działalności.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <div
              key={business.id}
              className={`bg-white overflow-hidden shadow rounded-lg border-2 ${
                business.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{business.name}</h3>
                  {business.is_active && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Sprzedawca:</span> {business.seller_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Limit miesięczny:</span> {formatCurrency(business.monthly_limit)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Limit roczny:</span> {formatCurrency(business.yearly_limit)}
                  </p>
                </div>

                <div className="mt-6 flex justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(business)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edytuj
                    </button>
                    <button
                      onClick={() => handleDelete(business.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Usuń
                    </button>
                  </div>

                  {!business.is_active && (
                    <button
                      onClick={() => handleActivate(business.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Aktywuj
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
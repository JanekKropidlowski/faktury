import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Business } from '../types';
import { apiService } from '../services/api';
import { LogOut, Settings, FileText, BarChart3, Building2, ChevronDown } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const data = await apiService.getBusinesses();
      setBusinesses(data);
      const active = data.find((b: Business) => b.is_active);
      setActiveBusiness(active || null);
    } catch (error) {
      console.error('Błąd ładowania działalności:', error);
    }
  };

  const switchBusiness = async (businessId: number) => {
    try {
      await apiService.activateBusiness(businessId);
      await loadBusinesses();
      setShowBusinessDropdown(false);
      window.location.reload(); // Refresh to update dashboard
    } catch (error) {
      console.error('Błąd przełączania działalności:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Błąd wylogowywania:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">System Fakturowania</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Business Selector */}
              {businesses.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowBusinessDropdown(!showBusinessDropdown)}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    <span>{activeBusiness ? activeBusiness.name : 'Wybierz działalność'}</span>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </button>

                  {showBusinessDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        {businesses.map((business) => (
                          <button
                            key={business.id}
                            onClick={() => switchBusiness(business.id)}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                              business.is_active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {business.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-sm text-gray-600">
                {user?.name}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Wyloguj
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a
              href="/"
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </a>
            <a
              href="/invoices"
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Faktury
            </a>
            <a
              href="/businesses"
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Działalności
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}
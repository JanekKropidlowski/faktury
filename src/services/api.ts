const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Wystąpił błąd');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request('/me');
  }

  // Businesses
  async getBusinesses() {
    return this.request('/businesses');
  }

  async createBusiness(business: any) {
    return this.request('/businesses', {
      method: 'POST',
      body: JSON.stringify(business),
    });
  }

  async updateBusiness(id: number, business: any) {
    return this.request(`/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(business),
    });
  }

  async activateBusiness(id: number) {
    return this.request(`/businesses/${id}/activate`, {
      method: 'PUT',
    });
  }

  async deleteBusiness(id: number) {
    return this.request(`/businesses/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard
  async getDashboard() {
    return this.request('/dashboard');
  }

  // Invoices
  async getInvoices(params?: { search?: string; month?: number; year?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());
    
    const query = queryParams.toString();
    return this.request(`/invoices${query ? `?${query}` : ''}`);
  }

  async getInvoice(id: number) {
    return this.request(`/invoices/${id}`);
  }

  async createInvoice(invoice: any) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  }

  async updateInvoice(id: number, invoice: any) {
    return this.request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice),
    });
  }

  async deleteInvoice(id: number) {
    return this.request(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
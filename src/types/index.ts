export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Business {
  id: number;
  user_id: number;
  name: string;
  seller_name: string;
  seller_address: string;
  seller_nip?: string;
  seller_bank_account?: string;
  monthly_limit: number;
  yearly_limit: number;
  is_active: boolean;
  created_at: string;
}

export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total_price: number;
}

export interface Invoice {
  id: number;
  business_id: number;
  invoice_number: string;
  issue_date: string;
  buyer_name: string;
  buyer_address: string;
  buyer_nip?: string;
  notes?: string;
  total_amount: number;
  created_at: string;
  items?: InvoiceItem[];
}

export interface InvoiceWithBusiness extends Invoice {
  seller_name: string;
  seller_address: string;
  seller_nip?: string;
  seller_bank_account?: string;
}

export interface DashboardData {
  hasActiveBusiness: boolean;
  business?: Business;
  monthlyRevenue: number;
  yearlyRevenue: number;
  monthlyLimitRemaining: number;
  yearlyLimitRemaining: number;
  recentInvoices: Invoice[];
}
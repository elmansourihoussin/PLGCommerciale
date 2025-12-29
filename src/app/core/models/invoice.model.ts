export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
}

export interface Invoice {
  id: string;
  number: string;
  client?: {
    id?: string;
    name?: string;
  };
  clientId: string;
  clientName?: string;
  title: string;
  date: Date;
  dueDate: Date;
  lines: InvoiceLine[];
  subtotal: number;
  defaultTaxRate?: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  paymentMethod?: 'cash' | 'check' | 'bank_transfer' | 'card';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

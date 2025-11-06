export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName?: string;
  title: string;
  date: Date;
  dueDate: Date;
  lines: InvoiceLine[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  paymentMethod?: 'cash' | 'check' | 'bank_transfer' | 'card';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  number: string;
  clientId: string;
  clientName?: string;
  title: string;
  date: Date;
  validUntil: Date;
  lines: QuoteLine[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

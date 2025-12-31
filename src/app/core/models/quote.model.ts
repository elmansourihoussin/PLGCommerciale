export interface QuoteLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
  articleId?: string;
}

export interface Quote {
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
  validUntil: Date;
  lines: QuoteLine[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

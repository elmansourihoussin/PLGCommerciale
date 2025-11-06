export interface Check {
  id: string;
  number: string;
  clientId: string;
  clientName?: string;
  amount: number;
  date: Date;
  beneficiary: string;
  bankName?: string;
  status: 'pending' | 'printed' | 'cashed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CheckStatus = 'PENDING' | 'CASHED' | 'CANCELLED';

export interface Check {
  id: string;
  clientId: string;
  clientName?: string;
  amount: number;
  dueDate: Date;
  status: CheckStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

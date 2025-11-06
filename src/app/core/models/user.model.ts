export interface User {
  id: string;
  email: string;
  name: string;
  companyId?: string;
  role: 'admin' | 'user';
  subscription?: {
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt?: Date;
  };
  createdAt: Date;
}

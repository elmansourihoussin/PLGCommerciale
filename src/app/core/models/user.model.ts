export interface User {
  id: string;
  tenantId?: string;
  email: string;
  name: string;
  companyId?: string;
  role: 'admin' | 'user' | 'owner';
  isActive?: boolean;
  subscription?: {
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt?: Date;
  };
  createdAt: Date;
  updatedAt?: Date;
}

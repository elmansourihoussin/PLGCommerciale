export interface PlatformSubscription {
  plan?: string;
  status?: string;
}

export interface PlatformTenant {
  id: string;
  name: string;
  email?: string;
  isActive: boolean;
  subscription?: PlatformSubscription;
  createdAt?: Date;
}

export interface PlatformTenantHistoryEntry {
  id: string;
  plan?: string;
  status?: string;
  action?: string;
  note?: string;
  createdAt?: Date;
}

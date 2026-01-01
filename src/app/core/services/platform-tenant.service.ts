import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { PlatformTenant, PlatformTenantHistoryEntry } from '../models/platform-tenant.model';

interface ApiTenant {
  id?: string;
  name?: string;
  email?: string;
  isActive?: boolean;
  subscription?: {
    plan?: string;
    status?: string;
  };
  createdAt?: string;
}

interface TenantsListResponse {
  data?: ApiTenant[];
  tenants?: ApiTenant[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface TenantResponse {
  data?: ApiTenant;
  tenant?: ApiTenant;
}

interface HistoryResponse {
  data?: PlatformTenantHistoryEntry[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PlatformTenantService {
  private tenantsSignal = signal<PlatformTenant[]>([]);
  tenants = this.tenantsSignal.asReadonly();
  private totalCountSignal = signal<number | null>(null);
  totalCount = this.totalCountSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private configService: AppConfigService
  ) {}

  list(params?: { search?: string; page?: number; limit?: number }): Promise<PlatformTenant[]> {
    const url = new URL(`${this.configService.apiBaseUrl}/api/platform/tenants`);
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.page) url.searchParams.set('page', String(params.page));
    if (params?.limit) url.searchParams.set('limit', String(params.limit));
    return firstValueFrom(this.http.get<TenantsListResponse | ApiTenant[]>(url.toString()))
      .then((response) => {
        const { tenants, total } = this.normalizeList(response);
        this.tenantsSignal.set(tenants);
        if (typeof total === 'number') {
          this.totalCountSignal.set(total);
        }
        return tenants;
      });
  }

  getById(id: string): Promise<PlatformTenant> {
    const url = `${this.configService.apiBaseUrl}/api/platform/tenants/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.get<TenantResponse | ApiTenant>(url))
      .then((response) => this.normalizeTenant(response));
  }

  create(payload: { name: string; email?: string }): Promise<PlatformTenant> {
    const url = `${this.configService.apiBaseUrl}/api/platform/tenants`;
    return firstValueFrom(this.http.post<TenantResponse | ApiTenant>(url, payload))
      .then((response) => this.normalizeTenant(response, payload));
  }

  updateStatus(id: string, isActive: boolean): Promise<PlatformTenant> {
    const url = `${this.configService.apiBaseUrl}/api/platform/tenants/${encodeURIComponent(id)}/status`;
    return firstValueFrom(this.http.patch<TenantResponse | ApiTenant>(url, { isActive }))
      .then((response) => this.normalizeTenant(response));
  }

  updateSubscription(id: string, payload: { plan?: string; status?: string }): Promise<PlatformTenant> {
    const url = `${this.configService.apiBaseUrl}/api/platform/tenants/${encodeURIComponent(id)}/subscription`;
    return firstValueFrom(this.http.patch<TenantResponse | ApiTenant>(url, payload))
      .then((response) => this.normalizeTenant(response));
  }

  getBillingHistory(id: string, params?: { page?: number; limit?: number }): Promise<{ entries: PlatformTenantHistoryEntry[]; meta?: HistoryResponse['meta'] }> {
    const url = new URL(`${this.configService.apiBaseUrl}/api/platform/tenants/${encodeURIComponent(id)}/billing-history`);
    if (params?.page) url.searchParams.set('page', String(params.page));
    if (params?.limit) url.searchParams.set('limit', String(params.limit));
    return firstValueFrom(this.http.get<HistoryResponse>(url.toString()))
      .then((response) => ({
        entries: (response.data ?? []).map(entry => ({
          ...entry,
          createdAt: entry.createdAt ? new Date(entry.createdAt) : undefined
        })),
        meta: response.meta
      }));
  }

  private normalizeList(response: TenantsListResponse | ApiTenant[]): { tenants: PlatformTenant[]; total?: number } {
    const list = Array.isArray(response) ? response : response.data ?? response.tenants ?? [];
    const tenants = list.map((tenant) => this.normalizeTenant(tenant));
    const total = !Array.isArray(response) ? response.meta?.total : undefined;
    return { tenants, total };
  }

  private normalizeTenant(response: TenantResponse | ApiTenant, fallback?: Partial<ApiTenant>): PlatformTenant {
    const tenant = this.extractTenant(response);
    return {
      id: tenant.id ?? '',
      name: tenant.name ?? fallback?.name ?? '',
      email: tenant.email ?? fallback?.email,
      isActive: tenant.isActive ?? false,
      subscription: tenant.subscription,
      createdAt: tenant.createdAt ? new Date(tenant.createdAt) : undefined
    };
  }

  private extractTenant(response: TenantResponse | ApiTenant): ApiTenant {
    if (this.isTenantResponse(response)) {
      return response.data ?? response.tenant ?? {};
    }
    return response;
  }

  private isTenantResponse(response: TenantResponse | ApiTenant): response is TenantResponse {
    return 'data' in response || 'tenant' in response;
  }
}

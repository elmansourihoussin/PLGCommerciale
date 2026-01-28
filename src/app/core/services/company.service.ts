import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Company } from '../models/company.model';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from './auth.service';

interface TenantResponse {
  data?: ApiTenant;
  tenant?: ApiTenant;
}

interface ApiTenant {
  id?: string;
  name?: string;
  companyName?: string;
  logo?: string;
  logoUrl?: string;
  logo_url?: string;
  ice?: string;
  email?: string;
  companyEmail?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxNumber?: string;
  legalText?: string;
  legalMentions?: string;
  website?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private companySignal = signal<Company | null>(null);
  company = this.companySignal.asReadonly();

  constructor(
    private http: HttpClient,
    private configService: AppConfigService,
    private authService: AuthService
  ) {
    this.refresh().catch(() => {
      // Keep cached company if API is unavailable.
    });
  }

  refresh(): Promise<Company | null> {
    const url = `${this.configService.apiBaseUrl}/api/tenant/me`;
    return firstValueFrom(this.http.get<TenantResponse | ApiTenant>(url, { headers: this.authHeaders() }))
      .then((response) => {
        const current = this.companySignal() ?? {};
        const company = this.normalizeCompany(response, current);
        this.companySignal.set(company);
        return company;
      })
      .catch((error) => {
        if (!this.companySignal()) {
          throw error;
        }
        return this.companySignal();
      });
  }

  update(updates: Partial<Company>): Promise<Company> {
    const url = `${this.configService.apiBaseUrl}/api/tenant/me`;
    const payload = this.toApiPayload(updates);
    return firstValueFrom(this.http.patch<TenantResponse | ApiTenant>(url, payload, { headers: this.authHeaders() }))
      .then((response) => {
        const current = this.companySignal() ?? {};
        const company = this.normalizeCompany(response, { ...current, ...updates });
        this.companySignal.set(company);
        return company;
      });
  }

  uploadLogo(file: File): Promise<Company> {
    const url = `${this.configService.apiBaseUrl}/api/tenant/me/logo`;
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.patch<TenantResponse | ApiTenant>(url, formData, { headers: this.authHeaders() }))
      .then((response) => {
        const current = this.companySignal() ?? {};
        const company = this.normalizeCompany(response ?? {}, current);
        this.companySignal.set(company);
        return company;
      });
  }

  private normalizeCompany(response: TenantResponse | ApiTenant, fallback: Partial<Company>): Company {
    const tenant = this.extractTenant(response);

    return {
      id: tenant.id ?? fallback.id ?? '1',
      name: tenant.name ?? tenant.companyName ?? fallback.name ?? '',
      logo: this.resolveLogoUrl(tenant.logo ?? tenant.logoUrl ?? tenant.logo_url ?? fallback.logo),
      ice: tenant.ice ?? fallback.ice ?? '',
      email: tenant.email ?? tenant.companyEmail ?? fallback.email ?? '',
      phone: tenant.phone ?? fallback.phone ?? '',
      address: tenant.address ?? fallback.address ?? '',
      city: tenant.city ?? fallback.city ?? '',
      country: tenant.country ?? fallback.country ?? '',
      taxNumber: tenant.taxNumber ?? fallback.taxNumber,
      legalText: tenant.legalText ?? tenant.legalMentions ?? fallback.legalText,
      website: tenant.website ?? fallback.website
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

  private toApiPayload(updates: Partial<Company>) {
    return {
      name: updates.name,
      ice: updates.ice,
      email: updates.email,
      phone: updates.phone,
      address: updates.address,
      city: updates.city,
      country: updates.country,
      taxNumber: updates.taxNumber,
      legalText: updates.legalText,
      website: updates.website
    };
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.accessToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  logoUrl(): string {
    const base = this.configService.apiBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    const origin = base ? new URL(base, base).origin : '';
    return `${origin}`;
  }

  private resolveLogoUrl(raw?: string): string | undefined {
    if (!raw) {
      return undefined;
    }
    if (/^https?:\/\//i.test(raw)) {
      return raw;
    }
    const base = this.logoUrl();
    if (!base) {
      return raw.startsWith('/') ? raw : `/${raw}`;
    }
    if (raw.startsWith('/')) {
      return `${base}${raw}`;
    }
    return `${base}/${raw}`;
  }
}

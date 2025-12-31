import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Check, CheckStatus } from '../models/check.model';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from './auth.service';

export interface CreateCheckPayload {
  clientId: string;
  amount: number;
  status: CheckStatus;
  dueDate: string;
}

export type UpdateCheckPayload = Partial<CreateCheckPayload>;

interface ApiCheck {
  id?: string;
  clientId?: string;
  clientName?: string;
  amount?: number;
  status?: CheckStatus;
  dueDate?: string;
  date?: string;
  client?: { name?: string };
  createdAt?: string;
  updatedAt?: string;
}

interface CheckResponse {
  data?: ApiCheck;
  cheque?: ApiCheck;
  check?: ApiCheck;
}

interface CheckListResponse {
  data?: ApiCheck[];
  cheques?: ApiCheck[];
  checks?: ApiCheck[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CheckService {
  private checksSignal = signal<Check[]>([]);
  checks = this.checksSignal.asReadonly();
  private totalCountSignal = signal<number | null>(null);
  totalCount = this.totalCountSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private configService: AppConfigService,
    private authService: AuthService
  ) {}

  list(params?: { status?: CheckStatus; clientId?: string; page?: number; limit?: number }): Promise<Check[]> {
    const url = new URL(`${this.configService.apiBaseUrl}/api/cheques`);
    if (params?.status) url.searchParams.set('status', params.status);
    if (params?.clientId) url.searchParams.set('clientId', params.clientId);
    if (params?.page) url.searchParams.set('page', String(params.page));
    if (params?.limit) url.searchParams.set('limit', String(params.limit));

    return firstValueFrom(this.http.get<CheckListResponse | ApiCheck[]>(url.toString(), { headers: this.authHeaders() }))
      .then((response) => {
        const { checks, total } = this.normalizeList(response);
        this.checksSignal.set(checks);
        if (typeof total === 'number') {
          this.totalCountSignal.set(total);
        }
        return checks;
      });
  }

  getById(id: string): Promise<Check> {
    const url = `${this.configService.apiBaseUrl}/api/cheques/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.get<CheckResponse | ApiCheck>(url, { headers: this.authHeaders() }))
      .then((response) => this.normalizeCheck(response));
  }

  create(payload: CreateCheckPayload): Promise<Check> {
    const url = `${this.configService.apiBaseUrl}/api/cheques`;
    return firstValueFrom(this.http.post<CheckResponse | ApiCheck>(url, payload, { headers: this.authHeaders() }))
      .then((response) => this.normalizeCheck(response, payload));
  }

  update(id: string, payload: UpdateCheckPayload): Promise<Check> {
    const url = `${this.configService.apiBaseUrl}/api/cheques/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.patch<CheckResponse | ApiCheck>(url, payload, { headers: this.authHeaders() }))
      .then((response) => this.normalizeCheck(response));
  }

  delete(id: string): Promise<void> {
    const url = `${this.configService.apiBaseUrl}/api/cheques/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.delete<void>(url, { headers: this.authHeaders() }))
      .then(() => undefined);
  }

  fetchCount(params?: { status?: CheckStatus; clientId?: string }): Promise<number> {
    const url = new URL(`${this.configService.apiBaseUrl}/api/cheques`);
    if (params?.status) url.searchParams.set('status', params.status);
    if (params?.clientId) url.searchParams.set('clientId', params.clientId);
    url.searchParams.set('page', '1');
    url.searchParams.set('limit', '1');
    return firstValueFrom(this.http.get<CheckListResponse | ApiCheck[]>(url.toString(), { headers: this.authHeaders() }))
      .then((response) => {
        if (!Array.isArray(response) && typeof response.meta?.total === 'number') {
          return response.meta.total;
        }
        const list = Array.isArray(response) ? response : response.data ?? response.cheques ?? response.checks ?? [];
        return list.length;
      });
  }

  private normalizeList(response: CheckListResponse | ApiCheck[]): { checks: Check[]; total?: number } {
    const list = Array.isArray(response) ? response : response.data ?? response.cheques ?? response.checks ?? [];
    const checks = list.map((check) => this.normalizeCheck(check));
    const total = !Array.isArray(response) ? response.meta?.total : undefined;
    return { checks, total };
  }

  private normalizeCheck(response: CheckResponse | ApiCheck, fallback?: CreateCheckPayload): Check {
    const check = this.extractCheck(response);
    return {
      id: check.id ?? '',
      clientId: check.clientId ?? fallback?.clientId ?? '',
      clientName: check.client?.name ?? check.clientName,
      amount: check.amount ?? fallback?.amount ?? 0,
      status: check.status ?? fallback?.status ?? 'PENDING',
      dueDate: check.dueDate
        ? new Date(check.dueDate)
        : check.date
          ? new Date(check.date)
          : new Date(),
      createdAt: check.createdAt ? new Date(check.createdAt) : undefined,
      updatedAt: check.updatedAt ? new Date(check.updatedAt) : undefined
    };
  }

  private extractCheck(response: CheckResponse | ApiCheck): ApiCheck {
    if (this.isCheckResponse(response)) {
      return response.data ?? response.cheque ?? response.check ?? {};
    }
    return response;
  }

  private isCheckResponse(response: CheckResponse | ApiCheck): response is CheckResponse {
    return 'data' in response || 'cheque' in response || 'check' in response;
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.accessToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}

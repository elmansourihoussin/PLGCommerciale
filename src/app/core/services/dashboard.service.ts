import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';

export interface DashboardOverview {
  clientsActive: number;
  quotesTotal: number;
  quotesByStatus: Record<string, number>;
  invoicesTotal: number;
  invoicesByStatus: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private http: HttpClient,
    private configService: AppConfigService
  ) {}

  getOverview(): Promise<DashboardOverview> {
    const url = `${this.configService.apiBaseUrl}/api/dashboard/overview`;
    return firstValueFrom(this.http.get<any>(url))
      .then((response) => {
        const data = response?.data ?? response ?? {};
        return {
          clientsActive: this.toNumber(data.clientsActive ?? data.clients ?? data.clientsCount),
          quotesTotal: this.toNumber(data.quotesTotal ?? data.quotes ?? data.quotesCount),
          quotesByStatus: data.quotesByStatus ?? data.quoteStatusCounts ?? {},
          invoicesTotal: this.toNumber(data.invoicesTotal ?? data.invoices ?? data.invoicesCount),
          invoicesByStatus: data.invoicesByStatus ?? data.invoiceStatusCounts ?? {}
        };
      });
  }

  private toNumber(value: unknown): number {
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }
}

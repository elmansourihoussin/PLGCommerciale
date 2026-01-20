import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  apiBaseUrl: string;
  platformApiKey?: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private config: AppConfig | null = null;

  constructor(private http: HttpClient) {}

  load(): Promise<void> {
    return firstValueFrom(this.http.get<AppConfig>('assets/app-config.json'))
      .then((config) => {
        this.config = config;
      })
      .catch(() => {
        this.config = { apiBaseUrl: '' };
      });
  }

  get apiBaseUrl(): string {
    return this.config?.apiBaseUrl ?? '';
  }

  get platformApiKey(): string {
    return this.config?.platformApiKey ?? '';
  }
}

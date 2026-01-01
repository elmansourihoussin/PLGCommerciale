import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';

interface PlatformLoginResponse {
  data?: {
    accessToken?: string;
  };
  accessToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlatformAuthService {
  private storageKey = 'platform.accessToken';
  private accessTokenSignal = signal<string | null>(null);
  accessToken = this.accessTokenSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private configService: AppConfigService
  ) {
    this.loadToken();
  }

  async login(payload: { email: string; password: string }): Promise<void> {
    const url = `${this.configService.apiBaseUrl}/api/platform/auth/login`;
    const response = await firstValueFrom(this.http.post<PlatformLoginResponse>(url, payload));
    const token = response.data?.accessToken ?? response.accessToken ?? null;
    if (!token) {
      throw new Error('Token manquant');
    }
    this.accessTokenSignal.set(token);
    this.saveToken(token);
  }

  logout(): void {
    this.accessTokenSignal.set(null);
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // ignore
    }
  }

  private loadToken(): void {
    if (typeof window === 'undefined') return;
    try {
      const token = localStorage.getItem(this.storageKey);
      if (token) {
        this.accessTokenSignal.set(token);
      }
    } catch {
      // ignore
    }
  }

  private saveToken(token: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, token);
    } catch {
      // ignore
    }
  }
}

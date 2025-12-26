import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';
import { AppConfigService } from '../config/app-config.service';

export interface RegisterPayload {
  companyName: string;
  phone: string;
  companyEmail: string;
  password: string;
  fullName: string;
}

interface ApiUser {
  id: string;
  tenantId?: string;
  email: string;
  fullName?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface LoginResponse {
  data: {
    user: ApiUser;
    accessToken: string;
    refreshToken: string;
  };
}

type RegisterResponse = User | { user: User };

const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';
const CURRENT_USER_KEY = 'auth.currentUser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  currentUser = this.currentUserSignal.asReadonly();
  private accessTokenSignal = signal<string | null>(null);
  accessToken = this.accessTokenSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private configService: AppConfigService
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    if (userJson) {
      this.currentUserSignal.set(JSON.parse(userJson));
    }
    this.accessTokenSignal.set(localStorage.getItem(ACCESS_TOKEN_KEY));
  }

  login(email: string, password: string): Promise<User> {
    const url = `${this.configService.apiBaseUrl}/api/auth/login`;
    return firstValueFrom(this.http.post<LoginResponse>(url, { email, password }))
      .then((response) => {
        const user = this.normalizeUser(response.data.user, { email, name: response.data.user.fullName ?? email });
        this.currentUserSignal.set(user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        this.persistTokens(response.data.accessToken, response.data.refreshToken);
        return user;
      });
  }

  register(payload: RegisterPayload): Promise<User> {
    const url = `${this.configService.apiBaseUrl}/api/auth/register`;
    return firstValueFrom(this.http.post<RegisterResponse>(url, payload))
      .then((response) => {
        const user = this.normalizeUser(response, { email: payload.companyEmail, name: payload.fullName });
        this.currentUserSignal.set(user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user;
      });
  }

  logout() {
    this.currentUserSignal.set(null);
    this.accessTokenSignal.set(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  resetPassword(email: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  private normalizeUser(response: RegisterResponse | ApiUser, fallback: { email: string; name: string }): User {
    const user = 'user' in response ? response.user : response;
    const name = 'fullName' in user
      ? (user.fullName ?? fallback.name)
      : ('name' in user ? user.name ?? fallback.name : fallback.name);
    const role = (user.role ?? 'user').toString().toLowerCase();

    return {
      id: user.id ?? '1',
      tenantId: 'tenantId' in user ? user.tenantId : undefined,
      email: user.email ?? fallback.email,
      name,
      role: role === 'owner' ? 'owner' : role === 'admin' ? 'admin' : 'user',
      isActive: 'isActive' in user ? user.isActive : undefined,
      subscription: 'subscription' in user ? user.subscription : undefined,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      updatedAt: 'updatedAt' in user && user.updatedAt ? new Date(user.updatedAt) : undefined
    };
  }

  private persistTokens(accessToken: string, refreshToken: string) {
    this.accessTokenSignal.set(accessToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

export interface CreateUserPayload {
  fullName: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'AGENT';
  password: string;
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password'>>;

export interface UpdateUserPasswordPayload {
  password: string;
}

export interface UpdateUserStatusPayload {
  isActive: boolean;
}

export interface UpdateMyPasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface ApiUser {
  id?: string;
  email?: string;
  fullName?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UsersListResponse {
  data?: ApiUser[];
  users?: ApiUser[];
}

interface UserResponse {
  data?: ApiUser;
  user?: ApiUser;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient,
    private configService: AppConfigService,
    private authService: AuthService
  ) {}

  list(): Promise<User[]> {
    const url = `${this.configService.apiBaseUrl}/api/users`;
    return firstValueFrom(this.http.get<UsersListResponse | ApiUser[]>(url, { headers: this.authHeaders() }))
      .then((response) => this.normalizeList(response));
  }

  create(payload: CreateUserPayload): Promise<User> {
    const url = `${this.configService.apiBaseUrl}/api/users`;
    return firstValueFrom(this.http.post<UserResponse | ApiUser>(url, payload, { headers: this.authHeaders() }))
      .then((response) => this.normalizeUser(response));
  }

  update(id: string, payload: UpdateUserPayload): Promise<User> {
    const url = `${this.configService.apiBaseUrl}/api/users/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.patch<UserResponse | ApiUser>(url, payload, { headers: this.authHeaders() }))
      .then((response) => this.normalizeUser(response));
  }

  delete(id: string): Promise<void> {
    const url = `${this.configService.apiBaseUrl}/api/users/${encodeURIComponent(id)}`;
    return firstValueFrom(this.http.delete<void>(url, { headers: this.authHeaders() }))
      .then(() => undefined);
  }

  updatePassword(id: string, payload: UpdateUserPasswordPayload): Promise<void> {
    const url = `${this.configService.apiBaseUrl}/api/users/${encodeURIComponent(id)}/password`;
    return firstValueFrom(this.http.patch<void>(url, payload, { headers: this.authHeaders() }))
      .then(() => undefined);
  }

  updateStatus(id: string, payload: UpdateUserStatusPayload): Promise<void> {
    const url = `${this.configService.apiBaseUrl}/api/users/${encodeURIComponent(id)}/status`;
    return firstValueFrom(this.http.patch<void>(url, payload, { headers: this.authHeaders() }))
      .then(() => undefined);
  }

  changeMyPassword(payload: UpdateMyPasswordPayload): Promise<void> {
    const url = `${this.configService.apiBaseUrl}/api/users/me/password`;
    return firstValueFrom(this.http.patch<void>(url, payload, { headers: this.authHeaders() }))
      .then(() => undefined);
  }

  private normalizeList(response: UsersListResponse | ApiUser[]): User[] {
    const list = Array.isArray(response) ? response : response.data ?? response.users ?? [];
    return list.map((user) => this.normalizeUser(user));
  }

  private normalizeUser(response: UserResponse | ApiUser): User {
    const user = this.extractUser(response);
    const role = (user.role ?? 'agent').toString().toLowerCase();
    return {
      id: user.id ?? '',
      email: user.email ?? '',
      name: user.fullName ?? '',
      role: role === 'owner' ? 'owner' : role === 'admin' ? 'admin' : 'agent',
      isActive: user.isActive ?? true,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined
    };
  }

  private extractUser(response: UserResponse | ApiUser): ApiUser {
    if (this.isUserResponse(response)) {
      return response.data ?? response.user ?? {};
    }
    return response;
  }

  private isUserResponse(response: UserResponse | ApiUser): response is UserResponse {
    return 'data' in response || 'user' in response;
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.accessToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
